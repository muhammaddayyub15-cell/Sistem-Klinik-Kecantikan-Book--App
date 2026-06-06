<?php

namespace App\Notifications;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Notifications\Notification;

// BookingCreatedNotification: Notifikasi saat booking berhasil dibuat.
// Disimpan ke tabel notifications — dibaca frontend via GET /notifications.
class BookingCreatedNotification extends Notification
{
    public function __construct(protected Booking $booking) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $date = Carbon::parse($this->booking->booked_date)->format('d M Y');

        return [
            'type'        => 'booking_created',
            'title'       => 'Booking Berhasil Dibuat',
            'message'     => "Booking kamu dengan Dr. {$this->booking->doctor->user->full_name} pada {$date} telah dibuat.",
            'booking_id'  => $this->booking->booking_id,
            'doctor_name' => $this->booking->doctor->user->full_name,
            'service'     => $this->booking->service->service_name,
            'date'        => $date,
            'status'      => $this->booking->status,
        ];
    }
}