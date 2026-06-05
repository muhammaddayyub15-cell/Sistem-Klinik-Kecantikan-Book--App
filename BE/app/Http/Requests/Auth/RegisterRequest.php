<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // prepareForValidation: sanitasi sebelum validasi
    // role di-default ke 'patient' — register publik hanya untuk pasien
    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower(trim($this->email ?? '')),
            'role'  => 'patient', // hardcode: abaikan role dari request, selalu patient
        ]);
    }

    public function rules(): array
    {
        return [
            'full_name' => 'required|string|max:255',

            'email' => [
                'required',
                // email:rfc,dns — format RFC + DNS check
                'email:rfc,dns',
                // unique check — fallback duplikat di AuthService tetap ada sebagai double guard
                'unique:users,email',
            ],

            'password' => [
                'required',
                'confirmed',
                // Password::min(8) — min 8 karakter, harus ada huruf & angka
                Password::min(8)
                    ->letters()
                    ->numbers(),
            ],

            'password_confirmation' => 'required',

            // phone: opsional — boleh null, max 20 karakter sesuai migration
            'phone' => 'nullable|string|max:20',

            // field patient profile: opsional saat register — bisa diisi kemudian lewat profile update
            'date_of_birth' => 'nullable|date|before:today',
            'gender'        => 'nullable|in:male,female',
            'blood_type'    => 'nullable|in:A,B,AB,O',
            'address'       => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required'             => 'Nama lengkap wajib diisi.',
            'email.required'                 => 'Email wajib diisi.',
            'email.email'                    => 'Format email tidak valid.',
            'email.unique'                   => 'Email sudah terdaftar.',
            'password.required'              => 'Password wajib diisi.',
            'password.confirmed'             => 'Konfirmasi password tidak cocok.',
            'password_confirmation.required' => 'Konfirmasi password wajib diisi.',
            'phone.max'                      => 'Nomor telepon maksimal 20 karakter.',
            'date_of_birth.before'           => 'Tanggal lahir tidak valid.',
            'gender.in'                      => 'Gender harus male atau female.',
            'blood_type.in'                  => 'Golongan darah tidak valid.',
        ];
    }
}
