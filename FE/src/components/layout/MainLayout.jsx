import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../ui/bar-side/Navbar";
import Sidebar from "../ui/bar-side/Sidebar";

// MainLayout — root layout untuk semua authenticated routes.
//
// [FIX] Sebelumnya paddingLeft dan --sidebar-width tidak reactive terhadap resize
//       sehingga di mobile navbar tidak full width karena masih inherit
//       --sidebar-width: 240px dari Sidebar.jsx.
//       Sekarang isDesktop disimpan di state agar trigger re-render saat resize.

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);

  // [FIX] isDesktop sebagai state — reactive saat window resize
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      // Auto-close mobile sidebar saat pindah ke desktop
      if (desktop) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // [FIX] Reset --sidebar-width ke 0 di mobile agar Navbar tidak offset
  const SIDEBAR_WIDTH = collapsed ? 64 : 240;
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isDesktop ? `${SIDEBAR_WIDTH}px` : "0px"
    );
  }, [isDesktop, SIDEBAR_WIDTH]);

  const handleMenuToggle = () => {
    if (isDesktop) {
      setCollapsed((c) => !c);
    } else {
      setSidebarOpen((o) => !o);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#faf8f5" }}>

      <Sidebar
        open={sidebarOpen}
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
      />

      {/* [FIX] paddingLeft hanya di desktop — di mobile sidebar overlay, bukan push */}
      <div
        style={{
          paddingLeft: isDesktop ? SIDEBAR_WIDTH : 0,
          transition: "padding-left 0.3s ease",
        }}
      >
        <Navbar
          onMenuToggle={handleMenuToggle}
          sidebarOpen={sidebarOpen || collapsed}
        />

        <main style={{ paddingTop: 64 }}>
          <div style={{ minHeight: "calc(100vh - 64px)", padding: "28px" }}>
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}