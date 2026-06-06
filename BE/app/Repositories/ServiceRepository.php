<?php

namespace App\Repositories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Collection;

// ServiceRepository: Data access layer untuk tabel services.
// Extend BaseRepository untuk CRUD dasar.
// Method spesifik hanya untuk query yang tidak bisa di-cover BaseRepository.
class ServiceRepository extends BaseRepository
{
    public function __construct(Service $service)
    {
        parent::__construct($service);
    }

    // findActive: Ambil semua service dengan is_active = true, urut by nama.
    // Dipakai oleh ServiceService::getAllActive() → BookingPage frontend.
    public function findActive(): Collection
    {
        return $this->model
            ->where('is_active', true)
            ->orderBy('service_name')
            ->get();
    }

    // findByCategory: Ambil service aktif berdasarkan category_id.
    public function findByCategory(int $categoryId): Collection
    {
        return $this->model
            ->where('category_id', $categoryId)
            ->where('is_active', true)
            ->get();
    }

    // existsByName: Cek apakah nama service sudah dipakai, case-insensitive.
    // excludeId: opsional — exclude record tertentu saat update agar tidak false positive.
    public function existsByName(string $name, ?int $excludeId = null): bool
    {
        return $this->model
            ->whereRaw('LOWER(service_name) = ?', [strtolower($name)])
            ->when($excludeId, fn($q) => $q->where('service_id', '!=', $excludeId))
            ->exists();
    }

    // findAll: Ambil semua service urut by nama — tanpa filter is_active.
    // Dipakai admin untuk tampilkan semua service termasuk yang non-aktif.
    public function findAll(): Collection
    {
        return $this->model->orderBy('service_name')->get();
    }
}
