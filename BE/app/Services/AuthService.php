<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use App\Repositories\PatientRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

// AuthService: Business logic authentication.
// Tidak extend BaseService — logic register melibatkan dua repository sekaligus (User + Patient).
class AuthService
{
    public function __construct(
        protected UserRepository    $userRepository,
        protected PatientRepository $patientRepository
    ) {}

    // register: Buat user + patient profile + token dalam satu transaction.
    // Alur: validasi email → create user → create patient → generate token
    public function register(array $data): array
    {
        return DB::transaction(function () use ($data) {

            if ($this->userRepository->findByEmail($data['email'])) {
                throw ValidationException::withMessages([
                    'email' => 'Email already registered.',
                ]);
            }

            $user = $this->userRepository->create([
                'full_name' => $data['full_name'],
                'email'     => $data['email'],
                'password'  => Hash::make($data['password']),
                'role'      => 'patient',
                'status'    => 'active',
            ]);

            $this->patientRepository->create([
                'user_id'       => $user->user_id,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'gender'        => $data['gender']        ?? null,
                'blood_type'    => $data['blood_type']    ?? null,
                'address'       => $data['address']       ?? null,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return [
                'user'  => $user,
                'token' => $token,
            ];
        });
    }

    // login: Validasi kredensial + update last login + generate token.
    public function login(array $credentials): array
    {
        $user = $this->userRepository->findByEmail($credentials['email']);

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Account is inactive.'],
            ]);
        }

        $this->userRepository->updateLastLogin($user->user_id);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user'  => $user,
            'token' => $token,
        ];
    }

    // logout: Hapus token aktif saat ini — token lain milik user tetap valid.
    public function logout(User $user): void
    {
        /** @var PersonalAccessToken $token */
        $token = $user->currentAccessToken();
        if ($token) {
            $token->delete();
        }
    }

    // refresh: Rotating token — hapus token lama, buat token baru.
    public function refresh(User $user): array
    {
        /** @var PersonalAccessToken $token */
        $token = $user->currentAccessToken();
        $token->delete();

        $newToken = $user->createToken('auth_token')->plainTextToken;

        return [
            'user'  => $user,
            'token' => $newToken,
        ];
    }
}