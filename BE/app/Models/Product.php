<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

// Model Product: merepresentasikan produk yang dijual di klinik.
//   - SKU       : kode unik produk untuk identifikasi stok
//   - stock_qty : stok saat ini, diupdate melalui StockLog
//   - price     : harga satuan — snapshot ke order_items saat order dibuat
//   - unit      : satuan produk (tablet, botol, kapsul, dll)
//
// Saat order dibuat, nama dan harga produk di-snapshot ke OrderItem.
// Perubahan harga setelah order tidak mempengaruhi invoice lama.
class Product extends Model
{
    use SoftDeletes;

    protected $table = 'products';

    protected $primaryKey = 'product_id';
    protected $keyType    = 'int';
    public $incrementing  = true;

    protected $fillable = [
        'product_name',
        'SKU',
        'category_id',
        'price',
        'stock_qty',
        'unit',
        'description', // opsional — deskripsi singkat produk
        'image_url',   // opsional — URL gambar produk
    ];

    protected $casts = [
        // price di-cast decimal agar kalkulasi total order akurat
        'price'     => 'decimal:2',
        'stock_qty' => 'integer',
    ];

    // category: produk dimiliki oleh satu kategori (M:1)
    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    // stockLogs: audit trail setiap perubahan stok produk (1:N)
    public function stockLogs(): HasMany
    {
        return $this->hasMany(StockLog::class, 'product_id', 'product_id');
    }
}