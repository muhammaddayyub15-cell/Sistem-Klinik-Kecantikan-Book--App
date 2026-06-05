<?php

namespace App\Services;

use App\Repositories\BaseRepository;

// BaseService: Abstract base class untuk semua service di project ini.
// Menyediakan delegasi CRUD dasar ke repository yang di-inject.
//
// CATATAN ARSITEKTUR:
// - Service yang butuh satu repository: inject via constructor + parent::__construct()
// - Service yang butuh lebih dari satu repository (misal OrderService, PaymentService):
//   inject semua repository via constructor child, panggil parent::__construct()
//   dengan repository utama (primary) sebagai argumen.
// - Service yang logic-nya sangat spesifik dan tidak butuh CRUD generik
//   (misal BookingService, DashboardService) tidak wajib extend class ini.
abstract class BaseService
{
    protected BaseRepository $repository;

    // __construct: Terima repository utama (primary) dari child service.
    public function __construct(BaseRepository $repository)
    {
        $this->repository = $repository;
    }

    // all: Ambil semua record — delegasi ke repository.
    public function all()
    {
        return $this->repository->all();
    }

    // find: Cari record by primary key, return null jika tidak ditemukan.
    public function find(int $id)
    {
        return $this->repository->find($id);
    }

    // findOrFail: Cari record by primary key, throw ModelNotFoundException jika tidak ada.
    public function findOrFail(int $id)
    {
        return $this->repository->findOrFail($id);
    }

    // create: Buat record baru — delegasi ke repository.
    public function create(array $attributes)
    {
        return $this->repository->create($attributes);
    }

    // update: Update record by primary key — delegasi ke repository.
    public function update(int $id, array $attributes)
    {
        return $this->repository->update($id, $attributes);
    }

    // delete: Hapus record by primary key — delegasi ke repository.
    public function delete(int $id)
    {
        return $this->repository->delete($id);
    }
}