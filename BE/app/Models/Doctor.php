<?php

namespace App\Models;

use App\Models\User;
use App\Models\DoctorSchedule;
use App\Models\Specialization;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Doctor extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'doctors';

    // primaryKey: custom karena migration pakai id('doctor_id') bukan id()
    protected $primaryKey = 'doctor_id';

    protected $fillable = [
        'user_id',
        'spec_id',
        'license_no',
        'bio',
        'is_active',
        'is_available',
    ];

    protected function casts(): array
    {
        return [
            // is_active: toggle aktif/nonaktif dokter tanpa hapus data
            'is_active'    => 'boolean',
            // is_available: toggle ketersediaan dokter untuk booking baru
            'is_available' => 'boolean',
        ];
    }

    // user: relasi ke User — identitas login dokter (1:1)
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    // specialization: relasi ke Specialization (N:1)
    public function specialization(): BelongsTo
    {
        return $this->belongsTo(Specialization::class, 'spec_id', 'spec_id');
    }

    // schedules: semua jadwal dokter (1:N)
    public function schedules(): HasMany
    {
        return $this->hasMany(DoctorSchedule::class, 'doctor_id', 'doctor_id');
    }

    // activeSchedules: jadwal aktif saja — dipakai endpoint /doctors/:id/schedules/active
    public function activeSchedules(): HasMany
    {
        return $this->hasMany(DoctorSchedule::class, 'doctor_id', 'doctor_id')
            ->where('is_active', true);
    }

    // bookings: semua booking yang di-assign ke dokter ini (1:N)
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'doctor_id', 'doctor_id');
    }

    // isActive: cek apakah dokter masih aktif — dipakai guard sebelum assign booking
    public function isActive(): bool
    {
        return $this->is_active === true;
    }

    // isAvailable: cek apakah dokter tersedia untuk booking baru
    public function isAvailable(): bool
    {
        return $this->is_available === true;
    }
}