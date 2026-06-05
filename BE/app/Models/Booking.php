<?php

namespace App\Models;

use App\Models\Patient;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Service;
use App\Models\MedicalRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'bookings';

    // primaryKey: custom karena migration pakai id('booking_id') bukan id()
    protected $primaryKey = 'booking_id';

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'doctor_schedule_id',
        'service_id',
        'booked_date',
        'start_time',
        'end_time',
        'status',
        'notes',
    ];

    // STATUS CONSTANTS: sumber kebenaran enum — sesuai migration
    // alur: pending → confirmed → in_progress → completed | cancelled
    const STATUS_PENDING     = 'pending';
    const STATUS_CONFIRMED   = 'confirmed';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED   = 'completed';
    const STATUS_CANCELLED   = 'cancelled';

    // FINAL_STATUSES: status yang tidak bisa diubah lagi — dipakai BookingService::updateStatus()
    const FINAL_STATUSES = [self::STATUS_COMPLETED, self::STATUS_CANCELLED];

    protected function casts(): array
    {
        return [
            // booked_date ke Carbon date
            'booked_date' => 'date',
            // start_time & end_time tetap string H:i — cast datetime bisa ambiguous di beberapa driver
            'start_time'  => 'string',
            'end_time'    => 'string',
        ];
    }

    // patient: relasi ke Patient (N:1)
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    // doctor: relasi ke Doctor (N:1)
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }

    // doctorSchedule: relasi ke DoctorSchedule (N:1)
    // foreignKey: doctor_schedule_id → ownerKey: schedule_id (custom PK di doctor_schedules)
    public function doctorSchedule(): BelongsTo
    {
        return $this->belongsTo(DoctorSchedule::class, 'doctor_schedule_id', 'schedule_id');
    }

    // service: relasi ke Service (N:1)
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_id', 'service_id');
    }

    // medicalRecord: relasi ke MedicalRecord (1:1) — terbentuk setelah dokter input rekam medis
    public function medicalRecord(): HasOne
    {
        return $this->hasOne(MedicalRecord::class, 'booking_id', 'booking_id');
    }

    // isFinalized: cek apakah booking sudah final — dipakai sebelum update status
    public function isFinalized(): bool
    {
        return in_array($this->status, self::FINAL_STATUSES);
    }
}