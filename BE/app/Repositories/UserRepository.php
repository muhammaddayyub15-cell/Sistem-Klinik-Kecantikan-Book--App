<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\BaseRepository;

// UserRepository: handling query khusus untuk user
class UserRepository extends BaseRepository
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    // findByEmail: dipakai AuthService saat login & cek duplikat email saat register
    public function findByEmail(string $email): ?User
    {
        return $this->model
            ->where('email', $email)
            ->first();
    }

    // updateLastLogin: update timestamp login terakhir — dipanggil AuthService setelah login berhasil
    public function updateLastLogin(int $userId): User
    {
        $user = $this->findOrFail($userId);

        $user->update([
            'last_login_at' => now(),
        ]);

        // refresh() dipakai agar konsisten dengan custom PK user_id (fresh() bisa query pakai 'id')
        return $user->refresh();
    }

    // findWithRelations: load user beserta relasi patient & doctor — dipakai getMe / profile endpoint
    public function findWithRelations(int $id): User
    {
        return $this->model
            ->with(['patient', 'doctor'])
            ->findOrFail($id);
    }
}