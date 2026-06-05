import api from "./axios";

// ─── Booking API ──────────────────────────────────────────────────────────
//        Semua fungsi return raw axios response.
//        Destructuring res.data dilakukan di BookingContext / useBooking hook.
//
// Endpoint yang diasumsikan:
//   GET    /bookings             → { data: Booking[] }
//   GET    /bookings?role=doctor → { data: Booking[] }  (filter by role)
//   POST   /bookings             → { data: Booking }
//   PATCH  /bookings/:id/status  → { data: Booking }
//   GET    /bookings/:id         → { data: Booking }
//
// Tipe Booking (referensi dari skema Core DB):
//   {
//     id, patient_id, doctor_id, service_id,
//     booked_at, status: 'pending'|'confirmed'|'done'|'cancelled',
//     notes,
//     patient: { name }, doctor: { name }, service: { name }
//   }

// ── Get All Bookings ───────────────────────────────────────────────────────
//          Backend memfilter berdasarkan role dari token:
//        - patient  → hanya bookingnya sendiri
//        - doctor   → hanya booking yang di-assign ke dokter tsb
//        - admin    → semua booking
// @param {{ status?: string, page?: number, limit?: number }} params - optional query params
export const getBookings = (params = {}) =>
  api.get("/bookings", { params });

// ── Get Single Booking ────────────────────────────────────────────────────
// @param {string|number} id
export const getBookingById = (id) =>
  api.get(`/bookings/${id}`);

// ── Create Booking ────────────────────────────────────────────────────────
// @param {{ doctor_id: number, service_id: number, booked_at: string, notes?: string }} data
// patient_id diambil dari token di backend — tidak perlu dikirim dari frontend.
export const createBooking = (data) =>
  api.post("/bookings", data);

// ── Update Booking Status ─────────────────────────────────────────────────
// @param {string|number} id
// @param {'confirmed'|'done'|'cancelled'} status
//        Hanya admin dan doctor yang bisa update status (validasi di backend/gateway).
//        Patient hanya bisa cancel booking miliknya sendiri.
export const updateBookingStatus = (id, status) =>
  api.patch(`/bookings/${id}/status`, { status });