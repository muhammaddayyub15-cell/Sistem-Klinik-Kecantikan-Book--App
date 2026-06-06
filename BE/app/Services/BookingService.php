<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\BookingRepository;
use App\Repositories\ScheduleRepository;
use App\Events\Booking\BookingCreated;
use App\Notifications\BookingStatusUpdatedNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
    // Alur: resolve patient → validasi schedule ownership → lock slot → inject waktu → create → load relasi → fire event
    //
    // CATATAN: doctor_schedule_id sekarang dikirim dari FE (dipilih user di step 2 time slot).
    // BE tidak lagi resolve schedule dari day_of_week — FE yang resolve lewat getDoctorActiveSchedules.
    // Ini fix untuk kasus dokter punya >1 jadwal di hari yang sama (misal pagi & sore).
    public function createBooking(array $data): Model
    {
        return DB::transaction(function () use ($data) {

            // ── 1. RESOLVE PATIENT ──────────────────────────────
            // [FIX] Admin bisa booking atas nama patient lain — patient_id dikirim dari FE.
            //       Patient role → patient_id diambil dari token (tidak bisa dimanipulasi).
            //       Admin role   → patient_id wajib ada di $data (dikirim CreateBookingModal).
            $authUser = User::findOrFail(Auth::id());

            if ($authUser->role === 'admin') {
                if (empty($data['patient_id'])) {
                    throw ValidationException::withMessages([
                        'patient_id' => 'Patient ID is required when booking as admin.',
                    ]);
                }
                // patient_id sudah ada di $data dari FE — tidak perlu override
            } else {
                $authUser->load('patient');
                $patient = $authUser->patient;

                if (!$patient) {
                    throw ValidationException::withMessages([
                        'patient' => 'Patient profile not found.',
                    ]);
                }
                $data['patient_id'] = $patient->patient_id;
            }

            // ── 2. VALIDASI OWNERSHIP SCHEDULE ─────────────────
            // Pastikan schedule_id yang dikirim FE memang milik doctor_id yang sama.
            // Guard ini penting agar patient tidak bisa booking ke dokter A
            // dengan schedule milik dokter B.
            $schedule = $this->scheduleRepository
                ->findOrFail($data['doctor_schedule_id']);

            if ((int) $schedule->doctor_id !== (int) $data['doctor_id']) {
                throw ValidationException::withMessages([
                    'doctor_schedule_id' => 'Schedule does not belong to the selected doctor.',
                ]);
            }

            // ── 3. VALIDASI HARI COCOK DENGAN BOOKED_DATE ───────
            // Pastikan hari dari booked_date cocok dengan day_of_week di schedule.
            // Mencegah user kirim tanggal Senin tapi schedule_id-nya hari Rabu.
            $dayOfWeek  = \Carbon\Carbon::parse($data['booked_date'])->format('l'); // e.g. "Monday"

            if ($schedule->day_of_week !== $dayOfWeek) {
                throw ValidationException::withMessages([
                    'booked_date' => "Selected date is a {$dayOfWeek}, but the schedule is for {$schedule->day_of_week}.",
                ]);
            }

            // ── 4. LOCK SLOT (ANTI RACE CONDITION) ──────────────
            // lockForUpdate() dalam transaction mencegah double booking.
            $slotTaken = $this->bookingRepository
                ->lockSlot($data['doctor_schedule_id'], $data['booked_date']);

            if ($slotTaken) {
                throw ValidationException::withMessages([
                    'booked_date' => 'This slot is already taken. Please choose another date.',
                ]);
            }

            // ── 5. INJECT WAKTU DARI SCHEDULE ───────────────────
            // [FIX] start_time & end_time tidak dikirim FE — diambil dari schedule.
            //       Booking model punya kolom ini di $fillable (kemungkinan NOT NULL).
            //       Tanpa ini → DB error → BookingController catch \Throwable → return 500.
            $data['start_time'] = $schedule->start_time;
            $data['end_time']   = $schedule->end_time;

            // ── 6. CREATE BOOKING ───────────────────────────────
            $booking = $this->bookingRepository->create($data);

            // ── 7. LOAD RELASI ──────────────────────────────────
            // Di-load setelah create agar SuccessScreen FE dapat data lengkap
            // tanpa perlu fetch ulang GET /bookings/:id.
            $booking->load(['doctor.user', 'service', 'patient.user', 'doctorSchedule']);

            // ── 8. FIRE EVENT ────────────────────────────────────
            // BookingCreated → SendBookingNotificationListener
            event(new BookingCreated($booking));

            return $booking;
        });
    }

    // updateStatus: Update status booking dengan guard final state.
    // completed & cancelled tidak bisa diubah lagi — pakai isFinalized() dari Booking model.
    // Setelah update, kirim notifikasi database ke patient.
    public function updateStatus(int $id, array $data): Model
    {
        $booking = $this->bookingRepository->findOrFail($id);

        if ($booking->isFinalized()) {
            throw ValidationException::withMessages([
                'status' => 'Booking is already finalized and cannot be updated.',
            ]);
        }

        $updated = $this->bookingRepository->update($id, $data);

        // Load relasi untuk notifikasi setelah update
        $updated->load(['doctor.user', 'service', 'patient.user']);
        $updated->patient->user->notify(new BookingStatusUpdatedNotification($updated));

        return $updated;
    }
}
