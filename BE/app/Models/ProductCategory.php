<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

// Model ProductCategory: kategori pengelompokan produk klinik.
// Satu kategori memiliki banyak produk (1:N).
// Contoh kategori: Vitamin, Obat Resep, Peralatan Medis.
class ProductCategory extends Model
{
    use SoftDeletes;

    protected $table = 'product_categories';

    protected $fillable = [
        'category_name',
        'description', // opsional — keterangan kategori
    ];

    // products: daftar produk dalam kategori ini (1:N)
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'category_id');
    }
}