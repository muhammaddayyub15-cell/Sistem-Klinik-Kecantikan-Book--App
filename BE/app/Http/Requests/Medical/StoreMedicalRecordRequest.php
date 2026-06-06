<?php

namespace App\Http\Requests\Medical;

use Illuminate\Foundation\Http\FormRequest;

// StoreMedicalRecordRequest: Validasi input saat membuat rekam medis baru.
// Dipakai MedicalController::store() — doctor only.
class StoreMedicalRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'booking_id'        => ['required', 'integer', 'exists:bookings,booking_id'],
            'diagnosis'         => ['nullable', 'string'],
            'prescription_text' => ['nullable', 'string'],
        ];
    }
}