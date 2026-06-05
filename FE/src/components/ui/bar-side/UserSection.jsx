import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

/**
 * UserSection — displayed at the bottom of the Sidebar.
 * Shows user avatar, name, role, and logout/settings actions.
 *
 * Props:
 *   collapsed: boolean — sidebar collapsed state
 */
export default function UserSection({ collapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "AU";

  const roleLabel = {
    patient: "Patient",
    doctor: "Doctor",
    admin: "Administrator",
  }[user?.role] ?? "User";

  const roleColor = {
    patient: { bg: "rgba(184,124,90,0.12)", text: "#8b4c34" },
    doctor: { bg: "rgba(15,110,86,0.1)", text: "#0f6e56" },
    admin: { bg: "rgba(83,74,183,0.1)", text: "#534ab7" },
  }[user?.role] ?? { bg: "rgba(184,124,90,0.12)", text: "#8b4c34" };

  return (
    <div
      style={{
        borderTop: "1px solid rgba(184,124,90,0.12)",
        padding: collapsed ? "14px 0" : "14px 12px",
        position: "relative",
      }}
    >
      {/* Compact row */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: collapsed ? "8px 0" : "8px 10px",
          borderRadius: 12,
          border: "none",
          background: menuOpen ? "rgba(184,124,90,0.08)" : "transparent",
          cursor: "pointer",
          justifyContent: collapsed ? "center" : "flex-start",
          transition: "background 0.2s ease",
        }}
        aria-label="User menu"
      >
        {/* Avatar */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #e8c9b0, #d4a882)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 600,
            color: "#5a2e12",
            flexShrink: 0,
            border: "2px solid rgba(184,124,90,0.2)",
          }}
        >
          {initials}
        </div>

        {/* Name + role — hidden when collapsed */}
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              <p
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: "#2c1f1a",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name ?? "Aura User"}
              </p>
              <span
                style={{
                  display: "inline-block",
                  fontSize: 10,
                  padding: "1px 7px",
                  borderRadius: 20,
                  marginTop: 2,
                  background: roleColor.bg,
                  color: roleColor.text,
                  fontWeight: 500,
                }}
              >
                {roleLabel}
              </span>
            </div>

            {/* Chevron */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{
                color: "#b0907e",
                transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.25s ease",
                flexShrink: 0,
              }}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>

      {/* Popover menu */}
      {menuOpen && (
        <>
          <div
            style={{
              position: "absolute",
              bottom: collapsed ? 0 : "calc(100% - 8px)",
              left: collapsed ? "calc(100% + 12px)" : 12,
              right: collapsed ? "auto" : 12,
              background: "#fff",
              borderRadius: 14,
              border: "1px solid rgba(184,124,90,0.14)",
              boxShadow: "0 8px 30px rgba(90,40,20,0.12)",
              overflow: "hidden",
              zIndex: 100,
              minWidth: collapsed ? 180 : "auto",
            }}
          >
            {/* User info header */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid rgba(184,124,90,0.1)",
                background: "rgba(253,246,239,0.6)",
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 500, color: "#2c1f1a", margin: 0 }}>
                {user?.name ?? "Aura User"}
              </p>
              <p style={{ fontSize: 11, color: "#9a7065", margin: "2px 0 0" }}>
                {user?.email ?? "user@auraclinic.com"}
              </p>
            </div>

            {/* Menu items */}
            {[
              {
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                ),
                label: "My Profile",
                action: () => navigate(`/${user?.role}/profile`),
              },
              {
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
                  </svg>
                ),
                label: "Settings",
                action: () => navigate(`/${user?.role}/settings`),
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => { item.action(); setMenuOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "10px 16px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 12.5,
                  color: "#5a3e35",
                  transition: "background 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(184,124,90,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: "#b87c5a" }}>{item.icon}</span>
                {item.label}
              </button>
            ))}

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(184,124,90,0.1)", margin: "4px 0" }} />

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 16px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 12.5,
                color: "#b04040",
                transition: "background 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(176,64,64,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "#b04040" }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>

          {/* Click-outside overlay */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
            onClick={() => setMenuOpen(false)}
          />
        </>
      )}
    </div>
  );
}