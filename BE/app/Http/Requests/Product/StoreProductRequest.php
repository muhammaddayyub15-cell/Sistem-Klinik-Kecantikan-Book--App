<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

// StoreProductRequest: Validasi saat membuat produk baru (POST /products).
// Otorisasi akses dikontrol oleh RoleMiddleware di route (admin only).
class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_name' => 'required|string|max:255',

            // SKU harus unik — validasi duplikasi juga ada di ProductService sebagai safety net
            'SKU'          => 'required|string|max:100|unique:products,SKU',

            // exists merujuk ke category_id — PK product_categories bukan default 'id'
            'category_id'  => 'required|integer|exists:product_categories,category_id',

            'price'        => 'required|numeric|min:0',

            // stock_qty boleh kosong saat create — default ke 0 di migration
            'stock_qty'    => 'nullable|integer|min:0',

            // unit wajib — contoh: pcs, box, tablet, ml, botol
            'unit'         => 'required|string|max:50',

            'description'  => 'nullable|string',

            // image_url opsional — URL gambar produk, validasi format URL
            'image_url'    => 'nullable|url|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'SKU.unique'          => 'SKU sudah digunakan oleh produk lain.',
            'category_id.exists'  => 'Kategori produk tidak ditemukan.',
            'price.min'           => 'Harga tidak boleh negatif.',
            'stock_qty.min'       => 'Stok awal tidak boleh negatif.',
            'image_url.url'       => 'Format URL gambar tidak valid.',
        ];
    }
}