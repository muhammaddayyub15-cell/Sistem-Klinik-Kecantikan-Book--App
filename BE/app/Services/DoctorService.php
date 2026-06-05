<?php

namespace App\Services;

use App\Repositories\DoctorRepository;
use App\Repositories\UserRepository;
use App\Services\BaseService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

// DoctorService: business logic untuk doctor
class DoctorService extends BaseService
{
    public function __construct(
        protected DoctorRepository $doctorRepository,
        protected UserRepository   $userRepository,
    ) {
        parent::__construct($doctorRepository);
    }

    // getAllWithRelations: ambil semua dokter + relasi — dipakai admin list doctor
    public function getAllWithRelations(): Collection
    {
        return $this->doctorRepository->allWithRelations();
    }

    // getAvailable: ambil dokter yang aktif & tersedia — dipakai endpoint public /doctors/available
    public function getAvailable(): Collection
    {
        return $this->doctorRepository->findAvailable();
    }

    // getBySpecialization: filter dokter by spesialisasi
    public function getBySpecialization(int $specId): Collection
    {
        return $this->doctorRepository->findBySpecialization($specId);
    }

    // getWithSchedules: ambil detail dokter + jadwal — dipakai endpoint /doctors/:id/schedules
    public function getWithSchedules(int $doctorId)
    {
        $doctor = $this->doctorRepository->findWithSchedules($doctorId);

        if (!$doctor) {
            throw new \Exception('Dokter tidak ditemukan.', 404);
        }

        return $doctor;
    }

    // createDoctor: buat profil dokter baru — validasi user harus role doctor
    public function createDoctor(array $data)
    {
        $user = $this->userRepository->findOrFail($data['user_id']);

        if ($user->role !== 'doctor') {
            throw ValidationException::withMessages([
                'user_id' => 'User harus memiliki role doctor.',
            ]);
        }

        return $this->doctorRepository->create($data);
    }

    // updateDoctor: update profil dokter — pakai doctor_id bukan id generic
    public function updateDoctor(int $id, array $data)
    {
        $doctor = $this->doctorRepository->findOrFail($id);

        return $this->doctorRepository->update($doctor->doctor_id, $data);
    }

    // toggleAvailability: toggle is_available — buka/tutup slot booking sementara
    public function toggleAvailability(int $id)
    {
        $doctor = $this->doctorRepository->findOrFail($id);

        return $this->doctorRepository->update($id, [
            'is_available' => !$doctor->is_available,
        ]);
    }

    // toggleActive: toggle is_active — aktifkan/nonaktifkan dokter secara permanen
    // berbeda dengan toggleAvailability: is_active = false berarti dokter tidak muncul sama sekali
    public function toggleActive(int $id)
    {
        $doctor = $this->doctorRepository->findOrFail($id);

        return $this->doctorRepository->update($id, [
            'is_active' => !$doctor->is_active,
        ]);
    }
}