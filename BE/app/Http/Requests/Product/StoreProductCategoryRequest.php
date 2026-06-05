<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

// StoreProductCategoryRequest: Validasi saat membuat kategori produk baru.
// Otorisasi akses dikontrol oleh RoleMiddleware di route (admin only).
class StoreProductCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // category_name harus unik di seluruh tabel product_categories
            'category_name' => 'required|string|max:255|unique:product_categories,category_name',

            // description opsional — keterangan singkat kategori
            'description'   => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'category_name.required' => 'Nama kategori wajib diisi.',
            'category_name.unique'   => 'Nama kategori sudah ada.',
        ];
    }
}