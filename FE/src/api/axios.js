import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const STORAGE_KEY_TOKEN = "aura_token";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Helpers ──────────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem(STORAGE_KEY_TOKEN);
export const setToken = (t) => localStorage.setItem(STORAGE_KEY_TOKEN, t);
export const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem("aura_user");
};

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor ──────────────────────────────────────────────────────
let isRefreshing = false;           // flag: sedang proses refresh?
let failedQueue = [];              // antrian request yang gagal saat refresh

// Setelah refresh berhasil/gagal, retry atau reject semua request di antrian
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,

  async (error) => {
    const originalRequest = error.config;

    // Hanya coba refresh jika:
    // 1. Status 401
    // 2. Bukan request ke /auth/refresh itu sendiri (hindari infinite loop)
    // 3. Belum pernah di-retry sebelumnya
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      // Jika sedang ada proses refresh, masukkan ke antrian
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post("/auth/refresh");
        const newToken = res.data.data.token;

        setToken(newToken);

        // Update user di localStorage juga kalau ada
        if (res.data.data.user) {
          localStorage.setItem("aura_user", JSON.stringify(res.data.data.user));
        }

        // Set header default untuk request berikutnya
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);

        // Retry request yang gagal tadi dengan token baru
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh gagal (token refresh juga expired / invalid)
        processQueue(refreshError, null);
        clearAuth();
        window.dispatchEvent(new Event("unauthorized"));
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    error.normalizedMessage =
      error.response?.data?.message || "Terjadi kesalahan. Silakan coba lagi.";

    return Promise.reject(error);
  }
);

export default api;