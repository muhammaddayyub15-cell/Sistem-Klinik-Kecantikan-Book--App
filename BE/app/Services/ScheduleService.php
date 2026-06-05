<?php

namespace App\Services;

use App\Repositories\ScheduleRepository;
use App\Repositories\DoctorRepository;
use App\Services\BaseService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

// ScheduleService: business logic untuk doctor_schedules
class ScheduleService extends BaseService
{
    public function __construct(
        protected ScheduleRepository $scheduleRepository,
        protected DoctorRepository   $doctorRepository,
    ) {
        parent::__construct($scheduleRepository);
    }

    // getByDoctor: ambil semua jadwal dokter — validasi dokter exist dulu
    public function getByDoctor(int $doctorId): Collection
    {
        $this->doctorRepository->findOrFail($doctorId);

        return $this->scheduleRepository->findByDoctor($doctorId);
    }

    // getActiveByDoctor: ambil jadwal aktif saja — dipakai endpoint publik /doctors/:id/schedules/active
    public function getActiveByDoctor(int $doctorId): Collection
    {
        $this->doctorRepository->findOrFail($doctorId);

        return $this->scheduleRepository->findActiveByDoctor($doctorId);
    }

    // addSchedule: tambah jadwal baru — validasi overlap waktu di hari yang sama
    public function addSchedule(int $doctorId, array $data): mixed
    {
        $this->doctorRepository->findOrFail($doctorId);

        $this->validateNoConflict(
            doctorId:  $doctorId,
            dayOfWeek: $data['day_of_week'],
            startTime: $data['start_time'],
            endTime:   $data['end_time'],
        );

        return $this->scheduleRepository->create([
            ...$data,
            'doctor_id' => $doctorId,
        ]);
    }

    // updateSchedule: update jadwal — validasi ownership + conflict dengan exclude ID jadwal ini
    public function updateSchedule(int $doctorId, int $scheduleId, array $data): mixed
    {
        $schedule = $this->scheduleRepository->findOrFail($scheduleId);

        // ownership check: jadwal harus milik dokter yang bersangkutan
        if ($schedule->doctor_id !== $doctorId) {
            throw ValidationException::withMessages([
                'schedule_id' => 'Schedule does not belong to this doctor.',
            ]);
        }

        // resolve nilai akhir — fallback ke nilai lama jika field tidak dikirim (partial update)
        $dayOfWeek = $data['day_of_week'] ?? $schedule->day_of_week;
        $startTime = $data['start_time']  ?? $schedule->start_time;
        $endTime   = $data['end_time']    ?? $schedule->end_time;

        $this->validateNoConflict(
            doctorId:          $doctorId,
            dayOfWeek:         $dayOfWeek,
            startTime:         $startTime,
            endTime:           $endTime,
            excludeScheduleId: $scheduleId,
        );

        return $this->scheduleRepository->update($scheduleId, $data);
    }

    // deleteSchedule: hapus jadwal — validasi ownership sebelum delete
    public function deleteSchedule(int $doctorId, int $scheduleId): void
    {
        $schedule = $this->scheduleRepository->findOrFail($scheduleId);

        if ($schedule->doctor_id !== $doctorId) {
            throw ValidationException::withMessages([
                'schedule_id' => 'Schedule does not belong to this doctor.',
            ]);
        }

        $this->scheduleRepository->delete($scheduleId);
    }

    // toggleActive: toggle is_active jadwal — validasi ownership sebelum toggle
    public function toggleActive(int $doctorId, int $scheduleId): mixed
    {
        $schedule = $this->scheduleRepository->findOrFail($scheduleId);

        if ($schedule->doctor_id !== $doctorId) {
            throw ValidationException::withMessages([
                'schedule_id' => 'Schedule does not belong to this doctor.',
            ]);
        }

        return $this->scheduleRepository->update($scheduleId, [
            'is_active' => !$schedule->is_active,
        ]);
    }

    // validateNoConflict: helper — throw ValidationException jika ada overlap waktu
    // dipanggil addSchedule & updateSchedule sebelum persist ke DB
    private function validateNoConflict(
        int    $doctorId,
        string $dayOfWeek,
        string $startTime,
        string $endTime,
        ?int   $excludeScheduleId = null,
    ): void {
        // guard: end_time harus setelah start_time
        if ($startTime >= $endTime) {
            throw ValidationException::withMessages([
                'end_time' => 'End time must be after start time.',
            ]);
        }

        $conflict = $this->scheduleRepository->hasTimeConflict(
            doctorId:          $doctorId,
            dayOfWeek:         $dayOfWeek,
            startTime:         $startTime,
            endTime:           $endTime,
            excludeScheduleId: $excludeScheduleId,
        );

        if ($conflict) {
            throw ValidationException::withMessages([
                'day_of_week' => "Doctor already has an active schedule that overlaps on {$dayOfWeek} at the given time.",
            ]);
        }
    }
}