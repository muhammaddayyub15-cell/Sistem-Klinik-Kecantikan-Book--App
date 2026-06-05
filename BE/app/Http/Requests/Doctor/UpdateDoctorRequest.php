<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        // otorisasi role sudah ditangani middleware 'role:admin'
        return true;
    }

    public function rules(): array
    {
        // ambil doctor_id dari route parameter untuk ignore unique check pada diri sendiri
        $doctorId = $this->route('id');

        return [
            'spec_id'      => 'nullable|exists:specializations,spec_id',

            // license_no: ignore unique check untuk doctor_id ini sendiri saat update
            'license_no'   => 'nullable|string|max:100|unique:doctors,license_no,' . $doctorId . ',doctor_id',

            // bio: opsional — update deskripsi dokter
            'bio'          => 'nullable|string|max:1000',

            // is_active: toggle aktif/nonaktif dokter
            'is_active'    => 'nullable|boolean',

            // is_available: toggle ketersediaan untuk booking baru
            'is_available' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'spec_id.exists'      => 'Spesialisasi tidak ditemukan.',
            'license_no.unique'   => 'Nomor lisensi sudah digunakan oleh dokter lain.',
            'license_no.max'      => 'Nomor lisensi maksimal 100 karakter.',
            'bio.max'             => 'Bio maksimal 1000 karakter.',
        ];
    }
}