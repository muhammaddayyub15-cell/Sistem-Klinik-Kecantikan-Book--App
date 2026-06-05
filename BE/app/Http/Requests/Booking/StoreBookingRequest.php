<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // doctor_id: wajib — FK ke doctors.doctor_id
            'doctor_id'  => 'required|exists:doctors,doctor_id',

            // service_id: wajib — FIX typo lama 'service' → 'services'
            'service_id' => 'required|exists:services,service_id',

            // booked_date: wajib, tidak boleh masa lalu
            'booked_date' => 'required|date|after_or_equal:today',

            // notes: opsional — catatan tambahan dari pasien
            'notes' => 'nullable|string|max:500',

            // catatan: patient_id & doctor_schedule_id TIDAK diterima dari frontend
            // patient_id      → diambil dari auth()->user()->patient di BookingService
            // doctor_schedule_id → di-resolve dari doctor_id + booked_date di BookingService
        ];
    }

    public function messages(): array
    {
        return [
            'doctor_id.required'         => 'Dokter wajib dipilih.',
            'doctor_id.exists'           => 'Dokter tidak ditemukan.',
            'service_id.required'        => 'Layanan wajib dipilih.',
            'service_id.exists'          => 'Layanan tidak ditemukan.',
            'booked_date.required'       => 'Tanggal booking wajib diisi.',
            'booked_date.date'           => 'Format tanggal tidak valid.',
            'booked_date.after_or_equal' => 'Tanggal booking tidak boleh di masa lalu.',
            'notes.max'                  => 'Catatan maksimal 500 karakter.',
        ];
    }
}