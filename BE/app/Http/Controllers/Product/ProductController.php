<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Requests\Product\UpdateStockRequest;
use App\Services\ProductService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// ProductController: Handle request produk & stok.
// Business logic didelegasi ke ProductService.
// Stock update wajib lewat updateStock() — tidak boleh via update() langsung.
class ProductController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected ProductService $productService) {}

    // index: Ambil semua produk dengan pagination.
    public function index(Request $request): JsonResponse
    {
        try {
            $products = $this->productService->getAllProducts(
                (int) $request->query('per_page', 15)
            );

            return $this->successResponse($products, 'Daftar produk berhasil diambil.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal mengambil produk.', 500);
        }
    }

    // show: Detail satu produk by ID.
    public function show(int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->productService->getProductById($id),
                'Detail produk berhasil diambil.'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Produk tidak ditemukan.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal mengambil detail produk.', 500);
        }
    }

    // store: Buat produk baru — admin only.
    public function store(StoreProductRequest $request): JsonResponse
    {
        try {
            $product = $this->productService->createProduct($request->validated());

            return $this->createdResponse($product, 'Produk berhasil dibuat.');
        } catch (\Throwable $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    // update: Update data produk — admin only.
    // Tidak boleh update stock_qty lewat sini — pakai updateStock().
    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        try {
            $product = $this->productService->updateProduct($id, $request->validated());

            return $this->successResponse($product, 'Produk berhasil diperbarui.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Produk tidak ditemukan.');
        } catch (\Throwable $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    // destroy: Soft delete produk — admin only.
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->productService->deleteProduct($id);

            return $this->successResponse(null, 'Produk berhasil dihapus.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Produk tidak ditemukan.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal menghapus produk.', 500);
        }
    }

    // updateStock: Update stok produk — selalu tercatat di stock_logs.
    // type: increment | decrement | set
    public function updateStock(UpdateStockRequest $request, int $id): JsonResponse
    {
        try {
            $data    = $request->validated();
            $product = $this->productService->updateStock(
                $id,
                $data['change_qty'],
                $data['type'],
                $data['reference_id'] ?? null,
                $data['notes']        ?? null
            );

            return $this->successResponse($product, 'Stok berhasil diperbarui.');
        } catch (\Throwable $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    // stockLogs: Ambil riwayat perubahan stok produk — admin only.
    public function stockLogs(int $id): JsonResponse
    {
        try {
            $logs = $this->productService->getStockLogs($id);

            return $this->successResponse($logs, 'Riwayat stok berhasil diambil.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal mengambil riwayat stok.', 500);
        }
    }
}