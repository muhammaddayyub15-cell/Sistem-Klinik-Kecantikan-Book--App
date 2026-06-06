<?php

namespace App\Repositories;

use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

// OrderRepository: Query layer untuk tabel orders.
// Mewarisi operasi CRUD dasar dari BaseRepository.
class OrderRepository extends BaseRepository
{
    public function __construct(Order $model)
    {
        parent::__construct($model);
    }

    // findAllPaginated: Ambil semua order dengan pagination.
    // Dipakai admin untuk melihat seluruh order di sistem.
    public function findAllPaginated(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model
            ->with(['orderItems', 'payment', 'booking'])
            ->paginate($perPage);
    }

    // findByPatientIdSnapshot: Ambil semua order milik pasien berdasarkan snapshot ID.
    // Menggunakan patient_id_snapshot karena data pasien di-snapshot saat order dibuat.
    // Dipakai di endpoint GET /orders untuk patient — backend filter by token.
    public function findByPatientIdSnapshot(int $patientId): Collection
    {
        return $this->model
            ->with(['orderItems', 'payment', 'booking'])
            ->where('patient_id_snapshot', $patientId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // findByBookingId: Cari order berdasarkan booking_id.
    // Dipakai OrderService::createBookingOrder() untuk guard double order —
    // satu booking hanya boleh punya satu order aktif (non-cancelled).
    public function findByBookingId(int $bookingId): ?Order
    {
        return $this->model
            ->where('booking_id', $bookingId)
            ->whereNotIn('status', ['cancelled'])
            ->first();
    }

    // findByOrderNumber: Cari order berdasarkan order_number.
    // Dipakai saat webhook Midtrans masuk — Midtrans mengembalikan order_number
    // di field 'order_id' payload karena itulah yang dikirim saat initiate payment.
    public function findByOrderNumber(string $orderNumber): ?Order
    {
        return $this->model
            ->with(['orderItems', 'payment', 'booking'])
            ->where('order_number', $orderNumber)
            ->first();
    }

    // findByStatus: Filter order berdasarkan status (pending, paid, cancelled).
    public function findByStatus(string $status): Collection
    {
        return $this->model
            ->with(['orderItems', 'payment', 'booking'])
            ->where('status', $status)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // updateStatus: Update status order beserta timestamp terkait.
    // $timestamps: array opsional, misal ['paid_at' => now()] atau ['cancelled_at' => now()]
    public function updateStatus(int $orderId, string $status, array $timestamps = []): Order
    {
        $order = $this->findOrFail($orderId);
        $order->update(array_merge(['status' => $status], $timestamps));
        return $order->refresh();
    }

    // updateOrderNumber: Simpan order_number yang di-generate PaymentService.
    // Dipanggil tepat sebelum Snap request ke Midtrans agar order_number
    // sudah tersimpan sebelum kemungkinan webhook masuk lebih cepat.
    public function updateOrderNumber(int $orderId, string $orderNumber): Order
    {
        $order = $this->findOrFail($orderId);
        $order->update(['order_number' => $orderNumber]);
        return $order->refresh();
    }
}