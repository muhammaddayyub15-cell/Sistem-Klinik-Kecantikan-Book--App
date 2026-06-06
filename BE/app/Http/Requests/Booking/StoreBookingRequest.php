<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // patient_id: opsional — hanya dikirim admin saat booking untuk patient lain.
            // Patient role → diabaikan (diambil dari token di BookingService).
            'patient_id' => 'nullable|exists:patients,patient_id',
            
            // doctor_id: wajib — FK ke doctors.doctor_id
            'doctor_id'  => 'required|exists:doctors,doctor_id',

            // service_id: wajib — FK ke services.service_id
            'service_id' => 'required|exists:services,service_id',

            // doctor_schedule_id: wajib — dipilih user di FE (step 2: time slot).
            // Harus aktif (is_active = 1) agar tidak bisa booking ke jadwal nonaktif.
            // BE tetap re-validasi ownership (schedule milik doctor_id) di BookingService.
            'doctor_schedule_id' => [
                'required',
                Rule::exists('doctor_schedules', 'schedule_id')->where('is_active', true),
            ],

            // booked_date: wajib, tidak boleh masa lalu
            'booked_date' => 'required|date|after_or_equal:today',

            // notes: opsional — catatan tambahan dari pasien
            'notes' => 'nullable|string|max:500',

            // CATATAN: patient_id TIDAK diterima dari frontend
            // patient_id → diambil dari auth()->user()->patient di BookingService
        ];
    }

    public function messages(): array
    {
        return [
            'doctor_id.required'                => 'Dokter wajib dipilih.',
            'doctor_id.exists'                  => 'Dokter tidak ditemukan.',
            'service_id.required'               => 'Layanan wajib dipilih.',
            'service_id.exists'                 => 'Layanan tidak ditemukan.',
            'doctor_schedule_id.required'       => 'Slot jadwal wajib dipilih.',
            'doctor_schedule_id.exists'         => 'Jadwal tidak tersedia atau sudah dinonaktifkan.',
            'booked_date.required'              => 'Tanggal booking wajib diisi.',
            'booked_date.date'                  => 'Format tanggal tidak valid.',
            'booked_date.after_or_equal'        => 'Tanggal booking tidak boleh di masa lalu.',
            'notes.max'                         => 'Catatan maksimal 500 karakter.',
        ];
    }
}