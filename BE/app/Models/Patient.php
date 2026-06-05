<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

// Model Patient: profil klinis pasien, berelasi 1:1 dengan User.
// Satu pasien bisa memiliki banyak booking.
// Tidak ada relasi langsung ke Order — data pasien di-snapshot saat order dibuat.
class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'patients';

    // primaryKey custom sesuai migrasi — pakai patient_id bukan default id
    protected $primaryKey = 'patient_id';

    // eager load user agar data akun selalu tersedia tanpa N+1
    protected $with = ['user'];

    protected $fillable = [
        'user_id',
        'date_of_birth',
        'gender',
        'blood_type',
        'address',
        'medical_history', // tipe text — bisa diubah ke JSON jika diperlukan
    ];

    protected function casts(): array
    {
        return [
            // date_of_birth di-cast ke Carbon date untuk kemudahan kalkulasi umur
            'date_of_birth' => 'date',
        ];
    }

    // user: relasi balik ke akun (1:1)
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    // bookings: satu pasien bisa memiliki banyak booking (1:N)
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'patient_id', 'patient_id');
    }
}