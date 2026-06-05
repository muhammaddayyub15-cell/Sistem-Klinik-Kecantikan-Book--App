<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // prepareForValidation: sanitasi email sebelum validasi — lowercase & trim whitespace
    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower(trim($this->email ?? '')),
        ]);
    }

    public function rules(): array
    {
        return [
            // email:rfc,dns — validasi format RFC + cek DNS agar tidak bisa pakai domain palsu
            'email'    => 'required|email:rfc,dns',
            'password' => 'required|string|min:6',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required'    => 'Email wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
            'password.min'      => 'Password minimal 6 karakter.',
        ];
    }
}