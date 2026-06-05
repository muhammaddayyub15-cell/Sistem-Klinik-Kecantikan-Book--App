<?php

namespace App\Repositories;

use App\Models\Patient;

// PatientRepository: Query layer untuk tabel patients.
// Mewarisi operasi CRUD dasar dari BaseRepository.
class PatientRepository extends BaseRepository
{
    public function __construct(Patient $model)
    {
        parent::__construct($model);
    }

    // findByUserId: Ambil profil pasien berdasarkan user_id.
    // Dipakai saat login — mengambil patient terkait dari user yang sedang auth.
    public function findByUserId(int $userId): ?Patient
    {
        return $this->model->where('user_id', $userId)->first();
    }

    // findAllWithUser: Ambil semua pasien beserta data akun user-nya.
    // Dipakai di admin panel untuk listing pasien dengan info akun.
    public function findAllWithUser()
    {
        return $this->model->with('user')->get();
    }
}