import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBooking } from "../../contexts/BookingContext";
import { getServices } from "../../api/serviceApi";
import { getAvailableDoctors, getScheduleTakenDates } from "../../api/doctorApi";
// [NOTE] getDoctorActiveSchedules dihapus — schedule sudah di-embed dalam response
//        getAvailableDoctors() sebagai active_schedules: DoctorSchedule[].
//        Pakai selectedDoctor.active_schedules langsung = tidak ada fetch duplikat.
import { createOrder } from "../../api/orderApi";
import { initiatePayment } from "../../api/paymentApi";

// ── Constants ─────────────────────────────────────────────────────────────────
// [FIX] STEPS ditambah "Payment" dan "Confirmed" agar left panel tracker
//       ikut update setelah booking berhasil dibuat.
//       Step 0-3: form steps (dalam BookingPage form).
//       Step 4  : SuccessScreen — user pilih bayar atau pay later.
//       Step 5  : setelah redirect Midtrans (halaman /patient/payment/success).
//                 Di BookingPage hanya dipakai untuk tampilan tracker saja.
const STEPS = ["Service", "Doctor", "Schedule", "Confirm", "Payment", "Confirmed"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ── Shared style constants ────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-3 rounded-xl border border-[#e8d5c8] bg-[#fdf8f5] text-[#2c1f1a] text-sm placeholder-[#c4a898] outline-none transition-all duration-200 focus:border-[#b87c5a] focus:bg-white focus:shadow-sm";
const labelCls = "block text-xs font-medium text-[#5a3e35] mb-1.5 tracking-wide";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getNextDays(n = 14) {
  const days = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDate(date) {
  if (!date) return "—";
  return `${DAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

// Format Y-m-d untuk dikirim ke backend
function toISODate(date) {
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionTitle({ title }) {
  return (
    <h2
      className="text-[28px] sm:text-[30px] font-normal text-[#2c1f1a] leading-tight"
      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
    >
      {title}
    </h2>
  );
}

function SelectCard({ children, selected, onClick, horizontal = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 sm:p-5 rounded-2xl border w-full transition-all duration-200 cursor-pointer
          ${horizontal ? "flex items-center gap-4" : "block"}
          ${selected
          ? "border-[#b87c5a] bg-[rgba(184,124,90,0.07)]"
          : "border-[rgba(184,124,90,0.2)] bg-[rgba(253,246,239,0.4)] hover:border-[rgba(184,124,90,0.4)]"}`}
    >
      {children}
      {selected && (
        <svg
          width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="#b87c5a" strokeWidth="2.5"
          className={`flex-shrink-0 ${horizontal ? "" : "mt-2"}`}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

function LoadingSkeleton({ count = 3, horizontal = false }) {
  return (
    <div className={`${horizontal ? "flex flex-col" : "grid sm:grid-cols-2"} gap-3.5`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-[rgba(184,124,90,0.1)] bg-[rgba(253,246,239,0.4)] animate-pulse p-5">
          <div className="h-4 w-2/3 rounded bg-[rgba(184,124,90,0.1)] mb-3" />
          <div className="h-3 w-1/2 rounded bg-[rgba(184,124,90,0.08)]" />
        </div>
      ))}
    </div>
  );
}

// ── StepTracker ───────────────────────────────────────────────────────────────
// [FIX] Diextract menjadi komponen terpisah agar bisa dipakai di BookingPage
//       dan SuccessScreen (yang sebelumnya render di luar left panel).
//       currentStep: 0-5 mengikuti STEPS array.
function StepTracker({ currentStep }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.12em] uppercase text-[rgba(232,201,176,0.6)] mb-8">
        Booking steps
      </p>
      {STEPS.map((s, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={s} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                    ${done ? "bg-[#b87c5a] border-0"
                    : active ? "bg-[rgba(184,124,90,0.2)] border border-[#b87c5a]"
                      : "bg-[rgba(255,255,255,0.06)] border border-white/10"}`}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className={`text-xs font-medium ${active ? "text-[#e8c9b0]" : "text-white/30"}`}>{i + 1}</span>
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-px h-9 my-1 transition-all duration-500 ${done ? "bg-[#b87c5a]" : "bg-white/[0.08]"}`} />
              )}
            </div>
            <div className="pt-1.5">
              <p className={`text-sm transition-all duration-300
                  ${active ? "font-medium text-[#e8c9b0]" : done ? "text-[rgba(232,201,176,0.8)]" : "text-white/30"}`}>
                {s}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── SuccessScreen ─────────────────────────────────────────────────────────────
// [FIX] Sekarang render left panel coklat dengan StepTracker di step 4 (Payment).
//       Sebelumnya SuccessScreen tidak render left panel sama sekali — step tracker
//       tidak pernah sampai ke Payment & Confirmed.
// [NOTE] Dari sini user pilih:
//          - "Proceed to Payment" → POST /orders { booking_id } → POST /payments/initiate → Midtrans
//          - "Pay Later"          → navigate ke dashboard (order belum dibuat)
function SuccessScreen({ service, doctor, date, schedule, notes, onPayNow, onSkip, isPaying, payError }) {
  return (
    <div className="min-h-screen flex font-sans" style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf8f5" }}>

      {/* ── LEFT PANEL — sama dengan BookingPage, step aktif = 4 (Payment) ── */}
      <div
        className="hidden lg:flex w-[42%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #2c1208 0%, #5a2e12 50%, #8b4c34 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/5" />
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full border border-white/[0.04]" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full border border-white/[0.05]" />
        <div
          className="absolute top-[30%] left-[60%] w-48 h-48 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(184,124,90,0.2) 0%, transparent 70%)" }}
        />

        <div className="flex items-center gap-2.5 relative z-10">
          <span className="text-[#e8c9b0] text-2xl">✦</span>
          <span className="text-[#f5ede4] text-xl font-medium" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Aura Clinic
          </span>
        </div>

        {/* [FIX] StepTracker di step 4 = Payment */}
        <div className="relative z-10">
          <StepTracker currentStep={4} />
        </div>

        <div className="relative z-10">
          <p className="text-xl italic text-[rgba(232,201,176,0.7)] leading-relaxed" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            "Your skin tells your story.<br />Let us help you write a beautiful one."
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="text-center max-w-md w-full">

          {/* Mobile: logo + step indicator */}
          <div className="flex lg:hidden items-center gap-2 mb-6">
            <span className="text-[#b87c5a] text-lg">✦</span>
            <span className="text-[#2c1f1a] text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Aura Clinic
            </span>
          </div>
          <div className="flex lg:hidden gap-2 mb-8 justify-center">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-300"
                style={{ width: i === 4 ? 24 : 8, background: i <= 4 ? "#b87c5a" : "rgba(184,124,90,0.2)" }}
              />
            ))}
          </div>

          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl"
            style={{ background: "linear-gradient(135deg, #e8c9b0, #d4a882)", color: "#5a2e12" }}
          >
            ✦
          </div>
          <h2
            className="text-4xl font-normal mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
          >
            Booking <em className="italic" style={{ color: "#b87c5a" }}>Placed</em>
          </h2>
          <p className="text-sm mb-8" style={{ color: "#9a6e62" }}>
            Your appointment is reserved. Complete your payment to confirm the booking.
          </p>

          {/* Summary card */}
          <div className="rounded-2xl p-6 text-left mb-8" style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}>
            {[
              { label: "Service", value: service?.service_name },
              { label: "Doctor", value: doctor?.user?.full_name ? `dr. ${doctor.user.full_name.replace(/^dr\.?\s*/i, "").trim()}` : "—" },
              { label: "Date", value: formatDate(date) },
              { label: "Time", value: schedule ? `${schedule.start_time} – ${schedule.end_time}` : "—" },
              { label: "Fee", value: service?.base_price ? `Rp ${Number(service.base_price).toLocaleString("id-ID")}` : "—" },
              { label: "Notes", value: notes || "—" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between py-2.5" style={{ borderBottom: "1px solid rgba(184,124,90,0.08)" }}>
                <span className="text-sm" style={{ color: "#9a6e62" }}>{row.label}</span>
                <span className="text-sm font-medium" style={{ color: "#2c1f1a" }}>{row.value ?? "—"}</span>
              </div>
            ))}
          </div>

          {/* Error state payment */}
          {payError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-4 text-left">
              {payError}
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col gap-3">
            {/* Payment Coming Soon — fitur payment belum aktif */}
            <div
              className="w-full px-8 py-3.5 rounded-xl text-sm font-medium text-center cursor-not-allowed select-none"
              style={{ background: "rgba(184,124,90,0.15)", color: "#b0907e", border: "1px dashed rgba(184,124,90,0.3)" }}
            >
              🔒 Payment — Coming Soon
            </div>
            <button
              onClick={onSkip}
              disabled={isPaying}
              className="w-full px-8 py-3 rounded-xl text-sm font-medium border border-[rgba(184,124,90,0.25)] text-[#5a3e35] hover:bg-[rgba(184,124,90,0.05)] transition disabled:opacity-50"
            >
              Pay Later — Go to Dashboard
            </button>
          </div>
          <p className="text-[11px] text-center text-[#b0907e] mt-3">
            Payment gateway integration coming soon
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function BookingPage() {
  // [FIX] Ambil error dari context juga — createBooking return null saat gagal,
  //       error message ada di context.error bukan di throw.
  const { createBooking, error: contextError } = useBooking();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedBooking, setSubmittedBooking] = useState(null);

  // isPaying & payError: state untuk proses POST /orders + POST /payments/initiate
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState("");

  // ── Data dari API ─────────────────────────────────────────────────────
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [fetchingServices, setFetchingServices] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(false);
  const [fetchingSchedules, setFetchingSchedules] = useState(false);

  // takenDatesMap: { [scheduleId]: Set<'Y-m-d'> } — tanggal penuh per schedule
  const [takenDatesMap, setTakenDatesMap] = useState({});

  // ── Pilihan user ──────────────────────────────────────────────────────
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [notes, setNotes] = useState("");

  // [FIX] doctorSchedules diambil dari selectedDoctor.active_schedules yang sudah
  //       di-embed di response GET /doctors/available — tidak perlu fetch terpisah.
  //       Harus dideklarasi SETELAH selectedDoctor useState agar tidak ReferenceError.
  const doctorSchedules = selectedDoctor?.active_schedules ?? [];

  const days = getNextDays(14);

  // ── Fetch services saat mount ─────────────────────────────────────────
  useEffect(() => {
    const fetchServices = async () => {
      setFetchingServices(true);
      try {
        const res = await getServices();
        setServices(res.data?.data ?? res.data ?? []);
      } catch {
        setError("Gagal memuat daftar layanan.");
      } finally {
        setFetchingServices(false);
      }
    };
    fetchServices();
  }, []);

  // ── Fetch doctors saat masuk step 1 ──────────────────────────────────
  useEffect(() => {
    if (step !== 1) return;
    const fetchDoctors = async () => {
      setFetchingDoctors(true);
      try {
        const res = await getAvailableDoctors();
        setDoctors(res.data?.data ?? res.data ?? []);
      } catch {
        setError("Gagal memuat daftar dokter.");
      } finally {
        setFetchingDoctors(false);
      }
    };
    fetchDoctors();
  }, [step]);

  // ── Fetch taken-dates saat dokter dipilih ───────────────────────────
  // [FIX] Tidak lagi fetch active_schedules — sudah ada di selectedDoctor.active_schedules.
  //       Hanya fetch taken-dates paralel untuk semua schedule dokter yang dipilih.
  //       Reset date & schedule pilihan user agar tidak carry-over dari dokter sebelumnya.
  useEffect(() => {
    if (!selectedDoctor) return;
    setSelectedDate(null);
    setSelectedSchedule(null);
    setTakenDatesMap({});

    const schedules = selectedDoctor.active_schedules ?? [];
    if (schedules.length === 0) return;

    const fetchTakenDates = async () => {
      setFetchingSchedules(true);
      try {
        // Fetch taken-dates paralel untuk semua schedule dokter ini
        const takenResults = await Promise.all(
          schedules.map((s) =>
            getScheduleTakenDates(selectedDoctor.doctor_id, s.schedule_id)
              .then((r) => ({ scheduleId: s.schedule_id, dates: r.data?.data ?? r.data ?? [] }))
              .catch(() => ({ scheduleId: s.schedule_id, dates: [] }))
          )
        );

        const map = {};
        takenResults.forEach(({ scheduleId, dates }) => {
          map[scheduleId] = new Set(dates);
        });
        setTakenDatesMap(map);
      } catch {
        setError("Gagal memuat jadwal dokter.");
      } finally {
        setFetchingSchedules(false);
      }
    };
    fetchTakenDates();
  }, [selectedDoctor]);

  // ── Hari tersedia dari jadwal dokter ──────────────────────────────────
  const availableDayNames = doctorSchedules.map((s) => s.day_of_week);
  const availableDays = days.filter((d) => availableDayNames.includes(DAY_FULL[d.getDay()]));

  // isDayFullyTaken: true jika SEMUA schedule di hari tersebut sudah penuh
  const isDayFullyTaken = (date) => {
    const dateStr = toISODate(date);
    const schedulesOnDay = doctorSchedules.filter(
      (s) => s.day_of_week === DAY_FULL[date.getDay()]
    );
    if (schedulesOnDay.length === 0) return false;
    return schedulesOnDay.every((s) => takenDatesMap[s.schedule_id]?.has(dateStr));
  };

  // Slot jadwal untuk hari yang dipilih
  const schedulesForSelectedDay = selectedDate
    ? doctorSchedules.filter((s) => s.day_of_week === DAY_FULL[selectedDate.getDay()])
    : [];

  useEffect(() => {
    setSelectedSchedule(null);
  }, [selectedDate]);

  // ── Validation per step ───────────────────────────────────────────────
  const validateStep = () => {
    if (step === 0 && !selectedService) { setError("Please select a service."); return false; }
    if (step === 1 && !selectedDoctor) { setError("Please select a doctor."); return false; }
    if (step === 2 && !selectedDate) { setError("Please select a date."); return false; }
    if (step === 2 && !selectedSchedule) { setError("Please select a time slot."); return false; }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((s) => s - 1);
  };

  // ── handleSubmit — POST /bookings ─────────────────────────────────────
  // [FIX] Guard null: createBooking return null saat gagal (error ada di context).
  //       Sebelumnya setSubmittedBooking(null) membuat SuccessScreen tidak muncul,
  //       tapi juga tidak ada error yang ditampilkan ke user.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    setError("");
    try {
      const booking = await createBooking({
        doctor_id: selectedDoctor.doctor_id,
        service_id: selectedService.service_id,
        doctor_schedule_id: selectedSchedule.schedule_id,
        booked_date: toISODate(selectedDate),
        notes: notes || null,
      });

      // [FIX] Cek null — jika gagal, BookingContext sudah set contextError.
      //       contextError berisi pesan yang sudah di-extract dari errors object (422)
      //       maupun message field dari BE.
      if (!booking || booking.__error) {
        setError(booking?.__error ?? contextError ?? "Booking failed. Please try again.");
        return;
      }

      setSubmittedBooking(booking);
    } catch (err) {
      // Fallback jika createBooking throw (tidak seharusnya, tapi defensive).
      const errData = err?.response?.data;
      const validationMsg = errData?.errors
        ? Object.values(errData.errors).flat()[0]
        : null;
      setError(validationMsg ?? errData?.message ?? "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── handlePayNow — POST /orders → POST /payments/initiate → Midtrans ──
  // [NOTE] Flow dua step berurutan:
  //        1. createOrder({ booking_id }) → dapat order_id
  //        2. initiatePayment(order_id)   → dapat payment_url (Midtrans Snap)
  //        window.location.href dipakai untuk full redirect keluar SPA ke Midtrans.
  //        Setelah bayar, Midtrans redirect ke finish_url (dikonfigurasi di backend).
  //        FE menangkap finish_url di route /patient/payment/success.
  const handlePayNow = async () => {
    setIsPaying(true);
    setPayError("");
    try {
      // [FIX] Pastikan booking_id ada sebelum request
      const bookingId = submittedBooking?.booking_id ?? submittedBooking?.id;
      if (!bookingId) {
        setPayError("Booking ID tidak ditemukan. Silakan mulai ulang booking.");
        return;
      }

      // Step 1: buat order untuk booking ini
      const orderRes = await createOrder({ booking_id: bookingId });
      const order = orderRes.data?.data ?? orderRes.data;
      const orderId = order?.order_id ?? order?.id;

      if (!orderId) {
        setPayError("Gagal membuat order. Silakan coba lagi.");
        return;
      }

      // Step 2: inisiasi payment → dapat payment_url dari Midtrans Snap
      const payRes = await initiatePayment(orderId);
      const payData = payRes.data?.data ?? payRes.data;
      const paymentUrl = payData?.payment_url ?? null;

      if (paymentUrl) {
        window.location.href = paymentUrl; // full redirect ke Midtrans
      } else {
        setPayError("Gagal mendapatkan URL pembayaran. Silakan coba lagi.");
      }
    } catch (err) {
      setPayError(err?.response?.data?.message ?? "Gagal memproses pembayaran.");
    } finally {
      setIsPaying(false);
    }
  };

  // ── handleSkip — ke dashboard tanpa bayar sekarang ───────────────────
  // [NOTE] Booking sudah tersimpan di backend dengan status 'pending'.
  //        User bisa bayar nanti dari halaman My Bookings / Orders.
  const handleSkip = () => navigate("/patient/dashboard");

  // ── Tampilkan SuccessScreen setelah booking berhasil ──────────────────
  // [FIX] SuccessScreen sekarang render left panel dengan tracker di step 4 (Payment).
  if (submittedBooking) {
    return (
      <SuccessScreen
        service={selectedService}
        doctor={selectedDoctor}
        date={selectedDate}
        schedule={selectedSchedule}
        notes={notes}
        onPayNow={handlePayNow}
        onSkip={handleSkip}
        isPaying={isPaying}
        payError={payError}
      />
    );
  }

  return (
    <>
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
          .spin { animation: spin 0.8s linear infinite; }
        `}</style>

      <div className="min-h-screen flex font-sans bg-[#faf8f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── LEFT PANEL ───────────────────────────────────────────────── */}
        <div
          className="hidden lg:flex w-[42%] flex-col justify-between p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #2c1208 0%, #5a2e12 50%, #8b4c34 100%)" }}
        >
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/5" />
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full border border-white/[0.04]" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full border border-white/[0.05]" />
          <div
            className="absolute top-[30%] left-[60%] w-48 h-48 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(184,124,90,0.2) 0%, transparent 70%)" }}
          />

          <div className="flex items-center gap-2.5 relative z-10">
            <span className="text-[#e8c9b0] text-2xl">✦</span>
            <span className="text-[#f5ede4] text-xl font-medium" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Aura Clinic
            </span>
          </div>

          {/* [FIX] Pakai komponen StepTracker — step 0-3 untuk form steps */}
          <div className="relative z-10">
            <StepTracker currentStep={step} />
          </div>

          <div className="relative z-10">
            <p className="text-xl italic text-[rgba(232,201,176,0.7)] leading-relaxed" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              "Your skin tells your story.<br />Let us help you write a beautiful one."
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 md:px-12">
          <div className="w-full max-w-md">

            <div className="flex lg:hidden items-center gap-2 mb-8">
              <span className="text-[#b87c5a] text-lg">✦</span>
              <span className="text-[#2c1f1a] text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Aura Clinic
              </span>
            </div>

            {/* Mobile step indicator — hanya tampilkan 4 form steps (0-3) */}
            <div className="flex lg:hidden gap-2 mb-6">
              {STEPS.slice(0, 4).map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{ width: i === step ? 24 : 8, background: i <= step ? "#b87c5a" : "rgba(184,124,90,0.2)" }}
                />
              ))}
            </div>

            <div className="mb-7">
              <p className="text-[11px] tracking-[0.1em] uppercase text-[#b87c5a] mb-2">
                Step {step + 1} of 4
              </p>
              <SectionTitle
                title={
                  step === 0 ? <>Choose a <em className="italic text-[#b87c5a]">Service</em></> :
                    step === 1 ? <>Choose your <em className="italic text-[#b87c5a]">Doctor</em></> :
                      step === 2 ? <>Pick a <em className="italic text-[#b87c5a]">Schedule</em></> :
                        <>Confirm <em className="italic text-[#b87c5a]">Booking</em></>
                }
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>

              {/* ── Step 0: Service ───────────────────────────────────── */}
              {step === 0 && (
                fetchingServices ? <LoadingSkeleton count={4} /> : (
                  <div className="grid sm:grid-cols-2 gap-3.5">
                    {services.map((s) => (
                      <SelectCard
                        key={s.service_id}
                        selected={selectedService?.service_id === s.service_id}
                        onClick={() => setSelectedService(s)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-2xl text-[#b87c5a]">◈</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(184,124,90,0.1)] text-[#8b4c34]">
                            {s.category?.category_name ?? "Service"}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[#2c1f1a]">{s.service_name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-[#9a6e62]">{s.description ?? ""}</p>
                          <p className="text-sm font-semibold text-[#b87c5a]">
                            {s.base_price ? `Rp ${Number(s.base_price).toLocaleString("id-ID")}` : "—"}
                          </p>
                        </div>
                      </SelectCard>
                    ))}
                  </div>
                )
              )}

              {/* ── Step 1: Doctor ────────────────────────────────────── */}
              {step === 1 && (
                fetchingDoctors ? <LoadingSkeleton count={3} horizontal /> : (
                  <div className="flex flex-col gap-3.5">
                    {doctors.map((d) => {
                      const initials = (d.user?.full_name ?? "??")
                        .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                      return (
                        <SelectCard
                          key={d.doctor_id}
                          selected={selectedDoctor?.doctor_id === d.doctor_id}
                          onClick={() => setSelectedDoctor(d)}
                          horizontal
                        >
                          <div
                            className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-semibold text-[#5a2e12]"
                            style={{ background: "linear-gradient(135deg, #e8c9b0, #d4a882)", fontFamily: "'Playfair Display', Georgia, serif" }}
                          >
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#2c1f1a]">
                              dr. {(d.user?.full_name ?? "—").replace(/^dr\.?\s*/i, "").trim()}
                            </p>
                            <p className="text-xs mt-0.5 text-[#b87c5a]">{d.specialization?.spec_name ?? "—"}</p>
                          </div>
                        </SelectCard>
                      );
                    })}
                  </div>
                )
              )}

              {/* ── Step 2: Date & Time ───────────────────────────────── */}
              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <label className={labelCls}>Date</label>
                    {fetchingSchedules ? (
                      <div className="h-20 rounded-xl bg-[rgba(184,124,90,0.06)] animate-pulse" />
                    ) : availableDays.length === 0 ? (
                      <p className="text-sm text-[#9a6e62] py-3">Doctor has no available schedule in the next 14 days.</p>
                    ) : (
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {availableDays.map((d) => {
                          const isSelected = selectedDate?.toDateString() === d.toDateString();
                          const isTaken = isDayFullyTaken(d);
                          return (
                            <button
                              key={d.toISOString()}
                              type="button"
                              onClick={() => !isTaken && setSelectedDate(d)}
                              disabled={isTaken}
                              title={isTaken ? "Slot penuh di tanggal ini" : undefined}
                              className={`shrink-0 w-16 py-3 rounded-2xl flex flex-col items-center transition-all duration-200 border relative
                                  ${isTaken
                                  ? "border-[rgba(184,124,90,0.1)] bg-[rgba(200,200,200,0.08)] text-[#c0b0a8] cursor-not-allowed opacity-50"
                                  : isSelected
                                    ? "border-[#b87c5a] bg-[rgba(184,124,90,0.07)] text-[#2c1f1a]"
                                    : "border-[rgba(184,124,90,0.2)] bg-[rgba(253,246,239,0.4)] text-[#5a3e35] hover:border-[rgba(184,124,90,0.4)]"}`}
                            >
                              <span className="text-xs opacity-70">{DAY_NAMES[d.getDay()]}</span>
                              <span className="text-lg font-semibold mt-0.5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {d.getDate()}
                              </span>
                              <span className="text-xs opacity-70">{MONTH_NAMES[d.getMonth()]}</span>
                              {isTaken && <span className="text-[9px] mt-0.5 text-[#b87c5a] font-medium">Full</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {selectedDate && (
                    <div>
                      <label className={labelCls}>Time Slot</label>
                      {schedulesForSelectedDay.length === 0 ? (
                        <p className="text-sm text-[#9a6e62]">No slots available for this day.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {schedulesForSelectedDay.map((s) => {
                            const isSelected = selectedSchedule?.schedule_id === s.schedule_id;
                            const isSlotTaken = selectedDate
                              ? takenDatesMap[s.schedule_id]?.has(toISODate(selectedDate))
                              : false;
                            return (
                              <button
                                key={s.schedule_id}
                                type="button"
                                onClick={() => !isSlotTaken && setSelectedSchedule(s)}
                                disabled={isSlotTaken}
                                title={isSlotTaken ? "Slot ini sudah dipesan" : undefined}
                                className={`py-3 px-4 rounded-xl text-sm transition-all duration-200 border text-left
                                    ${isSlotTaken
                                    ? "border-[rgba(184,124,90,0.1)] bg-[rgba(200,200,200,0.08)] text-[#c0b0a8] cursor-not-allowed opacity-50"
                                    : isSelected
                                      ? "border-[#b87c5a] bg-[rgba(184,124,90,0.07)] text-[#2c1f1a]"
                                      : "border-[rgba(184,124,90,0.2)] bg-[rgba(253,246,239,0.4)] text-[#5a3e35] hover:border-[rgba(184,124,90,0.4)]"}`}
                              >
                                <p className="font-medium">{s.start_time} – {s.end_time}</p>
                                {isSlotTaken && <p className="text-[10px] mt-0.5 text-[#b87c5a]">Fully booked</p>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 3: Confirm ───────────────────────────────────── */}
              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}>
                    <p className="text-[11px] tracking-[0.1em] uppercase text-[#b87c5a] mb-4">Summary</p>
                    {[
                      { label: "Service", value: selectedService?.service_name },
                      {
                        label: "Doctor", value: selectedDoctor?.user?.full_name ? `dr. ${selectedDoctor.user.full_name.replace(/^dr\.?\s*/i, "").trim()}` : "—"
                      },
                      { label: "Date", value: formatDate(selectedDate) },
                      { label: "Time", value: selectedSchedule ? `${selectedSchedule.start_time} – ${selectedSchedule.end_time}` : "—" },
                      { label: "Fee", value: selectedService?.base_price ? `Rp ${Number(selectedService.base_price).toLocaleString("id-ID")}` : "—" },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between py-2.5" style={{ borderBottom: "1px solid rgba(184,124,90,0.08)" }}>
                        <span className="text-sm text-[#9a6e62]">{row.label}</span>
                        <span className="text-sm font-medium text-[#2c1f1a]">{row.value ?? "—"}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className={labelCls}>
                      Additional Notes <span className="text-[#c0a090] font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any skin concerns or requests for your doctor…"
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                </div>
              )}

              {/* ── Navigation ────────────────────────────────────────── */}
              <div className="flex gap-2.5 mt-7">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-[rgba(184,124,90,0.25)] text-[#5a3e35] text-sm cursor-pointer bg-transparent hover:bg-[rgba(184,124,90,0.05)] transition-all duration-200"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: loading ? "rgba(184,124,90,0.5)" : "linear-gradient(135deg, #c4865f, #9a5030)" }}
                >
                  {loading ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Processing…
                    </>
                  ) : step < 3 ? (
                    <>Continue <span className="text-base">→</span></>
                  ) : (
                    <>Confirm Booking <span className="text-base">→</span></>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-7">
              <Link
                to="/patient/dashboard"
                className="inline-flex items-center gap-1 text-xs text-[#b0907e] hover:text-[#b87c5a] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to dashboard
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default BookingPage;