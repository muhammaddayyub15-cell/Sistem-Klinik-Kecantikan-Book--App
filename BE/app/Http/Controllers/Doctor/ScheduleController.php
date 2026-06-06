<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StoreScheduleRequest;
use App\Http\Requests\Doctor\UpdateScheduleRequest;
use App\Repositories\BookingRepository;
use App\Services\ScheduleService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ScheduleController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        protected ScheduleService   $scheduleService,
        // BookingRepository di-inject langsung di controller karena ini read-only query,
        // tidak perlu lewat BookingService yang membawa logika bisnis booking.
        protected BookingRepository $bookingRepository,
    ) {}

    // index: ambil semua jadwal dokter — admin & dokter yang bersangkutan
    // GET /doctors/{doctorId}/schedules
    public function index(int $doctorId): JsonResponse
    {
        try {
            $schedules = $this->scheduleService->getByDoctor($doctorId);

            return $this->successResponse($schedules);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Dokter tidak ditemukan.', 404);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil jadwal dokter.', 500);
        }
    }

    // active: ambil jadwal aktif saja — publik (dipakai FE saat patient booking)
    // GET /doctors/{doctorId}/schedules/active
    public function active(int $doctorId): JsonResponse
    {
        try {
            $schedules = $this->scheduleService->getActiveByDoctor($doctorId);

            return $this->successResponse($schedules);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Dokter tidak ditemukan.', 404);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil jadwal aktif dokter.', 500);
        }
    }

    // takenDates: ambil tanggal yang sudah penuh untuk satu schedule — publik.
    // Dipakai BookingPage FE untuk grey-out tanggal tidak tersedia di date picker.
    // GET /doctors/{doctorId}/schedules/{scheduleId}/taken-dates
    public function takenDates(int $doctorId, int $scheduleId): JsonResponse
    {
        try {
            $dates = $this->bookingRepository->getTakenDatesBySchedule($scheduleId);

            return $this->successResponse($dates);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil data tanggal.', 500);
        }
    }

    // store: tambah jadwal baru — admin
    // POST /doctors/{doctorId}/schedules
    public function store(StoreScheduleRequest $request, int $doctorId): JsonResponse
    {
        try {
            $schedule = $this->scheduleService->addSchedule($doctorId, $request->validated());

            return $this->createdResponse($schedule, 'Jadwal berhasil ditambahkan.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Dokter tidak ditemukan.');
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal menambahkan jadwal.', 500);
        }
    }

    // update: edit jadwal — admin
    // PUT /doctors/{doctorId}/schedules/{scheduleId}
    public function update(UpdateScheduleRequest $request, int $doctorId, int $scheduleId): JsonResponse
    {
        try {
            $schedule = $this->scheduleService->updateSchedule($doctorId, $scheduleId, $request->validated());

            return $this->successResponse($schedule, 'Jadwal berhasil diperbarui.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Jadwal tidak ditemukan.');
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal memperbarui jadwal.', 500);
        }
    }

    // destroy: hapus jadwal — admin
    // DELETE /doctors/{doctorId}/schedules/{scheduleId}
    public function destroy(int $doctorId, int $scheduleId): JsonResponse
    {
        try {
            $this->scheduleService->deleteSchedule($doctorId, $scheduleId);

            return $this->successResponse(null, 'Jadwal berhasil dihapus.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Jadwal tidak ditemukan.');
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal menghapus jadwal.', 500);
        }
    }

    // toggle: toggle is_active jadwal — admin
    // PATCH /doctors/{doctorId}/schedules/{scheduleId}/toggle
    public function toggle(int $doctorId, int $scheduleId): JsonResponse
    {
        try {
            $schedule = $this->scheduleService->toggleActive($doctorId, $scheduleId);

            return $this->successResponse($schedule, 'Status jadwal berhasil diubah.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Jadwal tidak ditemukan.');
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengubah status jadwal.', 500);
        }
    }
}