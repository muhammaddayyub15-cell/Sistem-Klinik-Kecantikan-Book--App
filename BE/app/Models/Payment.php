<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Model Payment: record transaksi pembayaran untuk satu Order (1:1).
//
// Kolom Midtrans:
//   - midtrans_id      : transaction_id dari Midtrans — diisi saat webhook diterima
//   - payment_method   : metode pembayaran (gopay, bca_va, bni_va, qris, dll)
//   - payment_channel  : channel pembayaran (qris, bank_transfer, dll)
//   - status           : pending | success | failed | expired
//   - paid_at          : timestamp saat Midtrans kirim notifikasi settlement
//
// CATATAN: record payment tidak boleh dihapus meski order dibatalkan.
// Payment adalah bukti transaksi — hanya kolom status yang diupdate.
// Tidak menggunakan SoftDeletes agar record selalu bisa diaudit.
class Payment extends Model
{
    protected $table = 'payments';

    protected $primaryKey = 'payment_id';

    public $timestamps = true;

    protected $fillable = [
        'order_id',
        'midtrans_id',       // nullable — diisi setelah redirect ke Midtrans
        'amount',
        'payment_method',    // gopay | bca_va | bni_va | qris | dll
        'payment_channel',   // bank_transfer | qris | dll
        'status',            // pending | success | failed | expired
        'paid_at',           // nullable — diisi saat webhook settlement diterima
    ];

    protected $casts = [
        'amount'  => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    // order: satu payment dimiliki oleh satu order (1:1 balik)
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }
}