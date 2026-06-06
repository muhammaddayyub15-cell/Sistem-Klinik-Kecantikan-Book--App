<?php

namespace App\Http\Requests\Medical;

use Illuminate\Foundation\Http\FormRequest;

// StorePrescriptionRequest: Validasi input saat menambah resep ke rekam medis.
// Dipakai MedicalController::addPrescriptions() — doctor only.
class StorePrescriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'prescriptions'               => ['required', 'array', 'min:1'],
            'prescriptions.*'             => ['required'],
            'prescriptions.*.product_id'  => ['sometimes', 'integer', 'exists:products,product_id'],
            'prescriptions.*.qty'         => ['sometimes', 'integer', 'min:1'],
            'prescriptions.*.description' => ['sometimes', 'string'],
        ];
    }
}