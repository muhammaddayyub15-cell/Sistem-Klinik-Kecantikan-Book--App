<?php

namespace App\Events\Booking;

use App\Models\Booking;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// BookingCreated: Event yang di-fire setelah booking berhasil dibuat.
// Di-listen oleh SendBookingNotificationListener untuk notifikasi internal.
class BookingCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // booking: Instance booking yang baru dibuat — diakses listener via $event->booking.
    public Booking $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }
}