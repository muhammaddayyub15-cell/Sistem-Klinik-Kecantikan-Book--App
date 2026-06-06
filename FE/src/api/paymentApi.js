import api from "./axios";

// ─── Payment API ──────────────────────────────────────────────────────────
// Semua fungsi return raw axios response.
//
// Alur pembayaran:
//   1. POST /payments/initiate { order_id } → return { payment_url, order_number, amount }
//   2. Frontend redirect ke payment_url → Midtrans
//   3. Midtrans → POST /payments/webhook → update order + payment status
//   4. Midtrans redirect ke finish_url yang dikonfigurasi di backend

// ── Initiate Payment ──────────────────────────────────────────────────────
// Buat payment record + request Snap token ke Midtrans.
// Hanya bisa dipanggil jika order status masih 'pending'.
// Hanya bisa dipanggil sekali per order (duplicate guard di PaymentService).
// @param {number} orderId
// Return: { payment_url, order_number, amount }
export const initiatePayment = (orderId) =>
  api.post("/payments/initiate", { order_id: orderId });

// ── Get Payment by Order ──────────────────────────────────────────────────
// Ambil data payment berdasarkan order_id — untuk cek status di OrderPage.
// @param {number} orderId
export const getPaymentByOrder = (orderId) =>
  api.get(`/payments/order/${orderId}`);