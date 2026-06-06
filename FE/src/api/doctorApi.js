import api from "./axios";

// ─── Doctor API ───────────────────────────────────────────────────────────
// Semua fungsi return raw axios response.
// Destructuring res.data dilakukan di komponen/context yang memanggil.

// ── Get Available Doctors ─────────────────────────────────────────────────
// Dipakai BookingPage step 1 untuk dropdown dokter.
// Publik — tidak butuh auth.
export const getAvailableDoctors = () =>
  api.get("/doctors/available");

// ── Get Doctor Active Schedules ───────────────────────────────────────────
// Ambil jadwal aktif dokter — dipakai BookingPage step 2 untuk filter hari tersedia.
// Return: DoctorSchedule[] dengan field day_of_week, start_time, end_time
// Publik — tidak butuh auth.
// @param {number} doctorId
export const getDoctorActiveSchedules = (doctorId) =>
  api.get(`/doctors/${doctorId}/schedules/active`);

// ── Get Schedule Taken Dates ──────────────────────────────────────────────
// Ambil tanggal yang sudah terisi (non-cancelled) untuk satu schedule.
// Dipakai BookingPage step 2 untuk grey-out tanggal penuh di date picker,
// sehingga user tidak bisa memilih tanggal yang pasti akan 422.
// Return: string[] format 'Y-m-d' — hanya tanggal >= hari ini
// Publik — tidak butuh auth.
// @param {number} doctorId
// @param {number} scheduleId
export const getScheduleTakenDates = (doctorId, scheduleId) =>
  api.get(`/doctors/${doctorId}/schedules/${scheduleId}/taken-dates`);