<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

// InitiatePaymentRequest: Validasi saat inisiasi pembayaran (POST /payments/initiate).
// Request sederhana — hanya butuh order_id karena semua data pembayaran
// (jumlah, nama pasien, item) diambil dari order yang sudah ada di database.
// Otorisasi akses dikontrol oleh RoleMiddleware di route (admin dan patient).
class InitiatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // exists merujuk ke order_id — PK orders bukan default 'id'
            'order_id' => 'required|integer|exists:orders,order_id',
        ];
    }

    public function messages(): array
    {
        return [
            'order_id.required' => 'Order ID wajib diisi.',
            'order_id.exists'   => 'Order tidak ditemukan.',
        ];
    }
}