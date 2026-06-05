<?php

namespace App\Services;

use App\Repositories\ServiceRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

// ServiceService: Business logic untuk manajemen layanan klinik.
// Extend BaseService — pakai find, findOrFail, delete dari base.
// createService dan updateService override create/update dengan validasi nama duplikat.
class ServiceService extends BaseService
{
    public function __construct(protected ServiceRepository $serviceRepository)
    {
        parent::__construct($serviceRepository);
    }

    // getAllActive: Ambil semua service aktif — dipanggil index controller.
    // Dipakai frontend BookingPage untuk populate dropdown service.
    public function getAllActive(): Collection
    {
        return $this->serviceRepository->findActive();
    }

    // getByCategory: Ambil service aktif berdasarkan category_id.
    public function getByCategory(int $categoryId): Collection
    {
        return $this->serviceRepository->findByCategory($categoryId);
    }

    // createService: Buat service baru dengan validasi nama tidak duplikat.
    public function createService(array $data): Model
    {
        if ($this->serviceRepository->existsByName($data['service_name'])) {
            throw ValidationException::withMessages([
                'service_name' => 'Nama layanan sudah digunakan.',
            ]);
        }

        return $this->serviceRepository->create($data);
    }

    // updateService: Update service dengan validasi nama duplikat.
    // excludeId di-pass ke existsByName agar service tidak konflik dengan dirinya sendiri.
    public function updateService(int $id, array $data): Model
    {
        if (!empty($data['service_name'])) {
            if ($this->serviceRepository->existsByName($data['service_name'], $id)) {
                throw ValidationException::withMessages([
                    'service_name' => 'Nama layanan sudah digunakan.',
                ]);
            }
        }

        return $this->serviceRepository->update($id, $data);
    }

    // toggleActive: Toggle is_active — service non-aktif tidak muncul di BookingPage.
    public function toggleActive(int $id): Model
    {
        $service = $this->serviceRepository->findOrFail($id);

        return $this->serviceRepository->update($id, [
            'is_active' => !$service->is_active,
        ]);
    }
}