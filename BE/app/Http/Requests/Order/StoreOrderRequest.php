<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

// StoreOrderRequest: Validasi saat membuat order baru (POST /orders).
//
// Dua skenario yang didukung:
//   1. Booking-only order  → booking_id wajib, items kosong/tidak dikirim
//      total_amount diambil dari service.base_price di booking
//   2. Product-only order  → items wajib, booking_id opsional (Coming Soon)
//
// patient_id TIDAK diterima dari request — diambil dari token di OrderService.
class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // booking_id: wajib untuk flow booking → payment.
            // nullable dipertahankan untuk product-only order (Coming Soon).
            'booking_id'         => 'nullable|integer|exists:bookings,booking_id',

            // items: opsional — hanya dipakai saat product-only order (Coming Soon).
            // Jika dikirim, setiap item harus valid.
            'items'              => 'nullable|array',
            'items.*.product_id' => 'required_with:items|integer|exists:products,product_id',
            'items.*.qty'        => 'required_with:items|integer|min:1',
        ];
    }

    // withValidator: Custom validation — salah satu dari booking_id atau items harus ada.
    // Mencegah order kosong tanpa booking maupun produk.
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $hasBooking = !empty($this->input('booking_id'));
            $hasItems   = !empty($this->input('items'));

            if (!$hasBooking && !$hasItems) {
                $validator->errors()->add(
                    'order',
                    'Order harus memiliki booking_id atau minimal satu item produk.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'booking_id.exists'          => 'Booking tidak ditemukan.',
            'items.*.product_id.exists'  => 'Produk tidak ditemukan.',
            'items.*.qty.min'            => 'Jumlah item tidak boleh kurang dari 1.',
        ];
    }
}