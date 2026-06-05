<?php

namespace App\Http\Requests\Service;

use Illuminate\Foundation\Http\FormRequest;

// UpdateServiceRequest: Validasi input saat update service.
// Semua field nullable — mendukung partial update.
// Dipakai ServiceController::update() — admin only.
class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id'  => 'nullable|exists:service_categories,category_id',
            'service_name' => 'nullable|string|max:255',
            'description'  => 'nullable|string',
            'base_price'   => 'nullable|numeric|min:0',
            'unit'         => 'nullable|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.exists' => 'Kategori layanan tidak ditemukan.',
            'base_price.numeric' => 'Harga dasar harus berupa angka.',
            'base_price.min'     => 'Harga dasar tidak boleh negatif.',
        ];
    }
}