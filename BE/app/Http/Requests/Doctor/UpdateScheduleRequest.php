<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class UpdateScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        // otorisasi role sudah ditangani middleware 'role:admin'
        return true;
    }

    public function rules(): array
    {
        return [
            // 'sometimes' → field boleh tidak dikirim (partial update)
            'day_of_week' => ['sometimes', 'string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
            'start_time'  => ['sometimes', 'date_format:H:i'],

            // end_time: after:start_time hanya berlaku jika start_time ikut dikirim
            // jika hanya end_time yang dikirim, validasi after dilakukan di ScheduleService
            'end_time'    => ['sometimes', 'date_format:H:i', 'after:start_time'],

            'is_active'   => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'day_of_week.in'         => 'Hari harus salah satu dari: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.',
            'start_time.date_format' => 'Format jam mulai harus HH:MM (contoh: 08:00).',
            'end_time.date_format'   => 'Format jam selesai harus HH:MM (contoh: 17:00).',
            'end_time.after'         => 'Jam selesai harus setelah jam mulai.',
        ];
    }
}