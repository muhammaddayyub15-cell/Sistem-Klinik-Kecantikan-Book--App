<?php

namespace App\Services;

use App\Repositories\UserRepository;
use App\Services\BaseService;
use Illuminate\Database\Eloquent\Model;

// UserService: logic layer untuk user
class UserService extends BaseService
{
    protected UserRepository $userRepository;

    public function __construct(UserRepository $repository)
    {
        parent::__construct($repository);
        $this->userRepository = $repository;
    }

    // fungsi: cari user by email
    public function findByEmail(string $email): ?Model
    {
        return $this->userRepository->findByEmail($email);
    }

    // fungsi: update last login
    public function updateLastLogin(int $userId): void
    {
        $this->userRepository->updateLastLogin($userId);
    }
}