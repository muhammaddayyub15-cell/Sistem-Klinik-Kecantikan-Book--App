<?php

namespace App\Services;

use App\Repositories\SpecializationRepository;
use Illuminate\Database\Eloquent\Collection;

// SpecializationService: Business logic untuk specializations.
// Saat ini read-only — admin hanya butuh dropdown spesialisasi di DoctorForm.
// CRUD bisa ditambah di sini bila dibutuhkan di masa depan.
class SpecializationService
{
    public function __construct(
        protected SpecializationRepository $specializationRepository
    ) {}

    // getAll: Ambil semua spesialisasi urut abjad — dipakai DoctorForm dropdown.
    public function getAll(): Collection
    {
        return $this->specializationRepository->allOrdered();
    }

    // getById: Ambil satu spesialisasi beserta dokternya.
    // @param int $id — spec_id
    public function getById(int $id): \App\Models\Specialization
    {
        return $this->specializationRepository->findWithDoctors($id);
    }
}