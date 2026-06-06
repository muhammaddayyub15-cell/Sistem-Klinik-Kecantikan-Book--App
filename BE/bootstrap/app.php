<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        // api: daftarkan routes/api.php agar semua endpoint /api/* aktif
        api: __DIR__ . '/../routes/api.php',
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // CORS: HandleCors harus jadi middleware pertama di API
        // agar preflight OPTIONS request langsung dihandle sebelum auth/role check
        $middleware->prependToGroup('api', [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // role: alias untuk RoleMiddleware — dipakai di routes sebagai 'role:admin,doctor'
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Semua error di route api/* otomatis return JSON
        $exceptions->shouldRenderJsonWhen(
            fn(Request $request) => $request->is('api/*'),
        );
    })->create();