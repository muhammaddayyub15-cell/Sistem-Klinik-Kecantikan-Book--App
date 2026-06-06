import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  getUnreadNotifications,
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../../../api/notificationApi";

// Navbar — top bar untuk semua authenticated pages.
// Props:
//   onMenuToggle: () => void  — toggle sidebar mobile
//   sidebarOpen: boolean      — state sidebar saat ini
//
// [NOTE] Search bar dihapus — tidak ada fungsi search global yang aktif saat ini.
//        Products masih Coming Soon, Bookings sudah ada filter sendiri di halaman.
//        Search bisa ditambah kembali saat Products aktif.

export default function Navbar({ onMenuToggle, sidebarOpen }) {
  const { user } = useAuth();

  const [notifOpen,        setNotifOpen]        = useState(false);
  const [notifications,    setNotifications]    = useState([]);
  const [unreadCount,      setUnreadCount]      = useState(0);
  const [loadingNotif,     setLoadingNotif]     = useState(false);
  const [markingAll,       setMarkingAll]       = useState(false);

  // Ref untuk close dropdown saat click outside
  const notifRef = useRef(null);

  // ── Fetch unread count saat mount — untuk badge saja ─────────────────────
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res   = await getUnreadNotifications();
        const data  = res.data?.data ?? res.data ?? [];
        const count = res.data?.unread_count ?? (Array.isArray(data) ? data.length : 0);
        setUnreadCount(count);
      } catch {
        // Gagal fetch badge tidak perlu error — cukup count = 0
        setUnreadCount(0);
      }
    };
    fetchUnreadCount();
  }, []);

  // ── Fetch semua notifikasi saat dropdown dibuka ───────────────────────────
  useEffect(() => {
    if (!notifOpen) return;
    const fetchAll = async () => {
      setLoadingNotif(true);
      try {
        const res  = await getNotifications();
        const data = res.data?.data ?? res.data ?? [];
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        setNotifications([]);
      } finally {
        setLoadingNotif(false);
      }
    };
    fetchAll();
  }, [notifOpen]);

  // ── Close dropdown saat click outside ────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  // ── Mark satu notifikasi sebagai read ─────────────────────────────────────
  const handleMarkOne = async (notif) => {
    if (!notif.read_at) {
      try {
        await markAsRead(notif.id);
        setNotifications(prev =>
          prev.map(n => n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n)
        );
        setUnreadCount(c => Math.max(0, c - 1));
      } catch {
        // Gagal mark tidak perlu block UI
      }
    }
  };

  // ── Mark all sebagai read ─────────────────────────────────────────────────
  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // Gagal tidak perlu block UI
    } finally {
      setMarkingAll(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  // Format waktu relatif dari created_at
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Extract pesan dari notifikasi — BE Laravel pakai kolom 'data' JSON
  // [NOTE] Sesuaikan key jika struktur notifikasi BE berbeda
  const getNotifText = (n) =>
    n.data?.message ?? n.data?.body ?? n.message ?? "New notification";

  const getNotifIcon = (n) => {
    const type = n.data?.type ?? n.type ?? "";
    if (type.includes("booking")) return "✦";
    if (type.includes("payment") || type.includes("order")) return "◈";
    return "◇";
  };

  const initials = (user?.full_name ?? user?.name ?? "AU")
    .split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <header
      className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between px-5 lg:px-7"
      style={{
        height: 64,
        background: "rgba(253,246,239,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(184,124,90,0.12)",
        marginLeft: "var(--sidebar-width, 0px)",
        transition: "margin-left 0.3s ease",
      }}
    >
      {/* ── Left — hamburger ── */}
      <button
        onClick={onMenuToggle}
        aria-label="Toggle sidebar"
        className="flex flex-col gap-1.5 p-2 rounded-xl transition-all duration-200 hover:bg-stone-100 active:scale-95"
      >
        <span
          className="block w-5 h-px transition-all duration-300"
          style={{
            background: "#b87c5a",
            transform: sidebarOpen ? "rotate(45deg) translate(3.5px, 3.5px)" : "none",
          }}
        />
        <span
          className="block h-px transition-all duration-300"
          style={{
            background: "#b87c5a",
            width: sidebarOpen ? "20px" : "14px",
            opacity: sidebarOpen ? 0 : 1,
          }}
        />
        <span
          className="block w-5 h-px transition-all duration-300"
          style={{
            background: "#b87c5a",
            transform: sidebarOpen ? "rotate(-45deg) translate(3.5px, -3.5px)" : "none",
          }}
        />
      </button>

      {/* ── Right — notifikasi + user ── */}
      <div className="flex items-center gap-2">

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-stone-100 active:scale-95"
            aria-label="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: "#5a3e35" }}>
              <path d="M6 10a6 6 0 1 1 12 0v3l2 3H4l2-3v-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white"
                style={{ background: "#b87c5a", fontSize: 9, fontWeight: 600 }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {notifOpen && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden"
              style={{
                background: "#fff",
                border: "1px solid rgba(184,124,90,0.14)",
                boxShadow: "0 12px 40px rgba(90,40,20,0.12)",
                top: "100%",
              }}
            >
              {/* Header */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid rgba(184,124,90,0.1)" }}
              >
                <span className="text-sm font-medium" style={{ color: "#2c1f1a" }}>
                  Notifications
                  {unreadCount > 0 && (
                    <span
                      className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(184,124,90,0.12)", color: "#8b4c34" }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    disabled={markingAll}
                    className="text-xs transition hover:opacity-70 disabled:opacity-40"
                    style={{ color: "#b87c5a" }}
                  >
                    {markingAll ? "Marking…" : "Mark all read"}
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-72 overflow-y-auto">
                {loadingNotif ? (
                  <div className="flex flex-col gap-0">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-3 px-5 py-3.5 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-[rgba(184,124,90,0.08)] shrink-0" />
                        <div className="flex-1">
                          <div className="h-3 w-3/4 rounded bg-[rgba(184,124,90,0.08)] mb-2" />
                          <div className="h-2.5 w-1/3 rounded bg-[rgba(184,124,90,0.06)]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <span className="text-2xl opacity-20 text-[#b87c5a]">◇</span>
                    <p className="text-xs text-[#c0a090]">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isUnread = !n.read_at;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleMarkOne(n)}
                        className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-stone-50 cursor-pointer"
                        style={{ borderBottom: "1px solid rgba(184,124,90,0.06)" }}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            background: isUnread ? "rgba(184,124,90,0.12)" : "#f5f0ec",
                            color: "#b87c5a", fontSize: 14,
                          }}
                        >
                          {getNotifIcon(n)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-relaxed" style={{ color: isUnread ? "#2c1f1a" : "#9a6e62" }}>
                            {getNotifText(n)}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#b0907e" }}>
                            {formatTime(n.created_at)}
                          </p>
                        </div>
                        {isUnread && (
                          <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: "#b87c5a" }} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: "rgba(184,124,90,0.15)" }} />

        {/* User mini */}
        <div className="flex items-center gap-2.5 pl-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ background: "linear-gradient(135deg, #e8c9b0, #d4a882)", color: "#5a2e12" }}
          >
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium leading-tight" style={{ color: "#2c1f1a" }}>
              {user?.full_name ?? user?.name ?? "Aura User"}
            </p>
            <p className="text-xs capitalize leading-tight" style={{ color: "#b87c5a" }}>
              {user?.role ?? "patient"}
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}