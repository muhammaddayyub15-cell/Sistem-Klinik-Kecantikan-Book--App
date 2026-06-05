<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

// UpdateOrderStatusRequest: Validasi saat update status order manual (PATCH /orders/{id}/status).
// Digunakan oleh admin untuk update status order secara manual.
// Status 'paid' normalnya diset otomatis oleh webhook Midtrans via PaymentService —
// tapi admin bisa override jika diperlukan (misal: konfirmasi manual transfer).
class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Status yang diizinkan sesuai enum di migration orders:
            // paid      : pembayaran dikonfirmasi (biasanya otomatis via webhook)
            // cancelled : order dibatalkan oleh admin
            'status' => 'required|string|in:paid,cancelled',
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status wajib diisi.',
            'status.in'       => 'Status tidak valid. Pilihan: paid, cancelled.',
        ];
    }
}