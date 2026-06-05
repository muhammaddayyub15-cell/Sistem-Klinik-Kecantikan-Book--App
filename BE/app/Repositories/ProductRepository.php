<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

// ProductRepository: Query layer untuk tabel products.
// Mewarisi operasi CRUD dasar dari BaseRepository.
class ProductRepository extends BaseRepository
{
    public function __construct(Product $model)
    {
        parent::__construct($model);
    }

    // findAllPaginated: Ambil produk dengan pagination dan eager load kategori.
    // $perPage default 15, bisa dikonfigurasi dari request query ?per_page=
    public function findAllPaginated(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->with('category')->paginate($perPage);
    }

    // findByCategoryId: Filter produk berdasarkan category_id.
    public function findByCategoryId(int $categoryId): Collection
    {
        return $this->model->with('category')
            ->where('category_id', $categoryId)
            ->get();
    }

    // findBySKU: Cari produk berdasarkan SKU unik.
    // Digunakan untuk validasi duplikasi SKU saat create/update di ProductService.
    public function findBySKU(string $sku): ?Product
    {
        return $this->model->where('SKU', $sku)->first();
    }

    // updateStock: Update kolom stock_qty sesuai type operasi.
    // type 'increment' : tambah stok sebesar $qty
    // type 'decrement' : kurangi stok sebesar $qty
    // type 'set'       : set stok ke nilai $qty secara absolut
    //
    // PENTING: Method ini hanya mengubah stock_qty di tabel products.
    // Pencatatan StockLog adalah tanggung jawab ProductService, bukan repository ini.
    public function updateStock(int $productId, int $qty, string $type): Product
    {
        $product = $this->findOrFail($productId);

        match ($type) {
            'increment' => $product->increment('stock_qty', $qty),
            'decrement' => $product->decrement('stock_qty', $qty),
            'set'       => $product->update(['stock_qty' => $qty]),
        };

        return $product->refresh();
    }
}