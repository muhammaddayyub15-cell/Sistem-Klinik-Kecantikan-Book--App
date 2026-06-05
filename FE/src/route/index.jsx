import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// ─── Layout ───────────────────────────────────────────────────────────────
import MainLayout from "../components/layout/MainLayout";

// ─── Lazy imports ─────────────────────────────────────────────────────────
// Public
const HomePage = lazy(() => import("../pages/HomePage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const ProductsPage = lazy(() => import("../pages/ProductsPage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));

// Patient
const PatientDashboard = lazy(() => import("../pages/patient/DashboardPage"));
const BookingPage = lazy(() => import("../pages/patient/BookingPage"));
const OrderPage = lazy(() => import("../pages/patient/OrderPage"));
const MyBookingsPage = lazy(() => import("../pages/patient/MyBookingsPage"));
const InProductPage = lazy(() => import("../pages/patient/InProductPage"));
const CartPage = lazy(() => import("../pages/patient/CartPage"));

// Doctor
const DoctorDashboard = lazy(() => import("../pages/doctor/DashboardPage"));
const RecordPage = lazy(() => import("../pages/doctor/RecordPage"));

// Admin
const AdminDashboard = lazy(() => import("../pages/admin/DashboardPage"));
const DoctorPage = lazy(() => import("../pages/admin/DoctorPage"));
const ServicePage = lazy(() => import("../pages/admin/ServicePage"));
const ProductPage = lazy(() => import("../pages/admin/ProductPage"));
const AdminBookingPage = lazy(() => import("../pages/admin/AdminBookingPage"));

// ─── Placeholder page ─────────────────────────────────────────────────────
const ComingSoon = lazy(() => import("../pages/ComingSoon"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

// ─── Page loader ──────────────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
    <span>Loading...</span>
  </div>
);

// ─── AppRoutes ────────────────────────────────────────────────────────────
const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ── Public ──────────────────────────────────────────────────── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Patient ─────────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/booking" element={<BookingPage />} />
            <Route path="/patient/order" element={<OrderPage />} />
            <Route path="/patient/my-bookings" element={<MyBookingsPage />} />
            <Route path="/patient/products" element={<InProductPage />} />
            <Route path="/patient/cart" element={<CartPage />} />
          </Route>
        </Route>

        {/* ── Doctor ──────────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/records" element={<RecordPage />} />
            <Route path="/doctor/records/new" element={<ComingSoon title="New Record" />} />
            <Route path="/doctor/schedule" element={<ComingSoon title="My Schedule" />} />
            <Route path="/doctor/patients" element={<ComingSoon title="Patients" />} />
          </Route>
        </Route>

        {/* ── Admin ───────────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<DoctorPage />} />
            <Route path="/admin/services" element={<ServicePage />} />
            <Route path="/admin/products" element={<ProductPage />} />
            <Route path="/admin/bookings" element={<AdminBookingPage />} />
            <Route path="/admin/patients" element={<ComingSoon title="Patients" />} />
            <Route path="/admin/orders" element={<ComingSoon title="Orders" />} />
            <Route path="/admin/reports" element={<ComingSoon title="Reports" />} />
            <Route path="/admin/products/new" element={<ComingSoon title="Add Product" />} />
            <Route path="/admin/products/stock" element={<ComingSoon title="Stock Logs" />} />
          </Route>
        </Route>

        {/* ── Catch-all ───────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Suspense>
  );
};

export default AppRoutes;