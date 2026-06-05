<?php

namespace App\Repositories;

use App\Models\DoctorSchedule;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;

// ScheduleRepository: query layer untuk doctor_schedules
class ScheduleRepository extends BaseRepository
{
    public function __construct(DoctorSchedule $model)
    {
        parent::__construct($model);
    }

    // findByDoctor: semua jadwal dokter diurutkan per hari — dipakai admin manage schedule
    public function findByDoctor(int $doctorId): Collection
    {
        return $this->model
            ->where('doctor_id', $doctorId)
            ->orderByRaw("FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')")
            ->get();
    }

    // findActiveByDoctor: jadwal aktif saja — dipakai endpoint public /doctors/:id/schedules/active
    public function findActiveByDoctor(int $doctorId): Collection
    {
        return $this->model
            ->where('doctor_id', $doctorId)
            ->where('is_active', true)
            ->orderByRaw("FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')")
            ->get();
    }

    // findByDoctorAndDay: cari jadwal aktif by hari — dipakai BookingService::createBooking() untuk resolve schedule
    public function findByDoctorAndDay(int $doctorId, string $dayOfWeek): ?DoctorSchedule
    {
        return $this->model
            ->where('doctor_id', $doctorId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->first();
    }

    // hasTimeConflict: cek overlap jadwal — dipakai ScheduleService sebelum tambah/edit jadwal
    // excludeScheduleId: skip schedule diri sendiri saat update
    public function hasTimeConflict(
        int     $doctorId,
        string  $dayOfWeek,
        string  $startTime,
        string  $endTime,
        ?int    $excludeScheduleId = null
    ): bool {
        return $this->model
            ->where('doctor_id', $doctorId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->where(function ($q) use ($startTime, $endTime) {
                // overlap: jadwal baru mulai sebelum jadwal lama selesai DAN selesai setelah jadwal lama mulai
                $q->where('start_time', '<', $endTime)
                  ->where('end_time', '>', $startTime);
            })
            ->when($excludeScheduleId, fn($q) => $q->where('schedule_id', '!=', $excludeScheduleId))
            ->exists();
    }
}