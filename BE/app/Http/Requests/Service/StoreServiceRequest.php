<?php

namespace App\Http\Requests\Service;

use Illuminate\Foundation\Http\FormRequest;

// StoreServiceRequest: Validasi input saat membuat service baru.
// Dipakai ServiceController::store() — admin only.
class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // FK ke service_categories.category_id
            'category_id'  => 'required|exists:service_categories,category_id',
            'service_name' => 'required|string|max:255',
            'description'  => 'nullable|string',
            // base_price sesuai kolom di migration
            'base_price'   => 'required|numeric|min:0',
            // unit opsional — contoh: "sesi", "30 menit"
            'unit'         => 'nullable|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required'  => 'Kategori layanan wajib dipilih.',
            'category_id.exists'    => 'Kategori layanan tidak ditemukan.',
            'service_name.required' => 'Nama layanan wajib diisi.',
            'base_price.required'   => 'Harga dasar layanan wajib diisi.',
            'base_price.numeric'    => 'Harga dasar harus berupa angka.',
            'base_price.min'        => 'Harga dasar tidak boleh negatif.',
        ];
    }
}