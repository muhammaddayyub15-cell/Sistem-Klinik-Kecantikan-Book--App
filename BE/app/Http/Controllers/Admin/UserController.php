<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Repositories\UserRepository;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

// UserController (Admin): endpoint khusus admin untuk query user
class UserController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected UserRepository $userRepository) {}

    // unassignedDoctors: ambil users role=doctor yang belum punya profil dokter
    // Dipakai DoctorForm FE saat admin create doctor baru — dropdown pilih user
    public function unassignedDoctors(): JsonResponse
    {
        try {
            $users = $this->userRepository->findUnassignedDoctors();
            return $this->successResponse($users);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil data user.', 500);
        }
    }
}