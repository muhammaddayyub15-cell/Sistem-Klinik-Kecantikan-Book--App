import api from "./axios";

// ── Get All Available Doctors ──────────────────────────────────────────────
// Publik — tidak butuh token
// Response: { data: Doctor[] }
export const getAvailableDoctors = () =>
    api.get("/doctors/available");

// ── Get Doctor Active Schedules ────────────────────────────────────────────
// Publik — dipakai BookingPage untuk menampilkan slot waktu yang tersedia
// Response: { data: DoctorSchedule[] }
// @param {number} doctorId
export const getDoctorActiveSchedules = (doctorId) =>
    api.get(`/doctors/${doctorId}/schedules/active`);