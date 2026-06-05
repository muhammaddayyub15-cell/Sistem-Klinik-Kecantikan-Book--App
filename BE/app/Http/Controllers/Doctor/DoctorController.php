<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StoreDoctorRequest;
use App\Http\Requests\Doctor\UpdateDoctorRequest;
use App\Services\DoctorService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class DoctorController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected DoctorService $doctorService) {}

    // index: ambil semua dokter + relasi — admin
    public function index(): JsonResponse
    {
        try {
            $doctors = $this->doctorService->getAllWithRelations();

            return $this->successResponse($doctors);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil data dokter.', 500);
        }
    }

    // available: ambil dokter yang aktif & tersedia — publik (dipakai BookingPage FE)
    public function available(): JsonResponse
    {
        try {
            $doctors = $this->doctorService->getAvailable();

            return $this->successResponse($doctors);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil daftar dokter tersedia.', 500);
        }
    }

    // show: detail satu dokter + jadwal — publik
    public function show(int $id): JsonResponse
    {
        try {
            $doctor = $this->doctorService->getWithSchedules($id);

            return $this->successResponse($doctor);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Dokter tidak ditemukan.', 404);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil detail dokter.', 500);
        }
    }

    // store: buat profil dokter baru — admin
    public function store(StoreDoctorRequest $request): JsonResponse
    {
        try {
            $doctor = $this->doctorService->createDoctor($request->validated());

            return $this->createdResponse($doctor, 'Profil dokter berhasil dibuat.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal membuat profil dokter.', 500);
        }
    }

    // update: edit profil dokter — admin
    public function update(UpdateDoctorRequest $request, int $id): JsonResponse
    {
        try {
            $doctor = $this->doctorService->updateDoctor($id, $request->validated());

            return $this->successResponse($doctor, 'Profil dokter berhasil diperbarui.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Dokter tidak ditemukan.');
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal memperbarui profil dokter.', 500);
        }
    }

    // destroy: soft delete profil dokter — admin
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->doctorService->delete($id);

            return $this->successResponse(null, 'Profil dokter berhasil dihapus.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Dokter tidak ditemukan.', 404);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal menghapus profil dokter.', 500);
        }
    }

    // toggleAvailability: buka/tutup slot booking sementara — admin
    // is_available = false → dokter tidak muncul di /doctors/available
    public function toggleAvailability(int $id): JsonResponse
    {
        try {
            $doctor = $this->doctorService->toggleAvailability($id);

            return $this->successResponse($doctor, 'Status ketersediaan dokter berhasil diubah.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Dokter tidak ditemukan.', 404);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengubah status ketersediaan dokter.', 500);
        }
    }

    // toggleActive: aktifkan/nonaktifkan dokter secara permanen — admin
    // is_active = false → dokter tidak muncul di semua list & tidak bisa menerima booking
    public function toggleActive(int $id): JsonResponse
    {
        try {
            $doctor = $this->doctorService->toggleActive($id);

            return $this->successResponse($doctor, 'Status aktif dokter berhasil diubah.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Dokter tidak ditemukan.', 404);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengubah status aktif dokter.', 500);
        }
    }
}