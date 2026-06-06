import api from "./axios";

// ── Admin Dashboard ────────────────────────────────────────────────────────
// Akses: admin only

// fungsi: ambil seluruh stats dashboard
// response: { summary, revenue, booking_stats, order_stats,
//             monthly_revenue, bookings_by_service, recent_activity, top_doctors }
export const getDashboardStats = () =>
    api.get("/admin/dashboard");

// fungsi: ambil recent activity dengan pagination
// @param {number} page — default 1
// response: { data: Activity[], page, per_page, total, last_page }
export const getDashboardActivity = (page = 1) =>
    api.get("/admin/dashboard/activity", { params: { page } });

// ── Get Unassigned Doctor Users ────────────────────────────────────────────
// Ambil users role=doctor yang belum punya profil dokter
// Dipakai DoctorForm dropdown saat admin create doctor baru
export const getUnassignedDoctorUsers = () =>
    api.get("/admin/users/unassigned-doctors");