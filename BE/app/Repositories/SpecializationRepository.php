<?php

namespace App\Repositories;

use App\Models\Specialization;
use Illuminate\Database\Eloquent\Collection;

// SpecializationRepository: Query untuk tabel specializations.
// Dipakai SpecializationService — admin DoctorForm dropdown spesialisasi.
class SpecializationRepository extends BaseRepository
{
    public function __construct(Specialization $model)
    {
        parent::__construct($model);
    }

    // allOrdered: Ambil semua spesialisasi urut abjad — dipakai dropdown DoctorForm.
    public function allOrdered(): Collection
    {
        return $this->model
            ->orderBy('spec_name')
            ->get();
    }

    // findWithDoctors: Ambil satu spesialisasi beserta daftar dokternya.
    // @param int $id — spec_id
    public function findWithDoctors(int $id): Specialization
    {
        /** @var Specialization $spec */
        $spec = $this->model
            ->with('doctors.user')
            ->findOrFail($id);

        return $spec;
    }
}