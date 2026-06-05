import { useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import SidebarItem from "./SidebarItem";
import UserSection from "./UserSection";

/**
 * Sidebar — role-aware navigation panel.
 *
 * Props:
 *   open      : boolean         — expanded on mobile
 *   collapsed : boolean         — icon-only mode on desktop
 *   onClose   : () => void      — close handler for mobile overlay
 */

// ── Menu definitions per role ──────────────────────────────────────────────

const PATIENT_MENU = [
  {
    label: "Dashboard",
    to: "/patient/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Bookings",
    to: "/patient/booking",
    badge: 2,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    label: "My Orders",
    to: "/patient/order",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    label: "My Bookings",
    to: "/patient/my-bookings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    label: "Products",
    to: "/patient/products", // [FIX] was "/patient/products" — route tidak terdaftar di index.jsx.
    //       ProductsPage adalah public page di path /products,
    //       bukan protected route di bawah /patient/.
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
];

const DOCTOR_MENU = [
  {
    label: "Dashboard",
    to: "/doctor/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "My Schedule",
    to: "/doctor/schedule",
    badge: 3,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    label: "Medical Records",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
    children: [
      { label: "All Records", to: "/doctor/records" },
      { label: "New Record", to: "/doctor/records/new" },
    ],
  },
  {
    label: "Patients",
    to: "/doctor/patients",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];


const ADMIN_MENU = [
  {
    label: "Dashboard",
    to: "/admin/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Bookings",
    to: "/admin/bookings",
    badge: 5,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    label: "Management",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    children: [
      { label: "Doctors", to: "/admin/doctors" },
      { label: "Patients", to: "/admin/patients" },
    ],
  },
  {
    label: "Services",
    to: "/admin/services",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
      </svg>
    ),
  },
  {
    label: "Products",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    children: [
      { label: "All Products", to: "/admin/products" },
      { label: "Add Product", to: "/admin/products/new" },
      { label: "Stock Logs", to: "/admin/products/stock" },
    ],
  },
  {
    label: "Orders",
    to: "/admin/orders",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    label: "Reports",
    to: "/admin/reports",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

const MENU_MAP = { patient: PATIENT_MENU, doctor: DOCTOR_MENU, admin: ADMIN_MENU };

// ── Sidebar Component ──────────────────────────────────────────────────────

export default function Sidebar({ open, collapsed, onClose }) {
  const { user } = useAuth();
  const menu = MENU_MAP[user?.role] ?? PATIENT_MENU;

  const SIDEBAR_WIDTH = collapsed ? 64 : 240;

  // Inject CSS variable for Navbar offset
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${SIDEBAR_WIDTH}px`
    );
  }, [SIDEBAR_WIDTH]);

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(44,31,26,0.35)", backdropFilter: "blur(2px)" }}
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: SIDEBAR_WIDTH,
          background: "#fdf6ef",
          borderRight: "1px solid rgba(184,124,90,0.12)",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          transition: "transform 0.3s ease, width 0.3s ease",
          // Mobile: slide in/out
          transform: open || window.innerWidth >= 1024 ? "translateX(0)" : "translateX(-100%)",
          overflowX: "hidden",
        }}
      >
        {/* ── Brand / Logo ── */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "0" : "0 18px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderBottom: "1px solid rgba(184,124,90,0.1)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 20, color: "#b87c5a", flexShrink: 0 }}>✦</span>
          {!collapsed && (
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 17,
                fontWeight: 500,
                color: "#2c1f1a",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              Aura Clinic
            </span>
          )}
        </div>

        {/* ── Role label ── */}
        {!collapsed && (
          <div style={{ padding: "14px 18px 8px" }}>
            <p
              style={{
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#b0907e",
                fontWeight: 500,
              }}
            >
              {user?.role === "admin"
                ? "Administration"
                : user?.role === "doctor"
                  ? "Doctor Panel"
                  : "Patient Portal"}
            </p>
          </div>
        )}

        {/* ── Navigation items ── */}
        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: collapsed ? "8px 8px" : "4px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            scrollbarWidth: "none",
          }}
        >
          {menu.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              to={item.to}
              children={item.children}
              collapsed={collapsed}
              badge={item.badge}
            />
          ))}
        </nav>

        {/* ── User section ── */}
        <UserSection collapsed={collapsed} />
      </aside>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&display=swap');
        nav::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}