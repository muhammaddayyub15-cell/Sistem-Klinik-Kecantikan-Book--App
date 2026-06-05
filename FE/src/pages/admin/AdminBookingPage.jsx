import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../contexts/BookingContext";
import { getAvailableDoctors, getDoctorActiveSchedules } from "../../api/doctorApi";
import { getServices } from "../../api/serviceApi";
import { getPatients } from "../../api/patientApi";
import StatusBadge from "../../components/ui/shared/StatusBadge";
import DataTable from "../../components/ui/shared/DataTable";

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["all", "pending", "confirmed", "done", "cancelled"];

const DAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

function toISODate(date) {
    if (!date) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(str) {
    if (!str) return "—";
    const d = new Date(str);
    return `${DAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

// ── Shared style ──────────────────────────────────────────────────────────────
const inputCls =
    "w-full px-4 py-3 rounded-xl border border-[#e8d5c8] bg-[#fdf8f5] text-[#2c1f1a] text-sm placeholder-[#c4a898] outline-none transition-all duration-200 focus:border-[#b87c5a] focus:bg-white focus:shadow-sm";
const labelCls = "block text-xs font-medium text-[#5a3e35] mb-1.5 tracking-wide";
const selectCls = `${inputCls} cursor-pointer`;

// ── Sub-components ────────────────────────────────────────────────────────────

// Modal wrapper
function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div
                className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl"
                style={{ background: "#faf8f5", border: "1px solid rgba(184,124,90,0.15)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(184,124,90,0.1)" }}>
                    <h2 className="text-lg font-normal text-[#2c1f1a]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#9a6e62] hover:bg-[rgba(184,124,90,0.1)] transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}

// Confirm modal untuk update status
function ConfirmModal({ booking, newStatus, onConfirm, onClose, loading }) {
    const ACTION_LABEL = { confirmed: "Confirm", done: "Mark as Done", cancelled: "Cancel" };
    const ACTION_COLOR = { confirmed: "#3b82f6", done: "#16a34a", cancelled: "#c0392b" };

    return (
        <Modal title="Update Booking Status" onClose={onClose}>
            <p className="text-sm text-[#5a3e35] mb-2">
                Are you sure you want to mark this booking as{" "}
                <strong style={{ color: ACTION_COLOR[newStatus] }}>{newStatus}</strong>?
            </p>
            <div className="rounded-xl p-4 mb-5 text-sm" style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.1)" }}>
                <p><span className="text-[#9a6e62]">Patient: </span><span className="font-medium">{booking?.patient?.user?.full_name ?? "—"}</span></p>
                <p className="mt-1"><span className="text-[#9a6e62]">Doctor: </span><span className="font-medium">dr. {booking?.doctor?.user?.full_name ?? "—"}</span></p>
                <p className="mt-1"><span className="text-[#9a6e62]">Date: </span><span className="font-medium">{formatDate(booking?.booked_date)}</span></p>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-sm border border-[rgba(184,124,90,0.25)] text-[#5a3e35] hover:bg-[rgba(184,124,90,0.05)] transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl text-sm text-white font-medium transition-colors disabled:opacity-50"
                    style={{ background: ACTION_COLOR[newStatus] ?? "#b87c5a" }}
                >
                    {loading ? "Updating…" : `Yes, ${ACTION_LABEL[newStatus] ?? "Update"}`}
                </button>
            </div>
        </Modal>
    );
}

// ── Create Booking Form (wizard 3 langkah: Patient → Doctor → Schedule+Confirm)
function CreateBookingModal({ onClose, onSuccess }) {
    const { createBooking } = useBooking();
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Data dari API
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [services, setServices] = useState([]);
    const [doctorSchedules, setDoctorSchedules] = useState([]);
    const [fetchingPatients, setFetchingPatients] = useState(false);
    const [fetchingDoctors, setFetchingDoctors] = useState(false);
    const [fetchingServices, setFetchingServices] = useState(false);
    const [fetchingSchedules, setFetchingSchedules] = useState(false);

    // Pilihan
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [notes, setNotes] = useState("");

    // Search input untuk patient & doctor
    const [patientSearch, setPatientSearch] = useState("");
    const [doctorSearch, setDoctorSearch] = useState("");

    const days = getNextDays(14);

    // Fetch patients & services saat mount
    useEffect(() => {
        const run = async () => {
            setFetchingPatients(true);
            setFetchingServices(true);
            try {
                const [pRes, sRes] = await Promise.all([getPatients(), getServices()]);
                const pData = pRes.data?.data ?? pRes.data ?? [];
                const sData = sRes.data?.data ?? sRes.data ?? [];

                // DEBUG: cek struktur data dari API — hapus setelah konfirmasi struktur benar
                console.log("[DEBUG] Full patients response:", pRes);
                console.log("[DEBUG] pData raw:", pData);
                if (pData.length > 0) {
                    console.log("[DEBUG] Patient[0] keys:", Object.keys(pData[0]));
                    console.log("[DEBUG] Patient[0] full:", JSON.stringify(pData[0], null, 2));
                }
                console.log("[DEBUG] Full services response:", sRes);
                console.log("[DEBUG] sRes.data:", sRes.data);
                console.log("[DEBUG] sRes.data keys:", sRes.data ? Object.keys(sRes.data) : "null");
                console.log("[DEBUG] sRes status:", sRes.status);
                console.log("[DEBUG] sData raw:", sData);
                if (sData.length > 0) {
                    console.log("[DEBUG] Service[0] keys:", Object.keys(sData[0]));
                    console.log("[DEBUG] Service[0] full:", JSON.stringify(sData[0], null, 2));
                }

                setPatients(pData);
                setServices(sData);
            } catch {
                setError("Gagal memuat data pasien / layanan.");
            } finally {
                setFetchingPatients(false);
                setFetchingServices(false);
            }
        };
        run();
    }, []);

    // Fetch doctors saat masuk step 1
    useEffect(() => {
        if (step !== 1) return;
        const run = async () => {
            setFetchingDoctors(true);
            try {
                const res = await getAvailableDoctors();
                setDoctors(res.data?.data ?? res.data ?? []);
            } catch {
                setError("Gagal memuat data dokter.");
            } finally {
                setFetchingDoctors(false);
            }
        };
        run();
    }, [step]);

    // Fetch jadwal aktif saat dokter dipilih
    useEffect(() => {
        if (!selectedDoctor) return;
        setSelectedDate(null);
        setSelectedSchedule(null);
        setDoctorSchedules([]);
        const run = async () => {
            setFetchingSchedules(true);
            try {
                const res = await getDoctorActiveSchedules(selectedDoctor.doctor_id ?? selectedDoctor.id);
                setDoctorSchedules(res.data?.data ?? res.data ?? []);
            } catch {
                setError("Gagal memuat jadwal dokter.");
            } finally {
                setFetchingSchedules(false);
            }
        };
        run();
    }, [selectedDoctor]);

    // Reset selectedSchedule saat tanggal berubah
    useEffect(() => { setSelectedSchedule(null); }, [selectedDate]);

    const availableDayNames = doctorSchedules.map((s) => s.day_of_week);
    const availableDays = days.filter((d) => availableDayNames.includes(DAY_FULL[d.getDay()]));
    const schedulesForSelectedDay = selectedDate
        ? doctorSchedules.filter((s) => s.day_of_week === DAY_FULL[selectedDate.getDay()])
        : [];

    // ── Helper: ambil field patient secara defensif (support berbagai struktur API)
    const getPatientId = (p) => p?.patient_id ?? p?.id;
    const getPatientName = (p) => p?.user?.full_name ?? p?.full_name ?? p?.name ?? "Unknown";
    const getPatientEmail = (p) => p?.user?.email ?? p?.email ?? "";

    // Filter search
    const filteredPatients = patients.filter((p) =>
        getPatientName(p).toLowerCase().includes(patientSearch.toLowerCase())
    );
    const filteredDoctors = doctors.filter((d) =>
        (d.user?.full_name ?? "").toLowerCase().includes(doctorSearch.toLowerCase())
    );

    const STEPS = ["Patient", "Doctor", "Schedule"];

    const validateStep = () => {
        if (step === 0 && !selectedPatient) { setError("Please select a patient."); return false; }
        if (step === 0 && !selectedService) { setError("Please select a service."); return false; }
        if (step === 1 && !selectedDoctor) { setError("Please select a doctor."); return false; }
        if (step === 2 && !selectedDate) { setError("Please select a date."); return false; }
        if (step === 2 && !selectedSchedule) { setError("Please select a time slot."); return false; }
        setError("");
        return true;
    };

    const handleNext = () => { if (!validateStep()) return; setStep((s) => s + 1); };
    const handleBack = () => { setError(""); setStep((s) => s - 1); };

    const handleSubmit = async () => {
        if (!validateStep()) return;
        setLoading(true);
        try {
            await createBooking({
                patient_id: getPatientId(selectedPatient),
                doctor_id: selectedDoctor.doctor_id ?? selectedDoctor.id,
                service_id: selectedService.service_id,
                doctsched_id: selectedSchedule.schedule_id,
                booked_date: toISODate(selectedDate),
                notes: notes || null,
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message ?? "Booking gagal dibuat.");
        } finally {
            setLoading(false);
        }
    };

    // Navigate ke halaman patient (buka tab baru agar modal tidak hilang)
    const handleGoToPatients = () => {
        window.open("/admin/patients", "_blank", "noopener,noreferrer");
    };

    return (
        <Modal title="Create New Booking" onClose={onClose}>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
                {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all
              ${i < step ? "bg-[#b87c5a] text-white" : i === step ? "bg-[rgba(184,124,90,0.15)] text-[#b87c5a] border border-[#b87c5a]" : "bg-[rgba(184,124,90,0.08)] text-[#c0a090]"}`}>
                            {i < step ? "✓" : i + 1}
                        </div>
                        <span className={`text-xs ${i === step ? "text-[#2c1f1a] font-medium" : "text-[#9a6e62]"}`}>{s}</span>
                        {i < STEPS.length - 1 && <div className="w-6 h-px bg-[rgba(184,124,90,0.2)]" />}
                    </div>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </div>
            )}

            {/* ── Step 0: Patient + Service ── */}
            {step === 0 && (
                <div className="flex flex-col gap-4">
                    {/* Patient label + New Patient button */}
                    <div className="flex items-center justify-between">
                        <label className={labelCls} style={{ marginBottom: 0 }}>Patient</label>
                        <button
                            type="button"
                            onClick={handleGoToPatients}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                            style={{
                                background: "rgba(184,124,90,0.08)",
                                border: "1px solid rgba(184,124,90,0.25)",
                                color: "#b87c5a",
                            }}
                        >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Manage Patients
                        </button>
                    </div>

                    {/* Patient search */}
                    <input
                        type="text"
                        placeholder="Search patient name…"
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        className={inputCls}
                    />

                    {/* Patient list */}
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                        {fetchingPatients ? (
                            <div className="text-xs text-[#9a6e62] py-2">Loading patients…</div>
                        ) : filteredPatients.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-5 text-center">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ background: "rgba(184,124,90,0.08)" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b87c5a" strokeWidth="1.5">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <line x1="19" y1="8" x2="19" y2="14" />
                                        <line x1="22" y1="11" x2="16" y2="11" />
                                    </svg>
                                </div>
                                <p className="text-xs text-[#9a6e62]">
                                    {patientSearch ? `No patient named "${patientSearch}" found.` : "No patients available."}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleGoToPatients}
                                    className="text-xs text-[#b87c5a] underline underline-offset-2"
                                >
                                    Create a new patient →
                                </button>
                            </div>
                        ) : filteredPatients.map((p) => {
                            const id = getPatientId(p);
                            const name = getPatientName(p);
                            const email = getPatientEmail(p);
                            const initial = name[0]?.toUpperCase() ?? "?";
                            const isSelected = getPatientId(selectedPatient) === id;

                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setSelectedPatient(p)}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all
                                        ${isSelected
                                            ? "border-[#b87c5a] bg-[rgba(184,124,90,0.07)]"
                                            : "border-[rgba(184,124,90,0.2)] bg-[rgba(253,246,239,0.4)] hover:border-[rgba(184,124,90,0.4)]"
                                        }`}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-[#5a2e12] shrink-0"
                                        style={{ background: "linear-gradient(135deg, #e8c9b0, #d4a882)" }}
                                    >
                                        {initial}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#2c1f1a] truncate">{name}</p>
                                        <p className="text-xs text-[#9a6e62] truncate">{email || "—"}</p>
                                    </div>
                                    {isSelected && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b87c5a" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Service select */}
                    <div>
                        <label className={labelCls}>Service</label>
                        {fetchingServices ? (
                            <div className="h-10 rounded-xl bg-[rgba(184,124,90,0.06)] animate-pulse" />
                        ) : (
                            <select
                                value={selectedService?.service_id ?? ""}
                                onChange={(e) => setSelectedService(services.find((s) => s.service_id === Number(e.target.value)) ?? null)}
                                className={selectCls}
                            >
                                <option value="">Select service…</option>
                                {services.map((s) => (
                                    <option key={s.service_id} value={s.service_id}>
                                        {s.service_name} {s.base_price ? `— Rp ${Number(s.base_price).toLocaleString("id-ID")}` : ""}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            )}

            {/* ── Step 1: Doctor ── */}
            {step === 1 && (
                <div>
                    <label className={labelCls}>Doctor</label>
                    <input
                        type="text"
                        placeholder="Search doctor name…"
                        value={doctorSearch}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                        className={`${inputCls} mb-2`}
                    />
                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                        {fetchingDoctors ? (
                            <div className="text-xs text-[#9a6e62] py-2">Loading doctors…</div>
                        ) : filteredDoctors.length === 0 ? (
                            <div className="text-xs text-[#9a6e62] py-2">No doctors found.</div>
                        ) : filteredDoctors.map((d) => {
                            const initials = (d.user?.full_name ?? "??").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                            return (
                                <button
                                    key={d.doctor_id}
                                    type="button"
                                    onClick={() => setSelectedDoctor(d)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all
                    ${selectedDoctor?.doctor_id === d.doctor_id
                                            ? "border-[#b87c5a] bg-[rgba(184,124,90,0.07)]"
                                            : "border-[rgba(184,124,90,0.2)] bg-[rgba(253,246,239,0.4)] hover:border-[rgba(184,124,90,0.4)]"}`}
                                >
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-[#5a2e12] shrink-0"
                                        style={{ background: "linear-gradient(135deg, #e8c9b0, #d4a882)", fontFamily: "'Playfair Display', Georgia, serif" }}>
                                        {initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#2c1f1a]">dr. {d.user?.full_name ?? "—"}</p>
                                        <p className="text-xs mt-0.5 text-[#b87c5a]">{d.specialization?.spec_name ?? "—"}</p>
                                    </div>
                                    {selectedDoctor?.doctor_id === d.doctor_id && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b87c5a" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Step 2: Schedule + Notes ── */}
            {step === 2 && (
                <div className="flex flex-col gap-5">
                    {/* Date */}
                    <div>
                        <label className={labelCls}>Date</label>
                        {fetchingSchedules ? (
                            <div className="h-20 rounded-xl bg-[rgba(184,124,90,0.06)] animate-pulse" />
                        ) : availableDays.length === 0 ? (
                            <p className="text-sm text-[#9a6e62]">Doctor has no available schedule in the next 14 days.</p>
                        ) : (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {availableDays.map((d) => {
                                    const isSelected = selectedDate?.toDateString() === d.toDateString();
                                    return (
                                        <button
                                            key={d.toISOString()}
                                            type="button"
                                            onClick={() => setSelectedDate(d)}
                                            className={`shrink-0 w-14 py-2.5 rounded-xl flex flex-col items-center transition-all border
                        ${isSelected
                                                    ? "border-[#b87c5a] bg-[rgba(184,124,90,0.07)] text-[#2c1f1a]"
                                                    : "border-[rgba(184,124,90,0.2)] bg-[rgba(253,246,239,0.4)] text-[#5a3e35] hover:border-[rgba(184,124,90,0.4)]"}`}
                                        >
                                            <span className="text-xs opacity-70">{DAY_SHORT[d.getDay()]}</span>
                                            <span className="text-base font-semibold mt-0.5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                                {d.getDate()}
                                            </span>
                                            <span className="text-xs opacity-70">{MONTH_SHORT[d.getMonth()]}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Time slot */}
                    {selectedDate && (
                        <div>
                            <label className={labelCls}>Time Slot</label>
                            {schedulesForSelectedDay.length === 0 ? (
                                <p className="text-sm text-[#9a6e62]">No slots available for this day.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {schedulesForSelectedDay.map((s) => {
                                        const isSelected = selectedSchedule?.schedule_id === s.schedule_id;
                                        return (
                                            <button
                                                key={s.schedule_id}
                                                type="button"
                                                onClick={() => setSelectedSchedule(s)}
                                                className={`py-2.5 px-3 rounded-xl text-sm border text-left transition-all
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

                    {/* Summary */}
                    {selectedSchedule && (
                        <div className="rounded-xl p-4 text-sm" style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.1)" }}>
                            <p className="text-[10px] tracking-widest uppercase text-[#b87c5a] mb-3">Summary</p>
                            {[
                                { label: "Patient", value: getPatientName(selectedPatient) },
                                { label: "Service", value: selectedService?.service_name },
                                { label: "Doctor", value: `dr. ${selectedDoctor?.user?.full_name ?? "—"}` },
                                { label: "Date", value: `${DAY_SHORT[selectedDate.getDay()]}, ${selectedDate.getDate()} ${MONTH_SHORT[selectedDate.getMonth()]} ${selectedDate.getFullYear()}` },
                                { label: "Time", value: `${selectedSchedule.start_time} – ${selectedSchedule.end_time}` },
                            ].map((row) => (
                                <div key={row.label} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid rgba(184,124,90,0.06)" }}>
                                    <span className="text-[#9a6e62]">{row.label}</span>
                                    <span className="font-medium text-[#2c1f1a]">{row.value ?? "—"}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className={labelCls}>Notes <span className="text-[#c0a090] font-normal">(optional)</span></label>
                        <textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional notes…"
                            className={`${inputCls} resize-none`}
                        />
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
                {step > 0 && (
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[rgba(184,124,90,0.25)] text-[#5a3e35] text-sm hover:bg-[rgba(184,124,90,0.05)] transition-colors"
                    >
                        ← Back
                    </button>
                )}
                {step < 2 ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-colors"
                        style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)" }}
                    >
                        Continue →
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
                        style={{ background: loading ? "rgba(184,124,90,0.5)" : "linear-gradient(135deg, #c4865f, #9a5030)" }}
                    >
                        {loading ? "Creating…" : "Create Booking →"}
                    </button>
                )}
            </div>
        </Modal>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function AdminBookingPage() {
    const { bookings, isLoading, fetchBookings, updateBookingStatus } = useBooking();

    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [confirmModal, setConfirmModal] = useState(null); // { booking, newStatus }
    const [updating, setUpdating] = useState(false);

    // Fetch bookings saat mount
    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // ── Filter data ───────────────────────────────────────────────────────
    const filtered = bookings.filter((b) => {
        const matchStatus = statusFilter === "all" || b.status === statusFilter;
        const query = search.toLowerCase();
        const matchSearch = !query
            || (b.patient?.user?.full_name ?? "").toLowerCase().includes(query)
            || (b.doctor?.user?.full_name ?? "").toLowerCase().includes(query)
            || (b.service?.service_name ?? "").toLowerCase().includes(query);
        return matchStatus && matchSearch;
    });

    // ── Handle status update ──────────────────────────────────────────────
    const handleConfirmStatus = async () => {
        if (!confirmModal) return;
        setUpdating(true);
        try {
            await updateBookingStatus(confirmModal.booking.booking_id, confirmModal.newStatus);
            setConfirmModal(null);
        } finally {
            setUpdating(false);
        }
    };

    // ── Table columns ─────────────────────────────────────────────────────
    const columns = [
        {
            key: "booking_id",
            label: "#",
            sortable: true,
            width: 60,
            render: (val) => <span className="text-[#9a6e62] text-xs">#{val}</span>,
        },
        {
            key: "patient",
            label: "Patient",
            sortable: false,
            render: (_, row) => (
                <div>
                    <p className="font-medium text-[#2c1f1a] text-sm">{row.patient?.user?.full_name ?? "—"}</p>
                    <p className="text-xs text-[#9a6e62]">{row.patient?.user?.email ?? ""}</p>
                </div>
            ),
        },
        {
            key: "doctor",
            label: "Doctor",
            sortable: false,
            render: (_, row) => (
                <div>
                    <p className="text-sm text-[#2c1f1a]">dr. {row.doctor?.user?.full_name ?? "—"}</p>
                    <p className="text-xs text-[#b87c5a]">{row.doctor?.specialization?.spec_name ?? ""}</p>
                </div>
            ),
        },
        {
            key: "service",
            label: "Service",
            sortable: false,
            render: (_, row) => <span className="text-sm text-[#2c1f1a]">{row.service?.service_name ?? "—"}</span>,
        },
        {
            key: "booked_date",
            label: "Date",
            sortable: true,
            render: (val) => <span className="text-sm text-[#2c1f1a] whitespace-nowrap">{formatDate(val)}</span>,
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (val) => <StatusBadge status={val} dot />,
        },
        {
            key: "actions",
            label: "Actions",
            align: "right",
            render: (_, row) => {
                if (["done", "cancelled"].includes(row.status)) {
                    return <span className="text-xs text-[#c0a090]">—</span>;
                }
                return (
                    <div className="flex items-center justify-end gap-2">
                        {row.status === "pending" && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setConfirmModal({ booking: row, newStatus: "confirmed" }); }}
                                className="px-3 py-1 rounded-lg text-xs font-medium text-white transition-colors"
                                style={{ background: "#3b82f6" }}
                            >
                                Confirm
                            </button>
                        )}
                        {row.status === "confirmed" && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setConfirmModal({ booking: row, newStatus: "done" }); }}
                                className="px-3 py-1 rounded-lg text-xs font-medium text-white transition-colors"
                                style={{ background: "#16a34a" }}
                            >
                                Done
                            </button>
                        )}
                        {["pending", "confirmed"].includes(row.status) && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setConfirmModal({ booking: row, newStatus: "cancelled" }); }}
                                className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                                style={{ background: "rgba(192,57,43,0.1)", color: "#c0392b" }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');`}</style>

            <div className="min-h-screen px-6 py-10" style={{ background: "#faf8f5", color: "#2c1f1a", fontFamily: "'DM Sans', sans-serif" }}>
                <div className="max-w-6xl mx-auto">

                    {/* ── Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                        <div>
                            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Admin Panel</p>
                            <h1 className="text-4xl font-normal leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                Booking <span className="italic" style={{ color: "#b87c5a" }}>Management</span>
                            </h1>
                        </div>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-opacity hover:opacity-90 self-start sm:self-auto"
                            style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            New Booking
                        </button>
                    </div>

                    {/* ── Filter & Search bar ── */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        {/* Search */}
                        <div className="relative flex-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b0907e" strokeWidth="2"
                                className="absolute left-3.5 top-1/2 -translate-y-1/2">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search patient, doctor, or service…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e8d5c8] bg-white text-sm text-[#2c1f1a] placeholder-[#c4a898] outline-none focus:border-[#b87c5a] transition-colors"
                            />
                        </div>

                        {/* Status filter tabs */}
                        <div className="flex gap-1.5 flex-wrap">
                            {STATUS_OPTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all
                    ${statusFilter === s
                                            ? "text-white"
                                            : "text-[#5a3e35] hover:bg-[rgba(184,124,90,0.08)]"}`}
                                    style={statusFilter === s ? { background: "linear-gradient(135deg, #c4865f, #9a5030)" } : { background: "rgba(184,124,90,0.06)", border: "1px solid rgba(184,124,90,0.15)" }}
                                >
                                    {s === "all" ? `All (${bookings.length})` : s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── DataTable ── */}
                    <DataTable
                        columns={columns}
                        data={filtered}
                        isLoading={isLoading}
                        emptyMessage="No bookings found for the selected filter."
                        skeletonRows={6}
                    />

                </div>
            </div>

            {/* ── Modals ── */}
            {showCreate && (
                <CreateBookingModal
                    onClose={() => setShowCreate(false)}
                    onSuccess={() => fetchBookings()}
                />
            )}

            {confirmModal && (
                <ConfirmModal
                    booking={confirmModal.booking}
                    newStatus={confirmModal.newStatus}
                    onConfirm={handleConfirmStatus}
                    onClose={() => setConfirmModal(null)}
                    loading={updating}
                />
            )}
        </>
    );
}

export default AdminBookingPage;