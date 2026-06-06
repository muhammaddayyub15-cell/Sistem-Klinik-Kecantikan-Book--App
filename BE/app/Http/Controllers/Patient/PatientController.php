<?php

namespace App\Http\Controllers\Patient;
use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\StorePatientRequest;
use App\Http\Requests\Patient\UpdatePatientRequest;
use App\Services\PatientService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

// PatientController: Handle request manajemen profil pasien.
// Business logic didelegasi ke PatientService.
class PatientController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected PatientService $patientService) {}

    // index: Ambil semua pasien — admin dan doctor only.
    public function index(): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->patientService->getAllWithUser()
            );
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal mengambil data pasien.', 500);
        }
    }

    // show: Detail satu pasien by patient_id.
    public function show(int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->patientService->getById($id)
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Pasien tidak ditemukan.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal mengambil detail pasien.', 500);
        }
    }

    // store: Buat profil pasien baru — admin only.
    // Catatan: pasien register via /auth/register, bukan endpoint ini.
    public function store(StorePatientRequest $request): JsonResponse
    {
        try {
            $patient = $this->patientService->create($request->validated());

            return $this->createdResponse($patient, 'Profil pasien berhasil dibuat.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal membuat profil pasien.', 500);
        }
    }

    // update: Update profil pasien.
    // User::findOrFail() dipakai agar intelephense bisa resolve relasi patient.
    public function update(UpdatePatientRequest $request, int $id): JsonResponse
    {
        try {
            $patient = $this->patientService->update($id, $request->validated());

            return $this->successResponse($patient, 'Profil pasien berhasil diperbarui.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Pasien tidak ditemukan.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal memperbarui profil pasien.', 500);
        }
    }

    // destroy: Soft delete pasien — admin only.
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->patientService->delete($id);

            return $this->successResponse(null, 'Profil pasien berhasil dihapus.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Pasien tidak ditemukan.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal menghapus profil pasien.', 500);
        }
    }
}