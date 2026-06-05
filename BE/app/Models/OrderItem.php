<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Model OrderItem: detail baris produk dalam sebuah order.
// Junction antara Order dan Product — menggunakan snapshot pattern.
//
// SNAPSHOT PATTERN:
//   - product_id_snapshot   : ID produk saat order dibuat — untuk referensi historis
//   - product_name_snapshot : nama produk saat order dibuat — tidak berubah meski produk di-update
//   - unit_price_snapshot   : harga satuan saat order dibuat — harga lama tetap tercatat di invoice
//
// OrderItem tidak menggunakan SoftDeletes:
//   Item tidak bisa dihapus satuan dari order yang sudah dibuat.
//   Untuk membatalkan, batalkan seluruh Order via status order.
class OrderItem extends Model
{
    protected $table = 'order_items';

    public $timestamps = true;

    protected $fillable = [
        'order_id',
        'product_id_snapshot',   // snapshot ID produk — immutable
        'product_name_snapshot', // snapshot nama produk — immutable
        'unit_price_snapshot',   // snapshot harga satuan — immutable
        'qty',
    ];

    protected $casts = [
        'unit_price_snapshot' => 'decimal:2',
        'qty'                 => 'integer',
    ];

    // order: relasi balik ke order induk
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }
}