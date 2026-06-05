<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Product;
use App\Repositories\OrderRepository;
use App\Repositories\OrderItemRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

// OrderService: Business logic untuk manajemen order.
//
// CATATAN ARSITEKTUR — MONOLITH:
// Tidak ada lagi HTTP calls ke Core Service atau Product Service.
// Patient dan Product diambil langsung via Eloquent dari database yang sama.
// Snapshot tetap disimpan di order untuk menjaga immutability invoice.
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

    // getAllOrders: Ambil semua order dengan pagination — untuk admin.
    public function getAllOrders(int $perPage = 15): LengthAwarePaginator
    {
        return $this->orderRepository->findAllPaginated($perPage);
    }

    // getOrderById: Ambil detail satu order beserta items dan payment.
    public function getOrderById(int $id): Model
    {
        return $this->orderRepository->findOrFail($id)->load(['orderItems', 'payment', 'booking']);
    }

    // getOrdersByPatient: Ambil semua order milik pasien tertentu.
    // Menggunakan patient_id_snapshot karena data pasien di-snapshot saat order dibuat.
    public function getOrdersByPatient(int $patientId): Collection
    {
        return $this->orderRepository->findByPatientIdSnapshot($patientId);
    }

    // getOrdersByStatus: Filter order berdasarkan status.
    public function getOrdersByStatus(string $status): Collection
    {
        return $this->orderRepository->findByStatus($status);
    }

    // =========================================================================
    // CREATE
    // =========================================================================

    // createOrder: Buat order baru + snapshot patient & product + kurangi stok.
    //
    // Alur:
    // 1. Ambil patient dari DB via patient_id (bukan HTTP)
    // 2. Ambil semua produk sekaligus dengan lockForUpdate (cegah race condition stok)
    // 3. Validasi stok setiap produk
    // 4. Bangun item snapshot + hitung total
    // 5. Simpan order + items dalam satu transaction
    // 6. Kurangi stok setiap produk
    public function createOrder(array $data): Model
    {
        return DB::transaction(function () use ($data) {

            // ── 1. PATIENT SNAPSHOT ──────────────────────────────────────────
            // Ambil patient langsung dari DB — tidak perlu HTTP ke service lain
            $patient = Patient::with('user')->findOrFail($data['patient_id']);

            // Nama pasien diambil dari relasi user (kolom full_name ada di users)
            $patientName = $patient->user->full_name ?? 'Unknown';

            // ── 2. AMBIL PRODUK DENGAN LOCK ──────────────────────────────────
            $productIds = collect($data['items'])->pluck('product_id');

            $products = Product::whereIn('product_id', $productIds)
                ->lockForUpdate() // cegah race condition saat stok diakses bersamaan
                ->get()
                ->keyBy('product_id');

            // ── 3. VALIDASI & BUILD ITEMS ────────────────────────────────────
            $items       = [];
            $totalAmount = 0;

            foreach ($data['items'] as $item) {

                $product = $products[$item['product_id']] ?? null;

                if (!$product) {
                    throw ValidationException::withMessages([
                        'product' => "Produk ID {$item['product_id']} tidak ditemukan.",
                    ]);
                }

                // Validasi stok — gunakan stock_qty (nama kolom di migration)
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

            // ── 4. BUAT ORDER ────────────────────────────────────────────────
            $order = $this->orderRepository->create([
                'order_number'          => $this->generateOrderNumber(),
                'patient_id_snapshot'   => $patient->patient_id,
                'patient_name_snapshot' => $patientName,
                'booking_id'            => $data['booking_id'] ?? null, // FIX: FK hidup, bukan snapshot
                'total_amount'          => $totalAmount,
                'status'                => 'pending',
            ]);

            // ── 5. BULK INSERT ITEMS ─────────────────────────────────────────
            $itemsInsert = collect($items)->map(fn ($item) => [
                ...$item,
                'order_id'   => $order->order_id,
                'created_at' => now(),
                'updated_at' => now(),
            ])->toArray();

            $this->orderItemRepository->createBulk($itemsInsert);

            // ── 6. KURANGI STOK SETIAP PRODUK ───────────────────────────────
            foreach ($data['items'] as $item) {
                Product::where('product_id', $item['product_id'])
                    ->decrement('stock_qty', $item['qty']);
            }

            return $this->orderRepository->findOrFail($order->order_id)
                ->load(['orderItems', 'payment', 'booking']);
        });
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

    // =========================================================================
    // PRIVATE
    // =========================================================================

    // generateOrderNumber: Generate nomor order unik berformat ORD-YYYYMMDD-XXXX.
    // Dipakai sebagai order_number saat order dibuat.
    // PaymentService akan override ini dengan format timestamp saat initiate payment.
    private function generateOrderNumber(): string
    {
        return 'ORD-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));
    }
}