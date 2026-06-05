<?php

namespace App\Models;

use App\Models\Doctor;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DoctorSchedule extends Model
{
    use HasFactory;

    protected $table = 'doctor_schedules';

    // primaryKey: custom karena migration pakai id('schedule_id') bukan id()
    protected $primaryKey = 'schedule_id';

    protected $fillable = [
        'doctor_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            // start_time & end_time: string H:i — cast datetime bisa ambiguous untuk kolom time
            'start_time' => 'string',
            'end_time'   => 'string',
            'is_active'  => 'boolean',
        ];
    }

    // doctor: relasi ke Doctor (N:1)
    // foreignKey eksplisit karena Doctor pakai custom PK doctor_id
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }
}