<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Booking\BookingController;
use App\Http\Controllers\Doctor\DoctorController;
use App\Http\Controllers\Doctor\ScheduleController;
use App\Http\Controllers\Product\ProductController;
use App\Http\Controllers\Medical\MedicalController;
use App\Http\Controllers\Order\OrderController;
use App\Http\Controllers\Patient\PatientController;
use App\Http\Controllers\Payment\PaymentController;
use App\Http\Controllers\Product\ProductCategoryController;
use App\Http\Controllers\Service\ServiceController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Admin\DashboardController;
use Illuminate\Support\Facades\Route;

// ── Auth ───────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {

    // Publik
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    // Private
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout',  [AuthController::class, 'logout']);
        Route::get('/me',       [AuthController::class, 'me']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
    });
});

// ── Doctor ─────────────────────────────────────────────────────────────
Route::prefix('doctors')->group(function () {

    // Publik — dipakai BookingPage frontend untuk dropdown dokter & slot
    Route::get('/available',                        [DoctorController::class, 'getAvailable']);
    Route::get('/{doctorId}/schedules/active',      [ScheduleController::class, 'active']);
    Route::get('/',                                 [DoctorController::class, 'index']);
    Route::get('/{id}',                             [DoctorController::class, 'show']);

    // Admin only
    Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
        Route::post('/',                                        [DoctorController::class, 'store']);
        Route::put('/{id}',                                     [DoctorController::class, 'update']);
        Route::patch('/{id}/availability',                      [DoctorController::class, 'toggleAvailability']);
        Route::delete('/{id}',                                  [DoctorController::class, 'destroy']);

        Route::get('/{doctorId}/schedules',                     [ScheduleController::class, 'index']);
        Route::post('/{doctorId}/schedules',                    [ScheduleController::class, 'store']);
        Route::put('/{doctorId}/schedules/{scheduleId}',        [ScheduleController::class, 'update']);
        Route::delete('/{doctorId}/schedules/{scheduleId}',     [ScheduleController::class, 'destroy']);
        Route::patch('/{doctorId}/schedules/{scheduleId}/toggle',[ScheduleController::class, 'toggle']);
    });
});

// ── Patient ────────────────────────────────────────────────────────────
Route::prefix('patients')->middleware('auth:sanctum')->group(function () {

    Route::get('/',     [PatientController::class, 'index'])->middleware('role:admin,doctor');
    Route::post('/',    [PatientController::class, 'store'])->middleware('role:admin');
    Route::get('/{id}', [PatientController::class, 'show'])->middleware('role:admin,doctor,patient');
    Route::put('/{id}', [PatientController::class, 'update'])->middleware('role:admin,patient');
    Route::delete('/{id}', [PatientController::class, 'destroy'])->middleware('role:admin');
});

// ── Service ────────────────────────────────────────────────────────────
Route::prefix('services')->group(function () {

    // Publik — dipakai BookingPage frontend untuk dropdown layanan
    Route::get('/',     [ServiceController::class, 'index']);
    Route::get('/{id}', [ServiceController::class, 'show']);

    // Admin only
    Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
        Route::post('/',                [ServiceController::class, 'store']);
        Route::put('/{id}',             [ServiceController::class, 'update']);
        Route::delete('/{id}',          [ServiceController::class, 'destroy']);
        Route::patch('/{id}/toggle',    [ServiceController::class, 'toggle']);
    });
});

// ── Booking ────────────────────────────────────────────────────────────
Route::prefix('bookings')->middleware('auth:sanctum')->group(function () {

    // Filter otomatis by role di BookingService::getAllWithRelations()
    Route::get('/',     [BookingController::class, 'index'])->middleware('role:admin,doctor,patient');
    Route::post('/',    [BookingController::class, 'store'])->middleware('role:patient');
    Route::get('/{id}', [BookingController::class, 'show'])->middleware('role:admin,doctor,patient');
    // Patient hanya bisa cancel — guard role per aksi ada di BookingService::updateStatus()
    Route::patch('/{id}/status',    [BookingController::class, 'updateStatus'])->middleware('role:admin,doctor,patient');
    Route::delete('/{id}',          [BookingController::class, 'destroy'])->middleware('role:admin');
});

// ── Medical Records ────────────────────────────────────────────────────
Route::prefix('medical-records')->middleware('auth:sanctum')->group(function () {

    // Catatan: route spesifik harus di atas /{id} agar tidak bentrok
    Route::get('/patient/{patientId}',  [MedicalController::class, 'getByPatient'])->middleware('role:admin,doctor,patient');
    Route::get('/doctor/{doctorId}',    [MedicalController::class, 'getByDoctor'])->middleware('role:admin,doctor');
    Route::get('/booking/{bookingId}',  [MedicalController::class, 'getByBooking'])->middleware('role:admin,doctor,patient');

    Route::get('/',     [MedicalController::class, 'index'])->middleware('role:admin,doctor');
    Route::post('/',    [MedicalController::class, 'store'])->middleware('role:doctor');
    Route::get('/{id}', [MedicalController::class, 'show'])->middleware('role:admin,doctor,patient');
    Route::put('/{id}', [MedicalController::class, 'update'])->middleware('role:doctor');
    Route::delete('/{id}', [MedicalController::class, 'destroy'])->middleware('role:admin');

    Route::post('/{id}/prescriptions',  [MedicalController::class, 'addPrescriptions'])->middleware('role:doctor');
    Route::put('/{id}/prescriptions',   [MedicalController::class, 'replacePrescriptions'])->middleware('role:doctor');
});

// ── Order ──────────────────────────────────────────────────────────────
Route::prefix('orders')->middleware('auth:sanctum')->group(function () {

    // Catatan: route spesifik harus di atas /{id} agar tidak bentrok
    Route::get('/patient/{patientId}',  [OrderController::class, 'getByPatient'])->middleware('role:admin,patient');
    Route::get('/status/{status}',      [OrderController::class, 'getByStatus'])->middleware('role:admin');

    Route::get('/',     [OrderController::class, 'index'])->middleware('role:admin');
    Route::post('/',    [OrderController::class, 'store'])->middleware('role:patient');
    Route::get('/{id}', [OrderController::class, 'show'])->middleware('role:admin,patient');
    // cancel — patient hanya bisa cancel order miliknya sendiri, guard di OrderService
    Route::patch('/{id}/cancel',    [OrderController::class, 'cancel'])->middleware('role:admin,patient');
    Route::patch('/{id}/status',    [OrderController::class, 'updateStatus'])->middleware('role:admin');
});

// ── Payment ────────────────────────────────────────────────────────────
Route::prefix('payments')->group(function () {

    // Publik — dipanggil server Midtrans, verifikasi via signature key di PaymentService
    Route::post('/webhook', [PaymentController::class, 'webhook']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/initiate',            [PaymentController::class, 'initiate'])->middleware('role:patient');
        Route::get('/order/{orderId}',      [PaymentController::class, 'show'])->middleware('role:admin,patient');
    });
});

// ── Product Category ───────────────────────────────────────────────────
Route::prefix('product-categories')->group(function () {

    // Publik
    Route::get('/',     [ProductCategoryController::class, 'index']);
    Route::get('/{id}', [ProductCategoryController::class, 'show']);

    // Admin only
    Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
        Route::post('/',        [ProductCategoryController::class, 'store']);
        Route::put('/{id}',     [ProductCategoryController::class, 'update']);
        Route::delete('/{id}',  [ProductCategoryController::class, 'destroy']);
    });
});

// ── Product ────────────────────────────────────────────────────────────
Route::prefix('products')->group(function () {

    // Publik — dipakai patient untuk browse produk
    Route::get('/',     [ProductController::class, 'index']);
    Route::get('/{id}', [ProductController::class, 'show']);

    // Admin only
    Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
        Route::post('/',                    [ProductController::class, 'store']);
        Route::put('/{id}',                 [ProductController::class, 'update']);
        Route::delete('/{id}',              [ProductController::class, 'destroy']);
        // Stock diupdate via endpoint terpisah agar selalu tercatat di stock_logs
        Route::post('/{id}/stock',          [ProductController::class, 'updateStock']);
        Route::get('/{id}/stock-logs',      [ProductController::class, 'stockLogs']);
    });
});

// ── Admin Dashboard ────────────────────────────────────────────────────
// Aggregate stats — ganti ReportController dari microservice lama
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
});

// ── Notifications ──────────────────────────────────────────────────────
Route::prefix('notifications')->middleware('auth:sanctum')->group(function () {
    // Ambil semua notifikasi user yang login
    Route::get('/',             [NotificationController::class, 'index']);
    // Ambil notifikasi yang belum dibaca + count — untuk badge frontend
    Route::get('/unread',       [NotificationController::class, 'unread']);
    // Tandai satu notifikasi sebagai dibaca
    Route::patch('/{id}/read',  [NotificationController::class, 'markAsRead']);
    // Tandai semua notifikasi sebagai dibaca
    Route::patch('/read-all',   [NotificationController::class, 'markAllAsRead']);
});