<?php

namespace App\Services;

use App\Repositories\ProductCategoryRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

// ProductCategoryService: Business logic untuk manajemen kategori produk.
// Controller tidak boleh akses repository langsung — semua lewat service ini.
class ProductCategoryService extends BaseService
{
    public function __construct(
        protected ProductCategoryRepository $categoryRepository
    ) {
        parent::__construct($categoryRepository);
    }

    // getAllCategories: Ambil semua kategori.
    // $withProducts: jika true, eager load relasi products sekaligus.
    public function getAllCategories(bool $withProducts = false): Collection
    {
        return $withProducts
            ? $this->categoryRepository->findAllWithProducts()
            : $this->categoryRepository->all();
    }

    // getCategoryById: Ambil satu kategori berdasarkan ID.
    public function getCategoryById(int $id): Model
    {
        return $this->categoryRepository->findOrFail($id);
    }

    // createCategory: Buat kategori baru.
    // Validasi duplikasi nama dilakukan di sini, bukan di controller atau request.
    public function createCategory(array $data): Model
    {
        if ($this->categoryRepository->findByName($data['category_name'])) {
            throw new \Exception('Kategori dengan nama tersebut sudah ada.', 422);
        }

        return $this->categoryRepository->create($data);
    }

    // updateCategory: Update data kategori.
    public function updateCategory(int $id, array $data): Model
    {
        return $this->categoryRepository->update($id, $data);
    }

    // deleteCategory: Soft delete kategori.
    // Tidak bisa hapus kategori yang masih memiliki produk aktif.
    public function deleteCategory(int $id): bool
    {
        $category = $this->categoryRepository->findOrFail($id);

        // load relasi products untuk cek apakah masih ada produk
        $category->load('products');

        if ($category->products->count() > 0) {
            throw new \Exception('Kategori tidak dapat dihapus karena masih memiliki produk aktif.', 422);
        }

        return $this->categoryRepository->delete($id);
    }
}