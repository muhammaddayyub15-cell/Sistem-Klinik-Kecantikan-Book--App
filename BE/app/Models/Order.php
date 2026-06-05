<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

// Model Order: merepresentasikan transaksi pembelian oleh pasien.
//
// SNAPSHOT PATTERN (tetap dipertahankan untuk data pasien & produk):
//   - patient_id_snapshot   : ID pasien saat order dibuat — untuk referensi historis
//   - patient_name_snapshot : nama pasien saat order dibuat — tidak berubah meski profil di-update
//
// FK HIDUP (karena sekarang satu database):
//   - booking_id : FK ke tabel bookings — nullable, order bisa tanpa booking
//
// Status order:
//   pending → paid (setelah webhook Midtrans sukses)
//           → cancelled (dibatalkan pasien atau admin)
class Order extends Model
{
    use SoftDeletes;

    protected $table = 'orders';

    protected $primaryKey = 'order_id';

    protected $fillable = [
        'order_number',
        'patient_id_snapshot',   // snapshot ID pasien — immutable
        'patient_name_snapshot', // snapshot nama pasien — immutable
        'booking_id',            // FK hidup ke bookings — nullable
        'total_amount',
        'status',                // pending | paid | cancelled
        'paid_at',
        'completed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'paid_at'      => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    // booking: relasi ke booking terkait — nullable, tidak semua order dari booking
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id', 'booking_id');
    }

    // orderItems: detail produk dalam order ini (1:N)
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }

    // payment: satu order memiliki satu record pembayaran (1:1)
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class, 'order_id', 'order_id');
    }
}