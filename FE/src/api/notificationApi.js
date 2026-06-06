import api from "./axios";

// ─── Notification API ─────────────────────────────────────────────────────
// Endpoint:
//   GET   /notifications         → { data: Notification[] }
//   GET   /notifications/unread  → { data: Notification[], unread_count: number }
//   PATCH /notifications/:id/read → { data: Notification }
//   PATCH /notifications/read-all → { data: null }

// ── Get all notifications ─────────────────────────────────────────────────
export const getNotifications = () =>
  api.get("/notifications");

// ── Get unread notifications + count — dipakai untuk badge ───────────────
export const getUnreadNotifications = () =>
  api.get("/notifications/unread");

// ── Mark one notification as read ────────────────────────────────────────
export const markAsRead = (id) =>
  api.patch(`/notifications/${id}/read`);

// ── Mark all notifications as read ───────────────────────────────────────
export const markAllAsRead = () =>
  api.patch("/notifications/read-all");