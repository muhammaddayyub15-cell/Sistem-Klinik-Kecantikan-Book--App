<?php

namespace App\Models;

use App\Models\ServiceCategory;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

// Service: Model untuk tabel services.
// Dipakai patient saat booking untuk memilih jenis layanan klinik.
// SoftDeletes dipakai agar service yang sudah dipakai booking tidak hilang dari history.
class Service extends Model
{
    use HasFactory, SoftDeletes;

    // FIX: table name plural sesuai migration (bukan 'service')
    protected $table = 'services';

    protected $primaryKey = 'service_id';
    public $incrementing  = true;
    protected $keyType    = 'int';

    protected $fillable = [
        'category_id',
        'service_name',
        'description',
        'base_price',
        'unit',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'is_active'  => 'boolean',
        ];
    }

    // category: Relasi ke ServiceCategory (N:1).
    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id', 'category_id');
    }

    // bookings: Relasi ke Booking (1:N).
    // Service bisa dipakai di banyak booking.
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'service_id', 'service_id');
    }
}