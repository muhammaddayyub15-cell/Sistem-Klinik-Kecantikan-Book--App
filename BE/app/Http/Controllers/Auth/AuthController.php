<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\AuthService; // ✅ FIX namespace
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// AuthController: handle request auth (register, login, logout, me, refresh)
class AuthController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected AuthService $authService) {}

    // fungsi: register user baru
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return $this->successResponse(
            data: $result,
            message: 'Registrasi berhasil.',
            code: Response::HTTP_CREATED
        );
    }

    // fungsi: login user
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        return $this->successResponse(
            data: $result,
            message: 'Login berhasil.'
        );
    }

    // fungsi: logout (hapus token aktif)
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return $this->successResponse(
            data: null,
            message: 'Logout berhasil.'
        );
    }

    // fungsi: ambil data user login (safe response)
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('patient');

        return $this->successResponse([
            'user_id'    => $user->user_id,
            'full_name'  => $user->full_name,
            'email'      => $user->email,
            'role'       => $user->role,
            'patient_id' => $user->patient?->patient_id,
        ]);
    }

    // fungsi: validasi token
    public function validateToken(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->successResponse([
            'user_id' => $user->user_id,
            'email'   => $user->email,
            'role'    => $user->role,
            'name'    => $user->full_name,
        ], 'Token valid.');
    }

    // fungsi: refresh token (rotating token)
    public function refresh(Request $request): JsonResponse
    {
        $result = $this->authService->refresh($request->user());

        return $this->successResponse(
            data: $result,
            message: 'Token diperbarui.'
        );
    }
}