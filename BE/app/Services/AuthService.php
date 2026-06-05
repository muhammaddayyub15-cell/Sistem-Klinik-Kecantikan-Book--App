<?php

namespace App\Services;

use App\Repositories\UserRepository;
use App\Repositories\PatientRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

// AuthService: business logic authentication
class AuthService
{
    public function __construct(
        protected UserRepository $userRepository,
        protected PatientRepository $patientRepository
    ) {}

    // fungsi: register user + patient + token
    public function register(array $data): array
    {
        return DB::transaction(function () use ($data) {

            // VALIDASI EMAIL DUPLICATE
            if ($this->userRepository->findByEmail($data['email'])) {
                throw ValidationException::withMessages([
                    'email' => 'Email already registered'
                ]);
            }

            // CREATE USER
            $user = $this->userRepository->create([
                'full_name' => $data['full_name'],
                'email'     => $data['email'],
                'password'  => Hash::make($data['password']),
                'role'      => 'patient',
                'status'    => 'active',
            ]);

            // CREATE PATIENT
            $this->patientRepository->create([
                'user_id'       => $user->user_id,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'gender'        => $data['gender'] ?? null,
                'blood_type'    => $data['blood_type'] ?? null,
                'address'       => $data['address'] ?? null,
            ]);

            // CREATE TOKEN
            $token = $user->createToken('auth_token')->plainTextToken;

            return [
                'user'  => $user,
                'token' => $token,
            ];
        });
    }

    // fungsi: login user
    public function login(array $credentials): array
    {
        $user = $this->userRepository->findByEmail($credentials['email']);

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Account is inactive'],
            ]);
        }

        $this->userRepository->updateLastLogin($user->user_id);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user'  => $user,
            'token' => $token,
        ];
    }

    // fungsi: logout user
    public function logout($user): void
    {
        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }
    }

    // fungsi: refresh token
    public function refresh($user): array
    {
        $user->currentAccessToken()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user'  => $user,
            'token' => $token,
        ];
    }
}