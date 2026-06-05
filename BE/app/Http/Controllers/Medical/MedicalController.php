<?php

namespace App\Http\Controllers\Medical;

use App\Http\Controllers\Controller;
use App\Http\Requests\Medical\StoreMedicalRecordRequest;
use App\Http\Requests\Medical\StorePrescriptionRequest;
use App\Services\MedicalService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class MedicalController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected MedicalService $medicalService) {}

    // ==============================
    // GET ALL
    // ==============================
    public function index(): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->medicalService->getAllWithRelations()
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil data rekam medis', 500);
        }
    }

    // ==============================
    // CREATE RECORD
    // ==============================
    public function store(StoreMedicalRecordRequest $request): JsonResponse
    {
        try {
            $record = $this->medicalService->createRecord($request->validated());

            return $this->successResponse(
                $record,
                'Rekam medis berhasil dibuat',
                201
            );

        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    // ==============================
    // SHOW DETAIL
    // ==============================
    public function show(int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->medicalService->findOrFail($id)
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Rekam medis tidak ditemukan', 404);
        }
    }

    // ==============================
    // UPDATE RECORD
    // ==============================
    public function update(StoreMedicalRecordRequest $request, int $id): JsonResponse
    {
        try {
            $record = $this->medicalService->updateRecord($id, $request->validated());

            return $this->successResponse(
                $record,
                'Rekam medis berhasil diperbarui'
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Rekam medis tidak ditemukan', 404);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    // ==============================
    // ADD PRESCRIPTIONS
    // ==============================
    public function addPrescriptions(StorePrescriptionRequest $request, int $id): JsonResponse
    {
        try {
            $record = $this->medicalService->addPrescriptions(
                $id,
                $request->validated()['prescriptions']
            );

            return $this->successResponse(
                $record,
                'Resep berhasil ditambahkan',
                201
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Rekam medis tidak ditemukan', 404);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    // ==============================
    // REPLACE PRESCRIPTIONS
    // ==============================
    public function replacePrescriptions(StorePrescriptionRequest $request, int $id): JsonResponse
    {
        try {
            $record = $this->medicalService->replacePrescriptions(
                $id,
                $request->validated()['prescriptions']
            );

            return $this->successResponse(
                $record,
                'Resep berhasil diperbarui'
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Rekam medis tidak ditemukan', 404);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    // ==============================
    // FILTERS
    // ==============================
    public function getByPatient(int $patientId): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->medicalService->getByPatient($patientId)
            );

        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil rekam medis pasien', 500);
        }
    }

    public function getByDoctor(int $doctorId): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->medicalService->getByDoctor($doctorId)
            );

        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil rekam medis dokter', 500);
        }
    }

    public function getByBooking(int $bookingId): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->medicalService->getByBooking($bookingId)
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Rekam medis tidak ditemukan', 404);
        }
    }

    // ==============================
    // DELETE
    // ==============================
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->medicalService->delete($id);

            return $this->successResponse(
                null,
                'Rekam medis berhasil dihapus'
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Rekam medis tidak ditemukan', 404);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}