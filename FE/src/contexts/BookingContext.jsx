import { createContext, useContext, useState, useCallback } from "react";
import {
  getBookings,
  createBooking as apiCreateBooking,
  updateBookingStatus as apiUpdateBookingStatus,
  getBookingById,
} from "../api/bookingApi";

// ─── Context ───────────────────────────────────────────────────────────────
const BookingContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────
// [NOTE] BookingContext sengaja tidak auto-fetch saat mount.
//        Fetch dipanggil secara eksplisit oleh page yang membutuhkan
//        (misal useEffect di BookingPage / DashboardPage).
//        Ini menghindari request yang tidak perlu saat user belum berada di halaman booking.

export function BookingProvider({ children }) {
  const [bookings,       setBookings]       = useState([]);
  const [activeBooking,  setActiveBooking]  = useState(null); // booking yang sedang dilihat detailnya
  const [isLoading,      setIsLoading]      = useState(false);
  const [error,          setError]          = useState(null);

  // ── Helper: reset error ───────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), []);

  // ── fetchBookings ─────────────────────────────────────────────────────
  // Fetch list booking. Backend auto-filter berdasarkan role dari token.
  // @param {{ status?: string, page?: number, limit?: number }} params
  const fetchBookings = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getBookings(params);
      // [NOTE] Sesuaikan destructuring jika struktur response backend berbeda.
      //        Asumsi: res.data = { data: Booking[] } atau res.data = Booking[]
      const data = res.data?.data ?? res.data;
      setBookings(data);
    } catch (err) {
      setError(err.normalizedMessage ?? "Gagal memuat data booking.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── fetchBookingById ──────────────────────────────────────────────────
  // Fetch satu booking untuk halaman detail.
  // @param {string|number} id
  const fetchBookingById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getBookingById(id);
      const data = res.data?.data ?? res.data;
      setActiveBooking(data);
      return data;
    } catch (err) {
      setError(err.normalizedMessage ?? "Gagal memuat detail booking.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── createBooking ─────────────────────────────────────────────────────
  // @param {{ doctor_id: number, service_id: number, booked_at: string, notes?: string }} data
  // Return: booking baru atau null jika gagal.
  const createBooking = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiCreateBooking(data);
      const newBooking = res.data?.data ?? res.data;

      // Tambahkan booking baru ke list yang sudah ada
      // tanpa perlu fetch ulang seluruh list.
      setBookings((prev) => [newBooking, ...prev]);
      return newBooking;
    } catch (err) {
      setError(err.normalizedMessage ?? "Gagal membuat booking.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── updateBookingStatus ───────────────────────────────────────────────
  // Dipakai oleh doctor (confirm/done) dan admin (semua status) dan patient (cancel).
  // @param {string|number} id
  // @param {'confirmed'|'done'|'cancelled'} status
  const updateBookingStatus = useCallback(async (id, status) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiUpdateBookingStatus(id, status);
      const updated = res.data?.data ?? res.data;

      // Update item di list secara lokal — tidak perlu refetch semua.
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );

      // Jika booking yang di-update adalah activeBooking, sync juga.
      if (activeBooking?.id === updated.id) {
        setActiveBooking(updated);
      }

      return updated;
    } catch (err) {
      setError(err.normalizedMessage ?? "Gagal mengubah status booking.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeBooking]);

  // ── Nilai yang di-expose ke consumers ────────────────────────────────
  const value = {
    bookings,
    activeBooking,
    isLoading,
    error,

    fetchBookings,
    fetchBookingById,
    createBooking,
    updateBookingStatus,
    clearError,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

// ─── Custom hook ──────────────────────────────────────────────────────────
// [NOTE] Konsisten dengan pola useAuth di AuthContext.
export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error(
      "useBooking must be used within <BookingProvider>. Wrap the relevant route/page with <BookingProvider> in App.jsx atau route/index.jsx."
    );
  }
  return ctx;
};