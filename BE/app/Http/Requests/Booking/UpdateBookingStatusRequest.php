<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Booking;

class UpdateBookingStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // status valid: pakai konstanta dari Booking model agar tidak hardcode string
        // alur: pending → confirmed → in_progress → completed | cancelled
        $validStatuses = implode(',', [
            Booking::STATUS_PENDING,
            Booking::STATUS_CONFIRMED,
            Booking::STATUS_IN_PROGRESS,
            Booking::STATUS_COMPLETED,
            Booking::STATUS_CANCELLED,
        ]);

        return [
            'status' => "required|string|in:{$validStatuses}",

            // notes: opsional — bisa diisi alasan cancel atau catatan tambahan
            'notes'  => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status wajib diisi.',
            'status.in'       => 'Status tidak valid. Pilihan: pending, confirmed, in_progress, completed, cancelled.',
            'notes.max'       => 'Catatan maksimal 500 karakter.',
        ];
    }
}