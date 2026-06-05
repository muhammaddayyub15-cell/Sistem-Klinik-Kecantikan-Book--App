<?php

namespace App\Repositories;

use App\Models\Booking;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;

// BookingRepository: query layer untuk bookings
class BookingRepository extends BaseRepository
{
    public function __construct(Booking $model)
    {
        parent::__construct($model);
    }

    // allWithRelations: ambil semua booking + relasi — dipakai admin dashboard
    public function allWithRelations(): Collection
    {
        return $this->model
            ->with(['patient.user', 'doctor.user', 'doctorSchedule', 'service'])
            ->latest('booked_date')
            ->get();
    }

    // findByPatient: filter booking by patient_id — dipakai role patient
    public function findByPatient(int $patientId): Collection
    {
        return $this->model
            ->with(['doctor.user', 'doctorSchedule', 'service'])
            ->where('patient_id', $patientId)
            ->latest('booked_date')
            ->get();
    }

    // findByDoctor: filter booking by doctor_id — dipakai role doctor
    public function findByDoctor(int $doctorId): Collection
    {
        return $this->model
            ->with(['patient.user', 'doctorSchedule', 'service'])
            ->where('doctor_id', $doctorId)
            ->latest('booked_date')
            ->get();
    }

    // isSlotTaken: cek apakah slot sudah diambil — exclude cancelled
    // excludeId: opsional untuk keperluan reschedule (skip booking diri sendiri)
    public function isSlotTaken(int $scheduleId, string $date, ?int $excludeId = null): bool
    {
        return $this->model
            ->where('doctor_schedule_id', $scheduleId)
            ->where('booked_date', $date)
            ->whereNotIn('status', [Booking::STATUS_CANCELLED])
            ->when($excludeId, fn($q) => $q->where('booking_id', '!=', $excludeId))
            ->exists();
    }

    // lockSlot: cek slot + lock FOR UPDATE dalam transaction — anti race condition
    // dipanggil BookingService::createBooking() di dalam DB::transaction
    public function lockSlot(int $scheduleId, string $date): bool
    {
        return $this->model
            ->where('doctor_schedule_id', $scheduleId)
            ->where('booked_date', $date)
            ->whereNotIn('status', [Booking::STATUS_CANCELLED])
            ->lockForUpdate()
            ->exists();
    }
}