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

  // ── Helper: extract pesan error dari response ─────────────────────────
  // [FIX] Sebelumnya hanya pakai err.normalizedMessage — tidak menangkap
  //       validation errors (422) dari BE yang ada di errors object.
  //       Urutan prioritas:
  //         1. errors object (422 validation) → ambil pesan pertama
  //         2. normalizedMessage dari axios interceptor
  //         3. fallback string
  const extractErrorMessage = (err, fallback = "Terjadi kesalahan.") => {
    const errData = err?.response?.data;
    if (errData?.errors) {
      // Ambil pesan pertama dari errors object
      // e.g. { booked_date: ["This slot is already taken."] } → "This slot is already taken."
      const firstMsg = Object.values(errData.errors).flat()[0];
      if (firstMsg) return firstMsg;
    }
    return errData?.message ?? err?.normalizedMessage ?? fallback;
  };

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
      setError(extractErrorMessage(err, "Gagal memuat data booking."));
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
      setError(extractErrorMessage(err, "Gagal memuat detail booking."));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── createBooking ─────────────────────────────────────────────────────
  // @param {{
  //   doctor_id:          number,
  //   service_id:         number,
  //   doctor_schedule_id: number,
  //   booked_date:        string,   // format 'Y-m-d'
  //   notes?:             string
  // }} data
  // Return: booking baru (object) jika sukses,
  //         atau { __error: string } jika gagal.
  // [FIX] Sebelumnya return null saat gagal — BookingPage baca contextError
  //       yang masih stale (race condition: setError async, baca langsung setelah await).
  //       Sekarang error message dikembalikan langsung dalam return value
  //       sehingga BookingPage tidak perlu bergantung pada context state.
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
      const msg = extractErrorMessage(err, "Gagal membuat booking.");
      setError(msg);
      // Return sentinel object agar BookingPage bisa baca pesan error
      // tanpa bergantung pada context state yang belum re-render.
      return { __error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── updateBookingStatus ───────────────────────────────────────────────
  // Dipakai oleh doctor (confirm/done) dan admin (semua status) dan patient (cancel).
  // @param {string|number} id
  // @param {'confirmed'|'in_progress'|'completed'|'cancelled'} status
  const updateBookingStatus = useCallback(async (id, status) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiUpdateBookingStatus(id, status);
      const updated = res.data?.data ?? res.data;

      // Update item di list secara lokal — tidak perlu refetch semua.
      // [NOTE] Gunakan booking_id (custom PK) bukan id untuk matching
      setBookings((prev) =>
        prev.map((b) =>
          (b.booking_id ?? b.id) === (updated.booking_id ?? updated.id) ? updated : b
        )
      );

      // Jika booking yang di-update adalah activeBooking, sync juga.
      const updatedKey = updated.booking_id ?? updated.id;
      const activeKey  = activeBooking?.booking_id ?? activeBooking?.id;
      if (activeKey && activeKey === updatedKey) {
        setActiveBooking(updated);
      }

      return updated;
    } catch (err) {
      setError(extractErrorMessage(err, "Gagal mengubah status booking."));
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