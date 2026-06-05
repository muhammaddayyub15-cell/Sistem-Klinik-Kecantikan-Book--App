import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// ─── Role → redirect map ──────────────────────────────────────────────────
// [NOTE] Jika user authenticated tapi mengakses route role lain,
//        redirect ke dashboard sesuai rolenya sendiri (bukan ke "/").
//        Tambahkan entry di sini jika ada role baru.
const ROLE_HOME = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/dashboard",
};

// ─── ProtectedRoute ───────────────────────────────────────────────────────
// Props:
//   allowedRoles: string[]  — role yang boleh mengakses route ini
//
// Alur keputusan:
//   1. isLoading  → render null (tunggu restore session selesai)
//   2. !isAuthenticated → redirect ke /login, simpan lokasi asal di state
//   3. role tidak cocok  → redirect ke dashboard role sendiri
//   4. lolos semua → render <Outlet />

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  //        isLoading true saat AuthContext sedang restore session dari localStorage.
  //        Tanpa guard ini, user yang refresh halaman akan di-redirect ke /login
  //        sebelum token sempat di-restore — false negative yang menyesatkan.
  //        Render null (blank) lebih aman daripada spinner di sini karena
  //        ProtectedRoute tidak tahu konteks layout-nya.
  //        Jika ingin global loading screen, handle di App.jsx atau MainLayout.
  if (isLoading) return null;

  //        Simpan `location` di state redirect agar setelah login berhasil,
  //        LoginPage bisa navigate balik ke halaman yang semula ingin diakses.
  //        Contoh di LoginPage:
  //          const { state } = useLocation();
  //          navigate(state?.from ?? ROLE_HOME[user.role]);
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  //        `replace` dipakai di semua Navigate agar halaman yang
  //        tidak boleh diakses tidak masuk ke browser history.
  //        Tanpa ini, user bisa tekan tombol Back dan kembali ke halaman terlarang.
  if (!allowedRoles.includes(user.role)) {
    const fallback = ROLE_HOME[user.role] ?? "/";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;