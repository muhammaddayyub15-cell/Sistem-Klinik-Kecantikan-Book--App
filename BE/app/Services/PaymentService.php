<?php

namespace App\Services;

use App\Models\Order;
use App\Repositories\OrderRepository;
use App\Repositories\PaymentRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Snap;

// PaymentService: Business logic untuk pembayaran via Midtrans.
//
// ALUR PEMBAYARAN:
// 1. Client → POST /payments/initiate → initiate()
//    → Validasi order status pending
//    → Cegah duplicate payment
//    → Generate order_number unik (format: ORD-<timestamp>-<random>)
//    → Simpan order_number ke tabel orders (untuk lookup saat webhook)
//    → Buat payment record status pending
//    → Request Snap token ke Midtrans
//    → Return payment_url ke client untuk redirect
//
// 2. Midtrans → POST /payments/webhook → handleWebhook()
//    → Verifikasi signature key
//    → Lookup order via order_number di payload
//    → Update status payment + order sesuai transaction_status Midtrans
class PaymentService extends BaseService
{
    public function __construct(
        protected PaymentRepository $paymentRepository,
        protected OrderRepository   $orderRepository
    ) {
        parent::__construct($paymentRepository);
        $this->configureMidtrans();
    }

    // =========================================================================
    // PUBLIC
    // =========================================================================

    // getPaymentByOrderId: Ambil data payment berdasarkan order_id.
    public function getPaymentByOrderId(int $orderId): ?Model
    {
        return $this->paymentRepository->findByOrderId($orderId);
    }

    // initiate: Inisiasi pembayaran — buat payment record + minta Snap token ke Midtrans.
    // Return array berisi payment_url untuk redirect client ke halaman Midtrans.
    public function initiate(int $orderId): array
    {
        return DB::transaction(function () use ($orderId) {

            // [FIX] Load booking.service sekaligus — dibutuhkan buildSnapParams()
            //       untuk booking-only order yang tidak punya orderItems.
            $order = $this->orderRepository->findOrFail($orderId)
                ->load(['orderItems', 'booking.service']);

            // Validasi order harus pending sebelum bisa bayar
            if ($order->status !== 'pending') {
                throw new \Exception('Order tidak dalam status pending, pembayaran tidak dapat diproses.', 422);
            }

            // Cegah duplicate payment — satu order hanya boleh punya satu payment
            $existingPayment = $this->paymentRepository->findByOrderId($orderId);
            if ($existingPayment) {
                throw new \Exception('Pembayaran untuk order ini sudah pernah diinisiasi.', 422);
            }

            // Generate order_number unik dengan timestamp untuk dikirim ke Midtrans.
            // Format: ORD-<YYYYMMDDHHmmss>-<6 char random>
            // [NOTE] OrderService sudah generate order_number saat create order,
            //        tapi PaymentService override di sini karena format yang dikirim
            //        ke Midtrans harus unik per transaksi dan mengandung timestamp
            //        untuk memudahkan debug di Midtrans dashboard.
            $orderNumber = 'ORD-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(6));

            // Simpan order_number ke tabel orders sebelum call Midtrans.
            // Wajib disimpan lebih dulu agar webhook yang masuk bisa di-lookup.
            $this->orderRepository->updateOrderNumber($order->order_id, $orderNumber);

            // Buat payment record dengan status pending
            $this->paymentRepository->create([
                'order_id'        => $orderId,
                'midtrans_id'     => null,    // diisi saat webhook masuk
                'amount'          => $order->total_amount,
                'payment_method'  => null,    // diisi saat webhook masuk
                'payment_channel' => null,    // diisi saat webhook masuk
                'status'          => 'pending',
                'paid_at'         => null,
            ]);

            // Request Snap token ke Midtrans
            $snapToken  = Snap::getSnapToken($this->buildSnapParams($order, $orderNumber));
            $paymentUrl = $this->snapUrl($snapToken);

            return [
                'payment_url'  => $paymentUrl,   // URL redirect ke halaman Midtrans
                'order_number' => $orderNumber,
                'amount'       => $order->total_amount,
            ];
        });
    }

    // handleWebhook: Proses notifikasi pembayaran dari Midtrans.
    // Midtrans mengirim order_number kita di field 'order_id' payload.
    // Method ini harus idempotent — aman dipanggil lebih dari sekali dengan payload sama.
    public function handleWebhook(array $payload): void
    {
        $this->verifySignature($payload);

        DB::transaction(function () use ($payload) {

            // 'order_id' di payload Midtrans = order_number yang kita kirim saat initiate
            $orderNumber = $payload['order_id'];

            $order = $this->orderRepository->findByOrderNumber($orderNumber);
            if (!$order) return; // tolak webhook dengan order_number tidak dikenal

            $payment = $this->paymentRepository->findByOrderId($order->order_id);
            if (!$payment) return;

            // Idempotent guard — jangan proses ulang payment yang sudah final
            if (in_array($payment->status, ['success', 'failed', 'expired'])) {
                return;
            }

            // Update data Midtrans ke payment record
            $payment->update([
                'midtrans_id'     => $payload['transaction_id'] ?? null,
                'payment_method'  => $payload['payment_type']   ?? null,
                'payment_channel' => $payload['bank'] ?? $payload['acquirer'] ?? null,
            ]);

            $status = $payload['transaction_status'];
            $fraud  = $payload['fraud_status'] ?? null;

            match (true) {
                // capture (kartu kredit) tanpa fraud = lunas
                $status === 'capture' && $fraud === 'accept',
                // settlement = transfer bank / e-wallet berhasil
                $status === 'settlement'
                => $this->handleSettlement($payment),

                $status === 'expire'
                => $this->handleExpiry($payment),

                $status === 'cancel' || $status === 'deny'
                => $this->handleCancellation($payment),

                // pending, authorize — tidak ada aksi, tunggu webhook berikutnya
                default => null,
            };
        });
    }

    // =========================================================================
    // PRIVATE
    // =========================================================================

    private function configureMidtrans(): void
    {
        Config::$serverKey    = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized  = true;
        Config::$is3ds        = true;
    }

    // buildSnapParams: Susun parameter untuk Snap API Midtrans.
    //
    // [FIX] Midtrans wajib item_details tidak boleh kosong.
    //       Untuk booking-only order (orderItems = []), gunakan data dari
    //       booking.service sebagai satu item: service_name + base_price.
    //       Untuk product order, map dari orderItems seperti biasa.
    private function buildSnapParams(Order $order, string $orderNumber): array
    {
        $hasItems = $order->orderItems->isNotEmpty();

        if ($hasItems) {
            // Product order — item dari orderItems
            $itemDetails = $order->orderItems->map(fn ($item) => [
                'id'       => (string) $item->product_id_snapshot,
                'price'    => (int) $item->unit_price_snapshot,
                'quantity' => (int) $item->qty,
                'name'     => mb_substr($item->product_name_snapshot, 0, 50),
            ])->toArray();
        } else {
            // [FIX] Booking-only order — tidak ada orderItems.
            //       Midtrans tetap butuh item_details, isi dengan service dari booking.
            //       booking.service sudah di-load di initiate() sebelum method ini dipanggil.
            $serviceName  = $order->booking?->service?->service_name ?? 'Clinic Service';
            $servicePrice = (int) ($order->booking?->service?->base_price ?? $order->total_amount);

            $itemDetails = [[
                'id'       => 'SERVICE-' . ($order->booking?->booking_id ?? $order->order_id),
                'price'    => $servicePrice,
                'quantity' => 1,
                'name'     => mb_substr($serviceName, 0, 50),
            ]];
        }

        return [
            'transaction_details' => [
                'order_id'     => $orderNumber,
                'gross_amount' => (int) $order->total_amount,
            ],
            'customer_details' => [
                'first_name' => $order->patient_name_snapshot,
            ],
            'item_details' => $itemDetails,
        ];
    }

    // verifySignature: Verifikasi bahwa webhook benar-benar dari Midtrans.
    // Formula: SHA512(order_id + status_code + gross_amount + server_key)
    private function verifySignature(array $payload): void
    {
        $expected = hash(
            'sha512',
            ($payload['order_id']     ?? '') .
            ($payload['status_code']  ?? '') .
            ($payload['gross_amount'] ?? '') .
            config('midtrans.server_key')
        );

        if (($payload['signature_key'] ?? '') !== $expected) {
            throw new \Exception('Signature Midtrans tidak valid.', 403);
        }
    }

    // handleSettlement: Pembayaran berhasil — update payment success + order paid + notify patient.
    private function handleSettlement(Model $payment): void
    {
        $this->paymentRepository->updateStatus(
            $payment->payment_id,
            'success',
            ['paid_at' => now()]
        );

        $order = $this->orderRepository->updateStatus($payment->order_id, 'paid', [
            'paid_at' => now(),
        ]);

        // Load patient user untuk notifikasi — ambil via patient_id_snapshot
        $patient = \App\Models\Patient::with('user')
            ->where('patient_id', $order->patient_id_snapshot)
            ->first();

        if ($patient?->user) {
            $patient->user->notify(new \App\Notifications\PaymentSuccessNotification($order));
        }
    }

    // handleExpiry: Batas waktu pembayaran habis.
    private function handleExpiry(Model $payment): void
    {
        $this->paymentRepository->updateStatus($payment->payment_id, 'expired');

        $this->orderRepository->updateStatus($payment->order_id, 'cancelled', [
            'cancelled_at' => now(),
        ]);
    }

    // handleCancellation: Pembayaran dibatalkan atau ditolak.
    private function handleCancellation(Model $payment): void
    {
        $this->paymentRepository->updateStatus($payment->payment_id, 'failed');

        $this->orderRepository->updateStatus($payment->order_id, 'cancelled', [
            'cancelled_at' => now(),
        ]);
    }

    // snapUrl: Generate URL redirect ke halaman pembayaran Midtrans.
    private function snapUrl(string $token): string
    {
        $base = config('midtrans.is_production')
            ? 'https://app.midtrans.com'
            : 'https://app.sandbox.midtrans.com';

        return "{$base}/snap/v2/vtweb/{$token}";
    }
}