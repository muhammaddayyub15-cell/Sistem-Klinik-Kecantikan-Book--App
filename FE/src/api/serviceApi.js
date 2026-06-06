import api from "./axios";

// ── Get All Services ───────────────────────────────────────────────────────
// Publik — tidak butuh token.
// index() di backend hanya return is_active=true.
// Response: { data: Service[] }
export const getServices = (params = {}) =>
    api.get("/services", { params });

// ── Get Service by ID ──────────────────────────────────────────────────────
// @param {number} id — service_id
export const getServiceById = (id) =>
    api.get(`/services/${id}`);

// ── Create Service ─────────────────────────────────────────────────────────
// Akses: admin only
// @param {{ category_id, service_name, description?, base_price, unit?, is_active? }} data
export const createService = (data) =>
    api.post("/services", data);

// ── Update Service ─────────────────────────────────────────────────────────
// Partial update — semua field nullable di backend.
// Akses: admin only
// @param {number} id — service_id
// @param {{ category_id?, service_name?, description?, base_price?, unit? }} data
export const updateService = (id, data) =>
    api.put(`/services/${id}`, data);

// ── Delete Service ─────────────────────────────────────────────────────────
// Soft delete — service yang sudah dipakai booking tetap ada di history.
// Akses: admin only
// @param {number} id — service_id
export const deleteService = (id) =>
    api.delete(`/services/${id}`);

// ── Toggle Service Active ──────────────────────────────────────────────────
// Flip is_active — service nonaktif tidak muncul di BookingPage patient.
// Akses: admin only
// @param {number} id — service_id
export const toggleService = (id) =>
    api.patch(`/services/${id}/toggle`);

// ── Get Service Categories ─────────────────────────────────────────────────
// Publik — dipakai ServiceForm dropdown kategori saat create/edit service.
// Response: { data: ServiceCategory[] } dengan field category_id, category_name
export const getServiceCategories = () =>
    api.get("/service-categories");