<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Notifications\Notification;

// PaymentSuccessNotification: Notifikasi saat pembayaran berhasil dikonfirmasi Midtrans.
// Di-fire dari PaymentService::handleSettlement() setelah status order di-update ke 'paid'.
class PaymentSuccessNotification extends Notification
{
    public function __construct(protected Order $order) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        // Cast ke float eksplisit — total_amount di-cast decimal oleh Eloquent
        $amount = number_format((float) $this->order->total_amount, 0, ',', '.');

        return [
            'type'         => 'payment_success',
            'title'        => 'Pembayaran Berhasil',
            'message'      => "Pembayaran untuk order #{$this->order->order_number} sebesar Rp {$amount} telah berhasil.",
            'order_id'     => $this->order->order_id,
            'order_number' => $this->order->order_number,
            'total_amount' => $this->order->total_amount,
        ];
    }
}