<?php

namespace App\Services;

use App\Repositories\PatientRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

// PatientService: Business logic untuk manajemen profil pasien.
// Controller tidak boleh akses repository langsung — semua lewat service ini.
class PatientService extends BaseService
{
    public function __construct(
        protected PatientRepository $patientRepository
    ) {
        parent::__construct($patientRepository);
    }

    // getAllWithUser: Ambil semua pasien beserta data akun user-nya.
    // Dipakai admin panel untuk listing pasien lengkap.
    public function getAllWithUser(): Collection
    {
        return $this->patientRepository->findAllWithUser();
    }

    // getByUserId: Ambil profil pasien berdasarkan user_id.
    // Dipakai saat patient login — mengambil patient terkait dari auth user.
    public function getByUserId(int $userId): ?Model
    {
        return $this->patientRepository->findByUserId($userId);
    }

    // getById: Ambil satu profil pasien berdasarkan patient_id.
    public function getById(int $id): Model
    {
        return $this->patientRepository->findOrFail($id);
    }

    // create: Buat profil pasien baru.
    // Dipanggil dari AuthService saat register — user_id sudah ada.
    public function create(array $data): Model
    {
        return $this->patientRepository->create($data);
    }

    // update: Update profil pasien.
    public function update(int $id, array $data): Model
    {
        return $this->patientRepository->update($id, $data);
    }
}