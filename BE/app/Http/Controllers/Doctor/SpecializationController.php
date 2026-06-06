<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Services\SpecializationService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

// SpecializationController: endpoint publik untuk data spesialisasi dokter.
// Dipakai DoctorForm (admin) — dropdown pilih spesialisasi saat create/edit dokter.
class SpecializationController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected SpecializationService $specializationService) {}

    // index: ambil semua spesialisasi urut abjad — publik, tidak butuh auth.
    // GET /specializations
    public function index(): JsonResponse
    {
        try {
            $specializations = $this->specializationService->getAll();

            return $this->successResponse($specializations);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil data spesialisasi.', 500);
        }
    }

    // show: detail satu spesialisasi beserta daftar dokternya — publik.
    // GET /specializations/{id}
    public function show(int $id): JsonResponse
    {
        try {
            $specialization = $this->specializationService->getById($id);

            return $this->successResponse($specialization);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Spesialisasi tidak ditemukan.');
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil detail spesialisasi.', 500);
        }
    }
}