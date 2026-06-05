import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";

/**
 * Navbar — top bar for authenticated dashboard views.
 * Props:
 *   onMenuToggle: () => void   — toggle sidebar on mobile
 *   sidebarOpen: boolean        — current sidebar state
 */
export default function Navbar({ onMenuToggle, sidebarOpen }) {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const NOTIFICATIONS = [
    { id: 1, icon: "✦", text: "Booking confirmed for tomorrow 10:00", time: "2m ago", unread: true },
    { id: 2, icon: "◈", text: "Your medical record is ready", time: "1h ago", unread: true },
    { id: 3, icon: "◇", text: "New product available: Vitamin C Serum", time: "3h ago", unread: false },
  ];

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <>
      <header
        className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between px-5 lg:px-7"
        style={{
          height: 64,
          background: "rgba(253,246,239,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(184,124,90,0.12)",
          // On desktop, offset for sidebar width
          marginLeft: "var(--sidebar-width, 0px)",
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* Left — hamburger + breadcrumb */}
        <div className="flex items-center gap-4">
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

          {/* Search bar — desktop */}
          <div
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300"
            style={{
              background: searchFocused ? "#fff" : "rgba(184,124,90,0.06)",
              border: searchFocused ? "1px solid rgba(184,124,90,0.4)" : "1px solid transparent",
              width: searchFocused ? 260 : 200,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: "#b87c5a", flexShrink: 0 }}>
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11.5 11.5L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: "#2c1f1a" }}
            />
          </div>
        </div>

        {/* Right — actions + user */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
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
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
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
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(184,124,90,0.1)" }}>
                  <span className="text-sm font-medium" style={{ color: "#2c1f1a" }}>Notifications</span>
                  <button className="text-xs" style={{ color: "#b87c5a" }}>Mark all read</button>
                </div>
                {NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-stone-50 cursor-pointer"
                    style={{ borderBottom: "1px solid rgba(184,124,90,0.06)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: n.unread ? "rgba(184,124,90,0.12)" : "#f5f0ec", color: "#b87c5a", fontSize: 14 }}
                    >
                      {n.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed" style={{ color: n.unread ? "#2c1f1a" : "#9a6e62" }}>
                        {n.text}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#b0907e" }}>{n.time}</p>
                    </div>
                    {n.unread && (
                      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: "#b87c5a" }} />
                    )}
                  </div>
                ))}
                <div className="px-5 py-3 text-center">
                  <button className="text-xs" style={{ color: "#b87c5a" }}>View all notifications</button>
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
              {user?.name?.slice(0, 2).toUpperCase() ?? "AU"}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium leading-tight" style={{ color: "#2c1f1a" }}>
                {user?.name ?? "Aura User"}
              </p>
              <p className="text-xs capitalize leading-tight" style={{ color: "#b87c5a" }}>
                {user?.role ?? "patient"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Click-outside to close notif */}
      {notifOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
      )}
    </>
  );
}