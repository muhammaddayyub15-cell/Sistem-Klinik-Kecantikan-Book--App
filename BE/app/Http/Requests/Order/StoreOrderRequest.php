<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

// StoreOrderRequest: Validasi saat membuat order baru (POST /orders).
// patient_id dikirim dari body — admin bisa membuat order untuk pasien lain.
// Otorisasi akses dikontrol oleh RoleMiddleware di route (admin dan patient).
class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // patient_id dari request body — divalidasi ke tabel patients
            // OrderService akan snapshot nama pasien dari sini saat order dibuat
            'patient_id'         => 'required|integer|exists:patients,patient_id',

            // booking_id nullable — order bisa dibuat tanpa booking
            // Sekarang FK hidup ke tabel bookings (satu database)
            'booking_id'         => 'nullable|integer|exists:bookings,booking_id',

            // items wajib ada minimal satu produk
            'items'              => 'required|array|min:1',

            // product_id divalidasi ke tabel products — OrderService akan snapshot nama dan harga
            'items.*.product_id' => 'required|integer|exists:products,product_id',

            // qty minimal 1 per item
            'items.*.qty'        => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id.required'        => 'Patient ID wajib diisi.',
            'patient_id.exists'          => 'Pasien tidak ditemukan.',
            'booking_id.exists'          => 'Booking tidak ditemukan.',
            'items.required'             => 'Order harus memiliki minimal satu item.',
            'items.min'                  => 'Order harus memiliki minimal satu item.',
            'items.*.product_id.exists'  => 'Produk tidak ditemukan.',
            'items.*.qty.min'            => 'Jumlah item tidak boleh kurang dari 1.',
        ];
    }
}