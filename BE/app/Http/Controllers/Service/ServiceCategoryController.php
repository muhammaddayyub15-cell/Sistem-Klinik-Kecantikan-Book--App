<?php

namespace App\Http\Controllers\Service;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

// ServiceCategoryController: endpoint publik untuk data kategori layanan.
// Dipakai ServiceForm (admin) — dropdown pilih kategori saat create/edit service.
// Read-only — CRUD kategori tidak diekspos via API saat ini.
class ServiceCategoryController extends Controller
{
    use ApiResponseTrait;

    // index: ambil semua kategori layanan urut abjad — publik, tidak butuh auth.
    // GET /service-categories
    public function index(): JsonResponse
    {
        try {
            $categories = ServiceCategory::orderBy('category_name')->get();

            return $this->successResponse($categories);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil data kategori layanan.', 500);
        }
    }
}