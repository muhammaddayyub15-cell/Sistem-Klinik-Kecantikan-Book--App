<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\UpdatePatientRequest;
use App\Services\PatientService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private PatientService $patientService) {}

    // fungsi: ambil profile sendiri
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('patient');

        return $this->successResponse($user->patient);
    }

    // fungsi: update profile sendiri
    public function update(UpdatePatientRequest $request): JsonResponse
    {
        $user = auth()->user()->load('patient');

        $patient = $this->patientService->update(
            $user->patient->patient_id,
            $request->validated()
        );

        return $this->successResponse($patient, 'Profile updated');
    }
}