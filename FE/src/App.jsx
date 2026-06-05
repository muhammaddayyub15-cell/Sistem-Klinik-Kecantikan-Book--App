import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { BookingProvider } from "./contexts/BookingContext";
import { CartProvider } from "./contexts/CartContext";
import AppRoutes from "./route/index";
import CartPage from "./pages/patient/CartPage";



// ─── Provider order ───────────────────────────────────────────────────────
//   Urutan wrapping penting:
//   1. BrowserRouter   — paling luar, karena useLocation/useNavigate
//                        dipakai di dalam AuthProvider (redirect setelah logout)
//                        dan ProtectedRoute.
//   2. AuthProvider    — di dalam Router agar bisa pakai useNavigate jika perlu.
//                        Context lain (Booking, Cart) boleh consume useAuth,
//                        jadi AuthProvider harus lebih luar dari keduanya.
//   3. BookingProvider — tidak depend ke CartContext, urutan dengan Cart bebas.
//   4. CartProvider    — tidak depend ke BookingContext.
//
//        BookingProvider dan CartProvider di-wrap di level App (bukan di page)
//        karena:
//        - CartProvider: cart harus persist lintas page (badge qty di Navbar)
//        - BookingProvider: booking state bisa diakses dari beberapa page sekaligus
//        Jika di masa depan state ini hanya dibutuhkan 1 page, pindahkan ke
//        level route/page untuk menghindari re-render global yang tidak perlu.

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;