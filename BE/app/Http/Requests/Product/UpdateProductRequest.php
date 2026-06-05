<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

// UpdateProductRequest: Validasi saat update produk (PUT /products/{id}).
// Semua field bersifat opsional (sometimes) karena mendukung partial update.
// Otorisasi akses dikontrol oleh RoleMiddleware di route (admin only).
class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Ambil ID produk dari route parameter '{id}' sesuai api.php
        // Digunakan untuk ignore unique check pada SKU milik produk itu sendiri
        $productId = $this->route('id');

        return [
            'product_name' => 'sometimes|string|max:255',

            // Ignore unique untuk product_id kolom — karena PK products adalah 'product_id' bukan 'id'
            'SKU'          => "sometimes|string|max:100|unique:products,SKU,{$productId},product_id",

            // exists merujuk ke category_id — PK product_categories bukan default 'id'
            'category_id'  => 'sometimes|integer|exists:product_categories,category_id',

            'price'        => 'sometimes|numeric|min:0',

            // unit opsional saat update
            'unit'         => 'sometimes|string|max:50',

            'description'  => 'nullable|string',

            'image_url'    => 'nullable|url|max:500',

            // CATATAN: stock_qty tidak diupdate di sini.
            // Perubahan stok harus melalui endpoint POST /products/{id}/stock
            // agar setiap perubahan tercatat di StockLog untuk keperluan audit.
        ];
    }

    public function messages(): array
    {
        return [
            'SKU.unique'          => 'SKU sudah digunakan oleh produk lain.',
            'category_id.exists'  => 'Kategori produk tidak ditemukan.',
            'price.min'           => 'Harga tidak boleh negatif.',
            'image_url.url'       => 'Format URL gambar tidak valid.',
        ];
    }
}