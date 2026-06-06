import api from "./axios";

// ─── Booking API ──────────────────────────────────────────────────────────
// Semua fungsi return raw axios response.
// Destructuring res.data dilakukan di BookingContext / useBooking hook.
//
// Endpoint:
//   GET    /bookings             → { data: Booking[] }
//   POST   /bookings             → { data: Booking }
//   PATCH  /bookings/:id/status  → { data: Booking }
//   GET    /bookings/:id         → { data: Booking }
//
// Tipe Booking (referensi dari skema monolith — bukan microservice lagi):
//   {
//     booking_id, patient_id, doctor_id, doctor_schedule_id, service_id,
//     booked_date, start_time, end_time,
//     status: 'pending'|'confirmed'|'in_progress'|'completed'|'cancelled',
//     notes,
//     patient: { user: { full_name } },
//     doctor:  { user: { full_name } },
//     doctorSchedule: { schedule_id, day_of_week, start_time, end_time },
//     service: { service_name, base_price }
//   }

// ── Get All Bookings ───────────────────────────────────────────────────────
// Backend memfilter berdasarkan role dari token:
//   - patient  → hanya bookingnya sendiri
//   - doctor   → hanya booking yang di-assign ke dokter tsb
//   - admin    → semua booking
// @param {{ status?: string, page?: number, limit?: number }} params
export const getBookings = (params = {}) =>
  api.get("/bookings", { params });

// ── Get Single Booking ────────────────────────────────────────────────────
// @param {string|number} id — booking_id
export const getBookingById = (id) =>
  api.get(`/bookings/${id}`);

// ── Create Booking ────────────────────────────────────────────────────────
// @param {{
//   doctor_id:          number,
//   service_id:         number,
//   doctor_schedule_id: number,   // schedule yang dipilih user di step 2 (time slot)
//   booked_date:        string,   // format 'Y-m-d' — bukan booked_at
//   notes?:             string
// }} data
// patient_id diambil dari token di backend — tidak perlu dikirim dari frontend.
export const createBooking = (data) =>
  api.post("/bookings", data);

// ── Update Booking Status ─────────────────────────────────────────────────
// @param {string|number} id — booking_id
// @param {'confirmed'|'in_progress'|'completed'|'cancelled'} status
// Patient hanya bisa set 'cancelled' — guard ada di BookingService::updateStatus().
export const updateBookingStatus = (id, status) =>
  api.patch(`/bookings/${id}/status`, { status });