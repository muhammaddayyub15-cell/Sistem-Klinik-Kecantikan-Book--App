<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Model StockLog: audit trail setiap perubahan stok produk.
// Log tidak menggunakan SoftDeletes — record tidak boleh dihapus
// untuk menjaga integritas riwayat stok.
//
// Kolom:
//   - product_id  : FK ke products
//   - change_qty  : jumlah perubahan stok (selalu positif — arah ditentukan oleh type)
//   - type        : enum ['increment', 'decrement', 'set']
//                   increment  → stok masuk (restock, koreksi positif)
//                   decrement  → stok keluar (penjualan manual, write-off)
//                   set        → koreksi absolut (stok diset ke nilai tertentu)
//   - reference_id: ID referensi opsional (misal order_id saat stok terpotong oleh order)
//   - reason      : keterangan wajib — alasan perubahan stok untuk audit
class StockLog extends Model
{
    protected $table = 'stock_logs';

    // timestamps: created_at dipakai sebagai waktu log, updated_at tetap ada
    public $timestamps = true;

    protected $fillable = [
        'product_id',
        'change_qty',
        'type',         // increment | decrement | set
        'reference_id', // nullable — ID order atau dokumen terkait
        'reason',       // wajib diisi — keterangan perubahan stok
    ];

    protected $casts = [
        'change_qty' => 'integer',
    ];

    // product: relasi balik ke produk yang stoknya berubah
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}