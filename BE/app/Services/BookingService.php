<?php

namespace App\Services;

use App\Models\User;
use App\Models\Booking;
use App\Repositories\BookingRepository;
use App\Repositories\ScheduleRepository;
use App\Events\Booking\BookingCreated;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;


// BookingService: Business logic untuk booking.
// CATATAN: Tidak extend BaseService karena butuh dua repository (BookingRepository + ScheduleRepository).
// findOrFail() dan delete() di-proxy langsung ke bookingRepository agar BookingController bisa memanggilnya.
class BookingService
{
    public function __construct(
        protected BookingRepository  $bookingRepository,
        protected ScheduleRepository $scheduleRepository,
    ) {}

    // getAllWithRelations: Ambil booking berdasarkan role user.
    // patient → own | doctor → assigned | admin/staff → semua
    public function getAllWithRelations(User $user)
    {
        return match ($user->role) {
            'patient' => $user->patient
                ? $this->bookingRepository->findByPatient($user->patient->patient_id)
                : collect(),

            'doctor'  => $user->doctor
                ? $this->bookingRepository->findByDoctor($user->doctor->doctor_id)
                : collect(),

            default   => $this->bookingRepository->allWithRelations(),
        };
    }

    // findOrFail: Proxy ke bookingRepository — dipakai BookingController::show().
    // Throw ModelNotFoundException jika booking tidak ditemukan.
    public function findOrFail(int $id): Model
    {
        return $this->bookingRepository->findOrFail($id);
    }

    // delete: Proxy ke bookingRepository — dipakai BookingController::destroy() (admin only).
    // Soft delete jika Booking model pakai SoftDeletes.
    public function delete(int $id): bool
    {
        return $this->bookingRepository->delete($id);
    }

    // createBooking: Buat booking baru dengan validasi schedule + slot + race condition safe.
    // Alur: resolve patient → resolve schedule → lock slot → create → fire event
    public function createBooking(array $data): Model
    {
        return DB::transaction(function () use ($data) {

            // ── 1. RESOLVE PATIENT ──────────────────────────────
            // User::findOrFail() return type adalah User — intelephense bisa resolve relasi patient.
            // auth()->id() dijamin tidak null karena request sudah lewat middleware auth:sanctum.
            $user = User::findOrFail(Auth::id());
            $user->load('patient');
            $patient = $user->patient;

            if (!$patient) {
                throw ValidationException::withMessages([
                    'patient' => 'Patient profile not found.',
                ]);
            }

            $data['patient_id'] = $patient->patient_id;

            // ── 2. RESOLVE SCHEDULE ─────────────────────────────
            // Cari schedule aktif dokter berdasarkan hari dari booked_date
            $bookedDate = $data['booked_date'];
            $doctorId   = $data['doctor_id'];
            $dayOfWeek  = Carbon::parse($bookedDate)->format('l'); // e.g. "Monday"

            $schedule = $this->scheduleRepository
                ->findByDoctorAndDay($doctorId, $dayOfWeek);

            if (!$schedule) {
                throw ValidationException::withMessages([
                    'booked_date' => "Doctor is not available on {$dayOfWeek}.",
                ]);
            }

            // Inject hasil resolve schedule ke data booking
            $data['doctor_schedule_id'] = $schedule->schedule_id;
            $data['start_time']         = $schedule->start_time;
            $data['end_time']           = $schedule->end_time;

            // ── 3. LOCK SLOT (ANTI RACE CONDITION) ──────────────
            // lockForUpdate() dalam transaction mencegah double booking
            $slotTaken = $this->bookingRepository
                ->lockSlot($data['doctor_schedule_id'], $bookedDate);

            if ($slotTaken) {
                throw ValidationException::withMessages([
                    'booked_date' => 'This slot is already taken. Please choose another date.',
                ]);
            }

            // ── 4. CREATE BOOKING ───────────────────────────────
            $booking = $this->bookingRepository->create($data);

            // ── 5. FIRE EVENT ───────────────────────────────────
            // BookingCreated → SendBookingNotificationListener
            event(new BookingCreated($booking));

            return $booking;
        });
    }

    // updateStatus: Update status booking dengan guard final state.
    // completed & cancelled tidak bisa diubah lagi — pakai isFinalized() dari Booking model.
    public function updateStatus(int $id, array $data): Model
    {
        $booking = $this->bookingRepository->findOrFail($id);

        if ($booking->isFinalized()) {
            throw ValidationException::withMessages([
                'status' => 'Booking is already finalized and cannot be updated.',
            ]);
        }

        return $this->bookingRepository->update($id, $data);
    }
}