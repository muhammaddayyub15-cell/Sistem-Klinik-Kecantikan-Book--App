import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBooking } from "../../contexts/BookingContext";
import { getServices } from "../../api/serviceApi";
import { getAvailableDoctors, getDoctorActiveSchedules } from "../../api/doctorApi";

// ── Constants ─────────────────────────────────────────────────────────────────
const STEPS = ["Service", "Doctor", "Schedule", "Confirm"];
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

function SuccessScreen({ service, doctor, date, schedule, notes }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#faf8f5" }}>
      <div className="text-center max-w-md w-full">
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
          Booking <em className="italic" style={{ color: "#b87c5a" }}>Confirmed</em>
        </h2>
        <p className="text-sm mb-8" style={{ color: "#9a6e62" }}>
          Your appointment has been scheduled. We'll send a reminder closer to your visit.
        </p>
        <div className="rounded-2xl p-6 text-left mb-8" style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}>
          {[
            { label: "Service", value: service?.service_name },
            { label: "Doctor", value: doctor?.user?.full_name ? `dr. ${doctor.user.full_name}` : "—" },
            { label: "Date", value: formatDate(date) },
            { label: "Time", value: schedule ? `${schedule.start_time} – ${schedule.end_time}` : "—" },
            { label: "Notes", value: notes || "—" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between py-2.5" style={{ borderBottom: "1px solid rgba(184,124,90,0.08)" }}>
              <span className="text-sm" style={{ color: "#9a6e62" }}>{row.label}</span>
              <span className="text-sm font-medium" style={{ color: "#2c1f1a" }}>{row.value ?? "—"}</span>
            </div>
          ))}
        </div>
        <Link
          to="/patient/dashboard"
          className="inline-block px-8 py-3 rounded-xl text-white text-sm font-medium hover:opacity-90 transition"
          style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)" }}
        >
          Back to Dashboard →
        </Link>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function BookingPage() {
  const { createBooking } = useBooking();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // ── Data dari API ─────────────────────────────────────────────────────
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorSchedules, setDoctorSchedules] = useState([]); // jadwal aktif dokter terpilih
  const [fetchingServices, setFetchingServices] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(false);
  const [fetchingSchedules, setFetchingSchedules] = useState(false);

  // ── Pilihan user ──────────────────────────────────────────────────────
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null); // satu slot jadwal dokter
  const [notes, setNotes] = useState("");

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

  // ── Fetch jadwal aktif dokter saat dokter dipilih ─────────────────────
  // Reset selectedDate & selectedSchedule setiap kali dokter berubah
  useEffect(() => {
    if (!selectedDoctor) return;
    setSelectedDate(null);
    setSelectedSchedule(null);
    setDoctorSchedules([]);

    const fetchSchedules = async () => {
      setFetchingSchedules(true);
      try {
        const res = await getDoctorActiveSchedules(selectedDoctor.doctor_id);
        setDoctorSchedules(res.data?.data ?? res.data ?? []);
      } catch {
        setError("Gagal memuat jadwal dokter.");
      } finally {
        setFetchingSchedules(false);
      }
    };
    fetchSchedules();
  }, [selectedDoctor]);

  // ── Hari yang tersedia berdasarkan jadwal dokter ──────────────────────
  // Hanya tampilkan tanggal yang hari-nya ada di jadwal aktif dokter
  const availableDayNames = doctorSchedules.map((s) => s.day_of_week); // ["Monday", "Wednesday", ...]
  const availableDays = days.filter((d) => availableDayNames.includes(DAY_FULL[d.getDay()]));

  // ── Slot jadwal untuk hari yang dipilih ───────────────────────────────
  // Satu dokter bisa punya beberapa slot di hari yang sama (pagi/sore)
  const schedulesForSelectedDay = selectedDate
    ? doctorSchedules.filter((s) => s.day_of_week === DAY_FULL[selectedDate.getDay()])
    : [];

  // Reset selectedSchedule saat tanggal berubah
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

  // ── Submit — payload sesuai skema backend ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    try {
      await createBooking({
        doctor_id: selectedDoctor.doctor_id,
        service_id: selectedService.service_id,
        doctor_schedule_id: selectedSchedule.schedule_id,
        booked_date: toISODate(selectedDate),
        notes: notes || null,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <SuccessScreen
        service={selectedService}
        doctor={selectedDoctor}
        date={selectedDate}
        schedule={selectedSchedule}
        notes={notes}
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

          {/* Logo */}
          <div className="flex items-center gap-2.5 relative z-10">
            <span className="text-[#e8c9b0] text-2xl">✦</span>
            <span className="text-[#f5ede4] text-xl font-medium" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Aura Clinic
            </span>
          </div>

          {/* Step tracker */}
          <div className="relative z-10">
            <p className="text-[10px] tracking-[0.12em] uppercase text-[rgba(232,201,176,0.6)] mb-8">
              Booking steps
            </p>
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
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

          {/* Quote */}
          <div className="relative z-10">
            <p className="text-xl italic text-[rgba(232,201,176,0.7)] leading-relaxed" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              "Your skin tells your story.<br />Let us help you write a beautiful one."
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 md:px-12">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2 mb-8">
              <span className="text-[#b87c5a] text-lg">✦</span>
              <span className="text-[#2c1f1a] text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Aura Clinic
              </span>
            </div>

            {/* Mobile step dots */}
            <div className="flex lg:hidden gap-2 mb-6">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{ width: i === step ? 24 : 8, background: i <= step ? "#b87c5a" : "rgba(184,124,90,0.2)" }}
                />
              ))}
            </div>

            {/* Step header */}
            <div className="mb-7">
              <p className="text-[11px] tracking-[0.1em] uppercase text-[#b87c5a] mb-2">
                Step {step + 1} of {STEPS.length}
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

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>

              {/* ── Step 0: Choose Service ────────────────────────────── */}
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

              {/* ── Step 1: Choose Doctor ─────────────────────────────── */}
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
                              dr. {d.user?.full_name ?? "—"}
                            </p>
                            <p className="text-xs mt-0.5 text-[#b87c5a]">
                              {d.specialization?.spec_name ?? "—"}
                            </p>
                          </div>
                        </SelectCard>
                      );
                    })}
                  </div>
                )
              )}

              {/* ── Step 2: Choose Date & Time ────────────────────────── */}
              {step === 2 && (
                <div className="flex flex-col gap-5">

                  {/* Tanggal — hanya hari yang ada jadwal aktif dokter */}
                  <div>
                    <label className={labelCls}>Date</label>
                    {fetchingSchedules ? (
                      <div className="h-20 rounded-xl bg-[rgba(184,124,90,0.06)] animate-pulse" />
                    ) : availableDays.length === 0 ? (
                      <p className="text-sm text-[#9a6e62] py-3">
                        Doctor has no available schedule in the next 14 days.
                      </p>
                    ) : (
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {availableDays.map((d) => {
                          const isSelected = selectedDate?.toDateString() === d.toDateString();
                          return (
                            <button
                              key={d.toISOString()}
                              type="button"
                              onClick={() => setSelectedDate(d)}
                              className={`shrink-0 w-16 py-3 rounded-2xl flex flex-col items-center transition-all duration-200 border
                                ${isSelected
                                  ? "border-[#b87c5a] bg-[rgba(184,124,90,0.07)] text-[#2c1f1a]"
                                  : "border-[rgba(184,124,90,0.2)] bg-[rgba(253,246,239,0.4)] text-[#5a3e35] hover:border-[rgba(184,124,90,0.4)]"}`}
                            >
                              <span className="text-xs opacity-70">{DAY_NAMES[d.getDay()]}</span>
                              <span className="text-lg font-semibold mt-0.5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {d.getDate()}
                              </span>
                              <span className="text-xs opacity-70">{MONTH_NAMES[d.getMonth()]}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Slot waktu — dari jadwal dokter di hari yang dipilih */}
                  {selectedDate && (
                    <div>
                      <label className={labelCls}>Time Slot</label>
                      {schedulesForSelectedDay.length === 0 ? (
                        <p className="text-sm text-[#9a6e62]">No slots available for this day.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {schedulesForSelectedDay.map((s) => {
                            const isSelected = selectedSchedule?.schedule_id === s.schedule_id;
                            return (
                              <button
                                key={s.schedule_id}
                                type="button"
                                onClick={() => setSelectedSchedule(s)}
                                className={`py-3 px-4 rounded-xl text-sm transition-all duration-200 border text-left
                                  ${isSelected
                                    ? "border-[#b87c5a] bg-[rgba(184,124,90,0.07)] text-[#2c1f1a]"
                                    : "border-[rgba(184,124,90,0.2)] bg-[rgba(253,246,239,0.4)] text-[#5a3e35] hover:border-[rgba(184,124,90,0.4)]"}`}
                              >
                                <p className="font-medium">{s.start_time} – {s.end_time}</p>
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
                      { label: "Doctor", value: selectedDoctor?.user?.full_name ? `dr. ${selectedDoctor.user.full_name}` : "—" },
                      { label: "Date", value: formatDate(selectedDate) },
                      { label: "Time", value: selectedSchedule ? `${selectedSchedule.start_time} – ${selectedSchedule.end_time}` : "—" },
                      { label: "Price", value: selectedService?.base_price ? `Rp ${Number(selectedService.base_price).toLocaleString("id-ID")}` : "—" },
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

            {/* Back to dashboard */}
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