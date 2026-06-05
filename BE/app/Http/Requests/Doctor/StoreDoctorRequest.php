<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class StoreDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        // otorisasi role sudah ditangani middleware 'role:admin'
        return true;
    }

    public function rules(): array
    {
        return [
            // user_id: harus user yang belum jadi dokter & role-nya doctor
            'user_id'      => 'required|exists:users,user_id|unique:doctors,user_id',

            'spec_id'      => 'required|exists:specializations,spec_id',

            // license_no: unik per dokter, max 100 karakter
            'license_no'   => 'required|string|max:100|unique:doctors,license_no',

            // bio: opsional — deskripsi singkat dokter untuk halaman profil
            'bio'          => 'nullable|string|max:1000',

            // is_active: default true — bisa di-set false untuk disable dokter
            'is_active'    => 'nullable|boolean',

            // is_available: default true — bisa di-toggle untuk tutup slot booking sementara
            'is_available' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required'    => 'User wajib diisi.',
            'user_id.exists'      => 'User tidak ditemukan.',
            'user_id.unique'      => 'User ini sudah terdaftar sebagai dokter.',
            'spec_id.required'    => 'Spesialisasi wajib diisi.',
            'spec_id.exists'      => 'Spesialisasi tidak ditemukan.',
            'license_no.required' => 'Nomor lisensi wajib diisi.',
            'license_no.unique'   => 'Nomor lisensi sudah digunakan.',
            'license_no.max'      => 'Nomor lisensi maksimal 100 karakter.',
            'bio.max'             => 'Bio maksimal 1000 karakter.',
        ];
    }
}