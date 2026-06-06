<?php

namespace App\Notifications;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Notifications\Notification;

// BookingStatusUpdatedNotification: Notifikasi saat status booking berubah.
// Di-fire dari BookingService::updateStatus() setelah update berhasil.
class BookingStatusUpdatedNotification extends Notification
{
    public function __construct(protected Booking $booking) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $doctorName = $this->booking->doctor->user->full_name;
        $date       = Carbon::parse($this->booking->booked_date)->format('d M Y');

        $message = match ($this->booking->status) {
            'confirmed'   => "Booking kamu dengan Dr. {$doctorName} telah dikonfirmasi.",
            'in_progress' => "Booking kamu dengan Dr. {$doctorName} sedang berlangsung.",
            'completed'   => "Booking kamu dengan Dr. {$doctorName} telah selesai.",
            'cancelled'   => "Booking kamu dengan Dr. {$doctorName} telah dibatalkan.",
            default       => "Status booking kamu telah diperbarui menjadi {$this->booking->status}.",
        };

        return [
            'type'        => 'booking_status_updated',
            'title'       => 'Status Booking Diperbarui',
            'message'     => $message,
            'booking_id'  => $this->booking->booking_id,
            'doctor_name' => $doctorName,
            'service'     => $this->booking->service->service_name,
            'date'        => $date,
            'status'      => $this->booking->status,
        ];
    }
}