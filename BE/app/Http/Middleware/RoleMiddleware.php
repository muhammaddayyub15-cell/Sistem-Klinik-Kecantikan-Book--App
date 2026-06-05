<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// RoleMiddleware: Cek role user dari Sanctum session.
// Wajib dipakai setelah middleware auth:sanctum.
// Contoh: Route::middleware(['auth:sanctum', 'role:admin,doctor'])->group(...)
class RoleMiddleware
{
    // handle: Izinkan akses jika role user ada di daftar $roles.
    // Return 401 jika belum auth, 403 jika role tidak sesuai.
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        if (!in_array($user->role, $roles)) {
            return response()->json([
                'success'        => false,
                'message'        => 'Forbidden. You do not have access to this resource.',
                'your_role'      => $user->role,
                'required_roles' => $roles,
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}