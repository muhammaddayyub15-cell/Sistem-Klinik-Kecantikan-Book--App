<?php

namespace App\Repositories;

use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Collection;

// ProductCategoryRepository: Query layer untuk tabel product_categories.
// Mewarisi operasi CRUD dasar dari BaseRepository.
class ProductCategoryRepository extends BaseRepository
{
    public function __construct(ProductCategory $model)
    {
        parent::__construct($model);
    }

    // findAllWithProducts: Ambil semua kategori beserta daftar produknya (eager load).
    // Digunakan di endpoint listing kategori dengan detail produk.
    public function findAllWithProducts(): Collection
    {
        return $this->model->with('products')->get();
    }

    // findByName: Cari kategori berdasarkan nama (case-insensitive).
    // Berguna untuk validasi duplikasi sebelum create di CategoryService.
    public function findByName(string $name): ?ProductCategory
    {
        return $this->model
            ->whereRaw('LOWER(category_name) = ?', [strtolower($name)])
            ->first();
    }
}