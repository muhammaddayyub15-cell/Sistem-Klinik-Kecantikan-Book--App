import api from "./axios";

// ── Get All Patients ───────────────────────────────────────────────────────
// Akses: admin dan dokter
// Response: { data: Patient[] }
export const getPatients = (params = {}) =>
    api.get("/patients", { params });

// ── Get Patient by ID ──────────────────────────────────────────────────────
// @param {number} id
export const getPatientById = (id) =>
    api.get(`/patients/${id}`);