<?php

namespace App\Repositories;

use App\Models\Payment;

// PaymentRepository: Query layer untuk tabel payments.
// Relasi 1:1 dengan orders — satu order hanya punya satu payment record.
// Mewarisi operasi CRUD dasar dari BaseRepository.
class PaymentRepository extends BaseRepository
{
    public function __construct(Payment $model)
    {
        parent::__construct($model);
    }

    // findByOrderId: Ambil payment berdasarkan order_id.
    // Dipakai saat cek status pembayaran dan saat webhook Midtrans masuk.
    public function findByOrderId(int $orderId): ?Payment
    {
        return $this->model->where('order_id', $orderId)->first();
    }

    // findByMidtransId: Cari payment berdasarkan transaction_id dari Midtrans.
    // Dipakai untuk lookup manual jika diperlukan via dashboard Midtrans.
    public function findByMidtransId(string $midtransId): ?Payment
    {
        return $this->model->where('midtrans_id', $midtransId)->first();
    }

    // updateStatus: Update status payment dan opsional kolom lain setelah webhook masuk.
    // $id     : payment_id (primary key)
    // $status : pending | success | failed | expired
    //           (mapping dari status Midtrans dilakukan di PaymentService sebelum masuk sini)
    // $extra  : kolom tambahan opsional, misal ['paid_at' => now(), 'midtrans_id' => '...']
    public function updateStatus(int $id, string $status, array $extra = []): Payment
    {
        $payment = $this->findOrFail($id);
        $payment->update(array_merge(['status' => $status], $extra));
        return $payment->refresh();
    }
}