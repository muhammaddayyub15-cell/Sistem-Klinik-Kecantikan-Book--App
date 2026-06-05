import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../ui/bar-side/Navbar";
import Sidebar from "../ui/bar-side/Sidebar";

/**
 * MainLayout — root layout untuk semua authenticated routes.
 *
 * Tanggung jawab komponen ini:
 *   1. Menyimpan state sidebar (open / collapsed) — lifted karena dipakai Navbar & Sidebar
 *   2. Menyediakan satu handler toggle yang context-aware (mobile vs desktop)
 *   3. Menyusun struktur: Sidebar + [Navbar + main content]
 */
export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(false);


  const isDesktop = () => window.innerWidth >= 1024;

  useEffect(() => {
    const onResize = () => {
      if (isDesktop()) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /**
   * handleMenuToggle — satu-satunya handler untuk tombol hamburger di Navbar.
   *
   * [NOTE] Navbar tidak perlu tahu soal breakpoint — ia cukup memanggil prop ini.
   *        MainLayout yang memutuskan: toggle collapse (desktop) atau overlay (mobile).
   */
  const handleMenuToggle = () => {
    if (isDesktop()) {
      setCollapsed((c) => !c);
    } else {
      setSidebarOpen((o) => !o);
    }
  };

  const SIDEBAR_WIDTH = collapsed ? 64 : 240;

  return (
    <div style={{ minHeight: "100vh", background: "#faf8f5" }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────
        [NOTE] open     → tampilkan overlay di mobile
               collapsed → aktifkan icon-only mode di desktop
               onClose  → dipanggil Sidebar saat backdrop diklik (mobile)
                           atau bisa dipanggil dari nav item jika diperlukan
      ──────────────────────────────────────────────────────────────────── */}
      <Sidebar
        open={sidebarOpen}
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Wrapper konten kanan sidebar ──────────────────────────────────── */}

      <div
        style={{
          paddingLeft: window.innerWidth >= 1024 ? SIDEBAR_WIDTH : 0,
          transition: "padding-left 0.3s ease",
        }}
      >

        {/* ── Navbar ─────────────────────────────────────────────────────*/}
        <Navbar
          onMenuToggle={handleMenuToggle}
          sidebarOpen={sidebarOpen}
        />

        {/* ── Main content ────────────────────────────────────────────────*/}
        <main style={{ paddingTop: 64 }}>
          <div style={{ minHeight: "calc(100vh - 64px)", padding: "28px" }}>
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}