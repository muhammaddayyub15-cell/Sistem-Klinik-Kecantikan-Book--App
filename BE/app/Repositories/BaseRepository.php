<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Model;

// BaseRepository: Abstract base class untuk semua repository di project ini.
// Menyediakan operasi CRUD dasar yang diwarisi oleh semua repository konkret.
//
// CATATAN: Semua repository wajib extend class ini dan inject model yang sesuai
// via constructor. Namespace ini (App\Repositories) adalah satu-satunya
// yang dipakai di monolith — namespace App\Shared\Base dan App\Service\Repositories
// sudah tidak digunakan.
abstract class BaseRepository
{
    protected Model $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    // all: Ambil semua record tanpa filter.
    // Gunakan method spesifik di child repository untuk query dengan relasi atau filter.
    public function all()
    {
        return $this->model->all();
    }

    // find: Cari record berdasarkan primary key, return null jika tidak ditemukan.
    public function find(int $id)
    {
        return $this->model->find($id);
    }

    // findOrFail: Cari record berdasarkan primary key, throw ModelNotFoundException jika tidak ada.
    public function findOrFail(int $id): Model
    {
        return $this->model->findOrFail($id);
    }

    // create: Buat record baru dan kembalikan instance yang sudah di-refresh.
    // refresh() dipakai (bukan fresh()) agar custom $primaryKey seperti patient_id,
    // product_id, order_id tetap terbaca dengan benar setelah insert.
    public function create(array $attributes): Model
    {
        $model = $this->model->create($attributes);
        return $model->refresh();
    }

    // update: Update record berdasarkan primary key dan kembalikan instance terbaru.
    // refresh() dipakai untuk alasan yang sama seperti create().
    public function update(int $id, array $attributes): Model
    {
        $record = $this->findOrFail($id);
        $record->update($attributes);
        return $record->refresh();
    }

    // delete: Hapus record berdasarkan primary key.
    // Jika model menggunakan SoftDeletes, ini akan soft delete (set deleted_at).
    public function delete(int $id): bool
    {
        $record = $this->findOrFail($id);
        return $record->delete();
    }
}