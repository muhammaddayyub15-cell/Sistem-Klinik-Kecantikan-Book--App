<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

// UpdateStockRequest: Validasi saat mengubah stok produk (POST /products/{id}/stock).
// Dipisah dari UpdateProductRequest — setiap perubahan stok wajib disertai keterangan
// agar StockLog tercatat lengkap untuk keperluan audit.
// Otorisasi akses dikontrol oleh RoleMiddleware di route (admin only).
class UpdateStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // qty: jumlah perubahan stok — selalu positif, arah ditentukan oleh type
            'qty'          => 'required|integer|min:1',

            // type sesuai enum di migration dan Model:
            // increment : stok masuk (restock, koreksi positif)
            // decrement : stok keluar (penjualan manual, write-off)
            // set       : koreksi absolut (stok diset ke nilai tertentu)
            'type'         => 'required|string|in:increment,decrement,set',

            // reason wajib diisi — keterangan perubahan stok untuk audit trail
            'reason'       => 'required|string|max:500',

            // reference_id opsional — ID order atau dokumen terkait
            'reference_id' => 'nullable|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'qty.required'    => 'Jumlah perubahan stok wajib diisi.',
            'qty.min'         => 'Jumlah perubahan stok minimal 1.',
            'type.required'   => 'Tipe perubahan stok wajib diisi.',
            'type.in'         => 'Tipe harus salah satu dari: increment, decrement, set.',
            'reason.required' => 'Keterangan perubahan stok wajib diisi.',
        ];
    }
}