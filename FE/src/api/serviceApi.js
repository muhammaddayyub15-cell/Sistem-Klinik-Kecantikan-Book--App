import api from "./axios";

// ── Get All Services ───────────────────────────────────────────────────────
// Publik — tidak butuh token
// Response: { data: Service[] }
export const getServices = () =>
    api.get("/services");

// ── Get Service by ID ──────────────────────────────────────────────────────
// @param {number} id
export const getServiceById = (id) =>
    api.get(`/services/${id}`);