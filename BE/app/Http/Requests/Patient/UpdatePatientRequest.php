<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;

// UpdatePatientRequest: Validasi saat update profil pasien (PUT/PATCH /patients/{id}).
// Semua field nullable — mendukung partial update (PATCH-friendly).
// Otorisasi akses dikontrol oleh RoleMiddleware di route.
class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date_of_birth'   => 'nullable|date',

            // gender sesuai enum di migration
            'gender'          => 'nullable|string|in:male,female,other',

            // blood_type sesuai enum di migration
            'blood_type'      => 'nullable|string|in:A+,A-,B+,B-,AB+,AB-,O+,O-',

            'address'         => 'nullable|string',

            // medical_history bisa diupdate kapan saja — teks bebas
            'medical_history' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'gender.in'     => 'Gender harus salah satu dari: male, female, other.',
            'blood_type.in' => 'Golongan darah tidak valid.',
        ];
    }
}