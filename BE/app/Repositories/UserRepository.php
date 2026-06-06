<?php

namespace App\Repositories;

use App\Models\User;

// UserRepository: Query khusus untuk tabel users.
// Dipakai AuthService untuk login, register, dan profile.
class UserRepository extends BaseRepository
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    // findByEmail: Cari user berdasarkan email — dipakai saat login & cek duplikat register.
    public function findByEmail(string $email): ?User
    {
        return $this->model
            ->where('email', $email)
            ->first();
    }

    // updateLastLogin: Update timestamp login terakhir — dipanggil AuthService setelah login berhasil.
    // Cast ke User eksplisit karena findOrFail() dari BaseRepository return Model.
    public function updateLastLogin(int $userId): User
    {
        /** @var User $user */
        $user = $this->findOrFail($userId);

        $user->update(['last_login_at' => now()]);

        // refresh() agar konsisten dengan custom PK user_id
        return $user->refresh();
    }

    // findWithRelations: Load user beserta relasi patient & doctor.
    // Dipakai getMe() dan profile endpoint.
    // Cast ke User eksplisit karena findOrFail() dari BaseRepository return Model.
    public function findWithRelations(int $id): User
    {
        /** @var User $user */
        $user = $this->model
            ->with(['patient', 'doctor'])
            ->findOrFail($id);

        return $user;
    }
}