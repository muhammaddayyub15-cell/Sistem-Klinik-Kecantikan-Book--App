<?php

namespace App\Repositories;

use App\Models\Doctor;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;

// DoctorRepository: query layer untuk doctors
class DoctorRepository extends BaseRepository
{
    public function __construct(Doctor $model)
    {
        parent::__construct($model);
    }

    // allWithRelations: ambil semua dokter + relasi — dipakai admin list doctor
    public function allWithRelations(): Collection
    {
        return $this->model
            ->with(['user', 'specialization', 'schedules'])
            ->get();
    }

    // findAvailable: ambil dokter yang is_available = true — dipakai endpoint public /doctors/available
    public function findAvailable(): Collection
    {
        return $this->model
            ->with(['user', 'specialization', 'activeSchedules'])
            ->where('is_available', true)
            ->where('is_active', true)
            ->get();
    }

    // findBySpecialization: filter by spec_id — opsional untuk filter di admin
    public function findBySpecialization(int $specId): Collection
    {
        return $this->model
            ->with(['user', 'specialization', 'schedules'])
            ->where('spec_id', $specId)
            ->where('is_available', true)
            ->where('is_active', true)
            ->get();
    }

    // findWithSchedules: ambil satu dokter + semua jadwalnya — dipakai endpoint /doctors/:id/schedules
    public function findWithSchedules(int $doctorId): ?Doctor
    {
        return $this->model
            ->with(['user', 'specialization', 'schedules'])
            ->where('doctor_id', $doctorId)
            ->first();
    }
}