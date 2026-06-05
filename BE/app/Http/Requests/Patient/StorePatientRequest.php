<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;

// StorePatientRequest: Validasi saat membuat profil pasien baru (POST /patients).
// Otorisasi akses dikontrol oleh RoleMiddleware di route, bukan di sini.
class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // user_id wajib ada, valid di tabel users, dan belum punya profil pasien
            'user_id'         => 'required|exists:users,user_id|unique:patients,user_id',

            'date_of_birth'   => 'nullable|date',

            // gender sesuai enum di migration
            'gender'          => 'nullable|string|in:male,female,other',

            // blood_type sesuai enum di migration — validasi eksplisit agar tidak ada nilai aneh
            'blood_type'      => 'nullable|string|in:A+,A-,B+,B-,AB+,AB-,O+,O-',

            'address'         => 'nullable|string',

            // medical_history teks bebas — nullable, bisa diisi kemudian
            'medical_history' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required'  => 'User ID wajib diisi.',
            'user_id.exists'    => 'User tidak ditemukan.',
            'user_id.unique'    => 'User ini sudah memiliki profil pasien.',
            'gender.in'         => 'Gender harus salah satu dari: male, female, other.',
            'blood_type.in'     => 'Golongan darah tidak valid.',
        ];
    }
}