<?php

namespace App\Services;

use App\Repositories\ProductRepository;
use App\Repositories\StockLogRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

// ProductService: Business logic untuk manajemen produk dan stok.
// Mengelola dua repository: ProductRepository (primary) & StockLogRepository.
// Setiap perubahan stok via updateStock() WAJIB diikuti pencatatan di StockLog.
class ProductService extends BaseService
{
    public function __construct(
        protected ProductRepository  $productRepository,
        protected StockLogRepository $stockLogRepository
    ) {
        // productRepository sebagai primary — dipass ke BaseService
        parent::__construct($productRepository);
    }

    // =========================================================================
    // PRODUCT CRUD
    // =========================================================================

    // getAllProducts: Ambil semua produk dengan pagination.
    public function getAllProducts(int $perPage = 15): LengthAwarePaginator
    {
        return $this->productRepository->findAllPaginated($perPage);
    }

    // getProductById: Ambil satu produk beserta kategorinya.
    public function getProductById(int $id): Model
    {
        return $this->productRepository->findOrFail($id);
    }

    // createProduct: Buat produk baru + catat stok awal jika ada.
    // Validasi SKU duplikat dilakukan di sini sebagai safety net
    // (sudah ada di StoreProductRequest, ini lapisan kedua).
    public function createProduct(array $data): Model
    {
        return DB::transaction(function () use ($data) {

            if ($this->productRepository->findBySKU($data['SKU'])) {
                throw new \Exception('SKU sudah digunakan oleh produk lain.', 422);
            }

            $product = $this->productRepository->create($data);

            // Catat log stok awal jika stock_qty diisi saat create
            if (!empty($data['stock_qty']) && $data['stock_qty'] > 0) {
                $this->stockLogRepository->createLog([
                    'product_id' => $product->product_id, // FIX: pakai product_id bukan id
                    'change_qty' => $data['stock_qty'],
                    'type'       => 'increment',          // FIX: bukan 'in'
                    'reason'     => 'Stok awal saat produk dibuat', // FIX: bukan 'notes'
                ]);
            }

            return $product->load('category');
        });
    }

    // updateProduct: Update data produk (bukan stok — gunakan updateStock untuk itu).
    // stock_qty tidak bisa diupdate langsung — harus lewat endpoint /stock.
    public function updateProduct(int $id, array $data): Model
    {
        // Jika SKU diubah, validasi tidak duplikat dengan produk lain
        if (!empty($data['SKU'])) {
            $existing = $this->productRepository->findBySKU($data['SKU']);

            // existing boleh ada selama itu milik produk yang sama (update sendiri)
            if ($existing && $existing->product_id !== $id) {
                throw new \Exception('SKU sudah digunakan oleh produk lain.', 422);
            }
        }

        return $this->productRepository->update($id, $data);
    }

    // deleteProduct: Soft delete produk.
    public function deleteProduct(int $id): bool
    {
        return $this->productRepository->delete($id);
    }

    // =========================================================================
    // STOCK MANAGEMENT
    // =========================================================================

    // updateStock: Update stok produk DAN catat log perubahan secara atomik.
    //
    // $qty    : jumlah perubahan — selalu positif, arah ditentukan oleh $type
    // $type   : 'increment' | 'decrement' | 'set'
    // $reason : keterangan wajib untuk audit log
    // $referenceId: opsional — ID order atau rekam medis terkait
    //
    // PENTING: Validasi stok tidak boleh negatif dilakukan di sini sebelum update.
    public function updateStock(
        int    $productId,
        int    $qty,
        string $type,
        string $reason,
        ?int   $referenceId = null
    ): Model {
        return DB::transaction(function () use ($productId, $qty, $type, $reason, $referenceId) {

            $product = $this->productRepository->findOrFail($productId);

            // Cegah stok menjadi negatif saat decrement
            if ($type === 'decrement' && ($product->stock_qty - $qty) < 0) {
                throw new \Exception('Stok tidak mencukupi untuk dikurangi.', 422);
            }

            // Update stock_qty di tabel products sesuai type
            $updated = $this->productRepository->updateStock($productId, $qty, $type);

            // Catat log — WAJIB setiap ada perubahan stok
            $this->stockLogRepository->createLog([
                'product_id'   => $productId,
                'change_qty'   => $qty,
                'type'         => $type,         // increment | decrement | set
                'reason'       => $reason,        // FIX: bukan 'notes'
                'reference_id' => $referenceId,
            ]);

            return $updated;
        });
    }

    // deductStockForPrescription: Kurangi stok untuk item resep dokter.
    // Dipanggil dari MedicalService saat dokter tambah resep ke rekam medis.
    // $items    : array of ['product_id' => int, 'qty' => int]
    // $recordId : ID rekam medis — disimpan sebagai reference_id di StockLog
    public function deductStockForPrescription(array $items, int $recordId): void
    {
        foreach ($items as $item) {
            $this->updateStock(
                productId:   $item['product_id'],
                qty:         $item['qty'],
                type:        'decrement',           // FIX: bukan 'out'
                reason:      'Prescription usage',  // FIX: bukan parameter notes
                referenceId: $recordId,
            );
        }
    }

    // getStockLogs: Ambil riwayat perubahan stok untuk satu produk.
    public function getStockLogs(int $productId): Collection
    {
        // Validasi produk ada terlebih dahulu sebelum ambil logs
        $this->productRepository->findOrFail($productId);

        return $this->stockLogRepository->findByProductId($productId);
    }
}