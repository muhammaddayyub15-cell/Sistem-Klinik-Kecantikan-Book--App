import api from "./axios";

// ─── Order API ────────────────────────────────────────────────────────────
// Semua fungsi return raw axios response.
// Destructuring res.data dilakukan di komponen / context.
//
// Tipe Order (monolith — snapshot pattern):
//   {
//     order_id, order_number, status: 'pending'|'paid'|'cancelled',
//     patient_id_snapshot, patient_name_snapshot,
//     booking_id, total_amount, created_at,
//     booking: { booking_id, service: { service_name, base_price } },
//     order_items: [],   // kosong untuk booking-only order
//     payment: { payment_id, status, payment_url, paid_at } | null
//   }

// ── Get Orders ────────────────────────────────────────────────────────────
// [FIX] Sebelumnya GET /orders → 403 untuk patient (route role:admin only).
//       Patient harus hit GET /orders/patient/me yang resolve dari token.
//       Admin tetap bisa hit GET /orders langsung.
// @param {{ status?: string, page?: number, per_page?: number }} params
export const getOrders = (params = {}) =>
  api.get("/orders/patient/me", { params });

// getOrdersAdmin: khusus admin — hit GET /orders dengan pagination
export const getOrdersAdmin = (params = {}) =>
  api.get("/orders", { params });

// ── Get Order Detail ──────────────────────────────────────────────────────
// @param {string|number} id — order_id
export const getOrderDetail = (id) =>
  api.get(`/orders/${id}`);

// ── Create Order ──────────────────────────────────────────────────────────
// Booking-only flow:
// @param {{ booking_id: number }} data
// total_amount diambil dari booking.service.base_price di backend.
// patient_id diambil dari token di backend.
//
// Product-only flow (Coming Soon):
// @param {{ items: Array<{ product_id: number, qty: number }>, booking_id?: number }} data
export const createOrder = (data) =>
  api.post("/orders", data);

// ── Cancel Order ──────────────────────────────────────────────────────────
// @param {string|number} id — order_id
// Hanya bisa cancel jika status masih 'pending'.
export const cancelOrder = (id) =>
  api.patch(`/orders/${id}/cancel`);