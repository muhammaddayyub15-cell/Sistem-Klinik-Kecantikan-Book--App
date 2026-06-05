<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductCategoryRequest;
use App\Services\ProductCategoryService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// ProductCategoryController: Handle kategori produk
// NOTE: Tidak ada business logic di controller
class ProductCategoryController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        protected ProductCategoryService $categoryService
    ) {}

    // index: GET /product-categories
    // Ambil semua kategori (optional include products)
    public function index(Request $request): JsonResponse
    {
        try {
            $withProducts = $request->boolean('with_products', false);

            $categories = $this->categoryService->getAllCategories($withProducts);

            return $this->successResponse($categories, 'Daftar kategori berhasil diambil');
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil kategori', 500);
        }
    }

    // show: GET /product-categories/{id}
    public function show(int $id): JsonResponse
    {
        try {
            $category = $this->categoryService->getCategoryById($id);

            return $this->successResponse($category, 'Detail kategori berhasil diambil');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Kategori tidak ditemukan');
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil detail kategori', 500);
        }
    }

    // store: POST /product-categories
    public function store(StoreProductCategoryRequest $request): JsonResponse
    {
        try {
            $category = $this->categoryService->createCategory($request->validated());

            return $this->createdResponse($category, 'Kategori berhasil dibuat');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    // update: PUT /product-categories/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $category = $this->categoryService->updateCategory($id, $request->all());

            return $this->successResponse($category, 'Kategori berhasil diperbarui');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Kategori tidak ditemukan');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    // destroy: DELETE /product-categories/{id}
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->categoryService->deleteCategory($id);

            return $this->successResponse(null, 'Kategori berhasil dihapus');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Kategori tidak ditemukan');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}