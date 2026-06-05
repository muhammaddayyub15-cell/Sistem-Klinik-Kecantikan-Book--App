import api from "./axios";

// ─── Order API ────────────────────────────────────────────────────────────
// [NOTE] Semua fungsi return raw axios response.
//        Destructuring res.data dilakukan di useOrder hook.
//
// Endpoint yang diasumsikan (Order Service via Gateway):
//   GET    /orders           → { data: Order[] }
//   GET    /orders/:id       → { data: Order }
//   POST   /orders           → { data: Order }
//   PATCH  /orders/:id/cancel → { data: Order }
//
// Tipe Order (referensi dari skema Order DB — menggunakan snapshot, bukan FK):
//   {
//     id, status: 'pending'|'paid'|'cancelled',
//     patient_id_snapshot, patient_name_snapshot,
//     booking_id_snapshot,
//     total_amount, created_at,
//     items: [{
//       id, product_id_snapshot, product_name_snapshot,
//       qty, unit_price_snapshot
//     }],
//     payment: {
//       id, status: 'pending'|'success'|'failed',
//       midtrans_order_id, payment_url, paid_at
//     }
//   }
//
//        Order Service adalah service terpisah dari Core Service.
//        Semua data produk dan patient di order adalah snapshot — tidak akan
//        berubah meski data aslinya di-update. Ini by design (lihat SYSTEM_ARCHITECTURE.md).

// ── Get All Orders ────────────────────────────────────────────────────────
// @param {{ status?: string, page?: number, limit?: number }} params
//       Backend filter berdasarkan role dari token:
//        - patient → hanya ordernya sendiri
//        - admin   → semua order
export const getOrders = (params = {}) =>
  api.get("/orders", { params });

export const getOrdersByPatient = (patientId) =>
  api.get(`/orders/patient/${patientId}`);

// ── Get Order Detail ──────────────────────────────────────────────────────
// @param {string|number} id
// [NOTE] Response include items[] dan payment object.
export const getOrderDetail = (id) =>
  api.get(`/orders/${id}`);

// ── Create Order ──────────────────────────────────────────────────────────
// @param {{ booking_id?: number|null, items: Array<{ product_id: number, qty: number }> }} data
// [NOTE] booking_id opsional — order bisa berdiri sendiri (beli produk tanpa booking)
//        atau terikat ke booking tertentu.
//        Backend yang akan:
//          1. Fetch snapshot data patient dari Core Service
//          2. Fetch snapshot harga produk dari Product Service
//          3. Buat payment record + request Midtrans payment URL
//          4. Return order + payment_url untuk redirect ke Midtrans
export const createOrder = (data) =>
  api.post("/orders", data);

// ── Cancel Order ──────────────────────────────────────────────────────────
// @param {string|number} id
//        Hanya bisa cancel jika status masih 'pending' (belum dibayar).
//        Backend akan trigger refund ke Midtrans jika sudah terlanjur 'paid'.
export const cancelOrder = (id) =>
  api.patch(`/orders/${id}/cancel`);