<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\StorePatientRequest;
use App\Http\Requests\Patient\UpdatePatientRequest;
use App\Services\PatientService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class PatientController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private PatientService $patientService) {}

    // fungsi: ambil semua patient
    public function index(): JsonResponse
    {
        return $this->successResponse(
            $this->patientService->all()
        );
    }

    // fungsi: detail patient
    public function show(int $id): JsonResponse
    {
        return $this->successResponse(
            $this->patientService->findOrFail($id)
        );
    }

    // fungsi: create patient (optional admin use)
    public function store(StorePatientRequest $request): JsonResponse
    {
        $patient = $this->patientService->create($request->validated());

        return $this->successResponse($patient, 'Created', 201);
    }

    // fungsi: update patient
    public function update(UpdatePatientRequest $request, int $id): JsonResponse
    {
        $patient = $this->patientService->update($id, $request->validated());

        return $this->successResponse($patient, 'Updated');
    }

    // fungsi: delete patient
    public function destroy(int $id): JsonResponse
    {
        $this->patientService->delete($id);

        return $this->successResponse(null, 'Deleted');
    }
}