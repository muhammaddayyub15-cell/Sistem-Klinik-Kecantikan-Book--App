<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Http\Requests\Booking\UpdateBookingStatusRequest;
use App\Services\BookingService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected BookingService $bookingService) {}

    // index: ambil semua booking — BE filter otomatis by role dari token
    // patient → own | doctor → assigned | admin → semua
    public function index(Request $request): JsonResponse
    {
        try {
            $bookings = $this->bookingService
                ->getAllWithRelations($request->user());

            return $this->successResponse($bookings);
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal mengambil data booking.', 500);
        }
    }

    // store: buat booking baru — patient only
    // patient_id & doctor_schedule_id di-resolve BookingService dari token & booked_date
    public function store(StoreBookingRequest $request): JsonResponse
    {
        try {
            $booking = $this->bookingService
                ->createBooking($request->validated());

            return $this->createdResponse($booking, 'Booking berhasil dibuat.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors(), $e->getMessage());
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal membuat booking.', 500);
        }
    }

    // show: detail satu booking — semua role (BE guard ownership di service/policy)
    public function show(int $id): JsonResponse
    {
        try {
            $booking = $this->bookingService->findOrFail($id);

            return $this->successResponse($booking);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Booking tidak ditemukan.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal mengambil detail booking.', 500);
        }
    }

    // updateStatus: update status booking — akses berbeda per role
    // patient: hanya bisa set 'cancelled' | doctor: confirmed, in_progress, completed | admin: semua
    public function updateStatus(UpdateBookingStatusRequest $request, int $id): JsonResponse
    {
        try {
            $booking = $this->bookingService
                ->updateStatus($id, $request->validated());

            return $this->successResponse($booking, 'Status booking berhasil diperbarui.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors(), $e->getMessage());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Booking tidak ditemukan.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal memperbarui status booking.', 500);
        }
    }

    // destroy: soft delete booking — admin only
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->bookingService->delete($id);

            return $this->successResponse(null, 'Booking berhasil dihapus.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Booking tidak ditemukan.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal menghapus booking.', 500);
        }
    }
}