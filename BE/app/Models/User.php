<?php

namespace App\Models;

use App\Models\Patient;
use App\Models\Doctor;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes;

    protected $table = 'users';

    // primaryKey: custom karena migration pakai id('user_id') bukan id()
    protected $primaryKey = 'user_id';

    protected $fillable = [
        'full_name',
        'email',
        'password',
        'role',
        'phone',
        'status',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // getAuthIdentifierName: override agar Sanctum menggunakan user_id sebagai tokenable_id
    public function getAuthIdentifierName(): string
    {
        return 'user_id';
    }

    // getAuthIdentifier: override agar Sanctum membaca nilai user_id
    public function getAuthIdentifier(): mixed
    {
        return $this->user_id;
    }

    // casts: mengatur tipe data otomatis — last_login_at ditambahkan karena ada di migration
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at'     => 'datetime',
            'password'          => 'hashed',
        ];
    }

    // patient: relasi user ke patient (1:1)
    public function patient(): HasOne
    {
        return $this->hasOne(Patient::class, 'user_id', 'user_id');
    }

    // doctor: relasi user ke doctor (1:1)
    public function doctor(): HasOne
    {
        return $this->hasOne(Doctor::class, 'user_id', 'user_id');
    }

    // isAdmin: cek apakah user adalah admin
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    // isDoctor: cek apakah user adalah doctor
    public function isDoctor(): bool
    {
        return $this->role === 'doctor';
    }

    // isPatient: cek apakah user adalah patient
    public function isPatient(): bool
    {
        return $this->role === 'patient';
    }

    // isStaff: cek apakah user adalah staff
    public function isStaff(): bool
    {
        return $this->role === 'staff';
    }

    // isActive: cek apakah akun masih aktif — dipakai AuthService saat login
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}