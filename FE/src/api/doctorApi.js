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

// ── Admin: Get All Doctors ─────────────────────────────────────────────────
// Ambil semua dokter + relasi user, specialization, schedules
// Akses: admin only
export const getAllDoctors = () =>
    api.get("/doctors");

// ── Admin: Get Specializations ─────────────────────────────────────────────
// Dipakai DoctorForm dropdown spesialisasi
// Publik — tidak butuh auth
export const getSpecializations = () =>
    api.get("/specializations");

// ── Admin: Create Doctor ───────────────────────────────────────────────────
// @param {{ user_id, spec_id, license_no, bio?, is_active?, is_available? }} data
export const createDoctor = (data) =>
    api.post("/doctors", data);

// ── Admin: Update Doctor ───────────────────────────────────────────────────
// @param {number} id — doctor_id
// @param {{ spec_id?, license_no?, bio?, is_active?, is_available? }} data
export const updateDoctor = (id, data) =>
    api.put(`/doctors/${id}`, data);

// ── Admin: Delete Doctor ───────────────────────────────────────────────────
// @param {number} id — doctor_id
export const deleteDoctor = (id) =>
    api.delete(`/doctors/${id}`);

// ── Admin: Toggle Availability ─────────────────────────────────────────────
// Toggle is_available — buka/tutup slot booking sementara
// @param {number} id — doctor_id
export const toggleDoctorAvailability = (id) =>
    api.patch(`/doctors/${id}/availability`);

// ── Admin: Get Doctor Schedules ────────────────────────────────────────────
// @param {number} doctorId
export const getDoctorSchedules = (doctorId) =>
    api.get(`/doctors/${doctorId}/schedules`);

// ── Admin: Create Schedule ─────────────────────────────────────────────────
// @param {number} doctorId
// @param {{ day_of_week, start_time, end_time, is_active? }} data
export const createSchedule = (doctorId, data) =>
    api.post(`/doctors/${doctorId}/schedules`, data);

// ── Admin: Update Schedule ─────────────────────────────────────────────────
// @param {number} doctorId
// @param {number} scheduleId
// @param {{ day_of_week?, start_time?, end_time?, is_active? }} data
export const updateSchedule = (doctorId, scheduleId, data) =>
    api.put(`/doctors/${doctorId}/schedules/${scheduleId}`, data);

// ── Admin: Delete Schedule ─────────────────────────────────────────────────
// @param {number} doctorId
// @param {number} scheduleId
export const deleteSchedule = (doctorId, scheduleId) =>
    api.delete(`/doctors/${doctorId}/schedules/${scheduleId}`);

// ── Admin: Toggle Schedule Active ──────────────────────────────────────────
// @param {number} doctorId
// @param {number} scheduleId
export const toggleSchedule = (doctorId, scheduleId) =>
    api.patch(`/doctors/${doctorId}/schedules/${scheduleId}/toggle`);