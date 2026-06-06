<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Patient;
use App\Models\Product;
use App\Models\User;
use App\Repositories\OrderRepository;
use App\Repositories\OrderItemRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

// OrderService: Business logic untuk manajemen order.
//
// CATATAN ARSITEKTUR — MONOLITH:
// Tidak ada lagi HTTP calls ke Core Service atau Product Service.
// Patient, Booking, dan Product diambil langsung via Eloquent dari database yang sama.
// Snapshot tetap disimpan di order untuk menjaga immutability invoice.
//
// DUA SKENARIO ORDER:
//   1. Booking-only  → booking_id wajib, items kosong
//      total_amount  = booking.service.base_price
//   2. Product-only  → items wajib, booking_id opsional (Coming Soon)
//      total_amount  = sum(product.price * qty)
class OrderService extends BaseService
{
    public function __construct(
        protected OrderRepository     $orderRepository,
        protected OrderItemRepository $orderItemRepository
    ) {
        parent::__construct($orderRepository);
    }

    // =========================================================================
    // READ
    // =========================================================================

    // getAllOrders: Ambil semua order dengan pagination — admin only.
    public function getAllOrders(int $perPage = 15): LengthAwarePaginator
    {
        return $this->orderRepository->findAllPaginated($perPage);
    }

    // getOrderById: Ambil detail satu order beserta items dan payment.
    public function getOrderById(int $id): Model
    {
        return $this->orderRepository->findOrFail($id)
            ->load(['orderItems', 'payment', 'booking.service']);
    }

    // getOrdersByPatient: Ambil semua order milik pasien tertentu.
    public function getOrdersByPatient(int $patientId): Collection
    {
        return $this->orderRepository->findByPatientIdSnapshot($patientId);
    }

    // getOrdersByStatus: Filter order berdasarkan status — admin only.
    public function getOrdersByStatus(string $status): Collection
    {
        return $this->orderRepository->findByStatus($status);
    }

    // =========================================================================
    // CREATE
    // =========================================================================

    // createOrder: Buat order baru — dua skenario: booking-only atau product-only.
    //
    // Booking-only flow (fokus saat ini):
    //   1. Resolve patient dari token
    //   2. Load booking + service untuk ambil base_price
    //   3. Validasi booking milik patient yang login
    //   4. Buat order dengan total dari service.base_price
    //   5. Tidak ada order items — booking adalah "item"-nya
    //
    // Product-only flow (Coming Soon):
    //   1. Resolve patient dari token
    //   2. Lock & validasi stok produk
    //   3. Buat order + items + kurangi stok
    public function createOrder(array $data): Model
    {
        return DB::transaction(function () use ($data) {

            // ── 1. RESOLVE PATIENT ───────────────────────────────────────────
            // patient_id tidak dikirim dari FE — diambil dari token
            /** @var User $user */
            $user    = User::findOrFail(Auth::id());
            $patient = Patient::with('user')
                ->where('user_id', $user->user_id)
                ->firstOrFail();

            $patientName = $patient->user->full_name ?? 'Unknown';

            // ── 2. ROUTING: booking-only atau product-only ───────────────────
            $hasBooking = !empty($data['booking_id']);
            $hasItems   = !empty($data['items']);

            if ($hasBooking && !$hasItems) {
                // ── BOOKING-ONLY FLOW ────────────────────────────────────────
                return $this->createBookingOrder($data, $patient, $patientName);
            }

            // ── PRODUCT-ONLY FLOW (Coming Soon) ─────────────────────────────
            // Bisa juga booking + produk jika booking_id ikut dikirim
            return $this->createProductOrder($data, $patient, $patientName);
        });
    }

    // =========================================================================
    // PRIVATE — ORDER FLOWS
    // =========================================================================

    // createBookingOrder: Buat order untuk pembayaran booking consultation fee.
    // Total amount diambil dari service.base_price yang ada di booking.
    private function createBookingOrder(array $data, Patient $patient, string $patientName): Model
    {
        // Load booking + service untuk ambil base_price
        $booking = Booking::with('service')
            ->where('booking_id', $data['booking_id'])
            ->firstOrFail();

        // Guard: booking harus milik patient yang login
        if ((int) $booking->patient_id !== (int) $patient->patient_id) {
            throw ValidationException::withMessages([
                'booking_id' => 'Booking ini bukan milik Anda.',
            ]);
        }

        // Guard: booking harus masih pending — belum pernah dibayar
        if ($booking->status !== Booking::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'booking_id' => 'Booking ini sudah tidak dapat dibayar.',
            ]);
        }

        // Guard: booking belum punya order — cegah double order untuk booking yang sama
        $existingOrder = $this->orderRepository->findByBookingId($data['booking_id']);
        if ($existingOrder) {
            throw ValidationException::withMessages([
                'booking_id' => 'Order untuk booking ini sudah pernah dibuat.',
            ]);
        }

        // Total amount = base_price service yang di-booking
        $totalAmount = $booking->service->base_price ?? 0;

        $order = $this->orderRepository->create([
            'order_number'          => $this->generateOrderNumber(),
            'patient_id_snapshot'   => $patient->patient_id,
            'patient_name_snapshot' => $patientName,
            'booking_id'            => $booking->booking_id,
            'total_amount'          => $totalAmount,
            'status'                => 'pending',
        ]);

        // Booking-only order tidak punya order items —
        // service fee langsung dari booking.service.base_price

        return $this->orderRepository->findOrFail($order->order_id)
            ->load(['orderItems', 'payment', 'booking.service']);
    }

    // createProductOrder: Buat order untuk pembelian produk (Coming Soon).
    // Lock stok, validasi, snapshot, kurangi stok dalam satu transaction.
    private function createProductOrder(array $data, Patient $patient, string $patientName): Model
    {
        $productIds = collect($data['items'])->pluck('product_id');

        $products = Product::whereIn('product_id', $productIds)
            ->lockForUpdate() // cegah race condition stok
            ->get()
            ->keyBy('product_id');

        $items       = [];
        $totalAmount = 0;

        foreach ($data['items'] as $item) {
            $product = $products[$item['product_id']] ?? null;

            if (!$product) {
                throw ValidationException::withMessages([
                    'product' => "Produk ID {$item['product_id']} tidak ditemukan.",
                ]);
            }

            if ($product->stock_qty < $item['qty']) {
                throw ValidationException::withMessages([
                    'stock' => "Stok tidak mencukupi untuk produk: {$product->product_name}",
                ]);
            }

            $items[] = [
                'product_id_snapshot'   => $product->product_id,
                'product_name_snapshot' => $product->product_name,
                'unit_price_snapshot'   => $product->price,
                'qty'                   => $item['qty'],
            ];

            $totalAmount += $product->price * $item['qty'];
        }

        $order = $this->orderRepository->create([
            'order_number'          => $this->generateOrderNumber(),
            'patient_id_snapshot'   => $patient->patient_id,
            'patient_name_snapshot' => $patientName,
            'booking_id'            => $data['booking_id'] ?? null,
            'total_amount'          => $totalAmount,
            'status'                => 'pending',
        ]);

        $itemsInsert = collect($items)->map(fn ($item) => [
            ...$item,
            'order_id'   => $order->order_id,
            'created_at' => now(),
            'updated_at' => now(),
        ])->toArray();

        $this->orderItemRepository->createBulk($itemsInsert);

        foreach ($data['items'] as $item) {
            Product::where('product_id', $item['product_id'])
                ->decrement('stock_qty', $item['qty']);
        }

        return $this->orderRepository->findOrFail($order->order_id)
            ->load(['orderItems', 'payment', 'booking']);
    }

    // =========================================================================
    // STATUS UPDATE
    // =========================================================================

    // cancelOrder: Batalkan order — hanya bisa jika status masih pending.
    public function cancelOrder(int $id): Model
    {
        return DB::transaction(function () use ($id) {
            $order = $this->orderRepository->findOrFail($id);

            if ($order->status !== 'pending') {
                throw ValidationException::withMessages([
                    'status' => 'Hanya order dengan status pending yang dapat dibatalkan.',
                ]);
            }

            return $this->orderRepository->updateStatus($id, 'cancelled', [
                'cancelled_at' => now(),
            ]);
        });
    }

    // updateStatus: Update status order manual — admin only.
    public function updateStatus(int $id, array $data): Model
    {
        return DB::transaction(function () use ($id, $data) {
            $order = $this->orderRepository->findOrFail($id);

            if (in_array($order->status, ['cancelled'])) {
                throw ValidationException::withMessages([
                    'status' => 'Order yang sudah dibatalkan tidak dapat diubah statusnya.',
                ]);
            }

            return $this->orderRepository->updateStatus($id, $data['status'], [
                'paid_at'      => $data['status'] === 'paid'     ? now() : null,
                'cancelled_at' => $data['status'] === 'cancelled' ? now() : null,
            ]);
        });
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    // generateOrderNumber: Generate nomor order unik berformat ORD-YYYYMMDD-XXXX.
    // PaymentService akan override format ini dengan timestamp saat initiate payment.
    private function generateOrderNumber(): string
    {
        return 'ORD-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));
    }
}