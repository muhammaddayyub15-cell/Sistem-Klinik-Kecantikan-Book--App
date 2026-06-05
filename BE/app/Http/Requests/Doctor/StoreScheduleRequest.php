<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class StoreScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        // otorisasi role sudah ditangani middleware 'role:admin'
        return true;
    }

    public function rules(): array
    {
        return [
            // day_of_week: harus salah satu dari 7 hari — case sensitive sesuai Carbon::format('l')
            'day_of_week' => ['required', 'string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],

            // start_time & end_time: format H:i sesuai migration kolom time
            'start_time'  => ['required', 'date_format:H:i'],
            'end_time'    => ['required', 'date_format:H:i', 'after:start_time'],

            // is_active: default true jika tidak dikirim
            'is_active'   => ['sometimes', 'boolean'],

            // catatan: conflict check waktu dilakukan di ScheduleService via hasTimeConflict()
            // tidak bisa dilakukan di Request karena butuh doctor_id dari route parameter
        ];
    }

    public function messages(): array
    {
        return [
            'day_of_week.required'   => 'Hari wajib diisi.',
            'day_of_week.in'         => 'Hari harus salah satu dari: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.',
            'start_time.required'    => 'Jam mulai wajib diisi.',
            'start_time.date_format' => 'Format jam mulai harus HH:MM (contoh: 08:00).',
            'end_time.required'      => 'Jam selesai wajib diisi.',
            'end_time.date_format'   => 'Format jam selesai harus HH:MM (contoh: 17:00).',
            'end_time.after'         => 'Jam selesai harus setelah jam mulai.',
        ];
    }
}