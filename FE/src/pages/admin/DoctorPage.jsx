import { useState, useEffect, useCallback } from "react";
import Modal from "../../components/ui/admin/Modal";
import DoctorForm from "../../components/ui/admin/DoctorForm";
import {
    getAllDoctors, getSpecializations,
    createDoctor, updateDoctor, deleteDoctor,
    toggleDoctorAvailability,
    getDoctorSchedules, createSchedule,
    deleteSchedule, toggleSchedule,
} from "../../api/doctorApi";

// ── Constants ──────────────────────────────────────────────────────────────
const DAYS_FULL  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAYS_SHORT = { Monday:"Sen", Tuesday:"Sel", Wednesday:"Rab", Thursday:"Kam", Friday:"Jum", Saturday:"Sab", Sunday:"Min" };

// ── Helpers ────────────────────────────────────────────────────────────────
function initials(name = "") {
    return name.replace("dr. ", "").split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase();
}

function Skeleton({ className = "" }) {
    return <div className={`animate-pulse rounded-xl bg-[rgba(184,124,90,0.08)] ${className}`} />;
}

// ── Schedule Modal ─────────────────────────────────────────────────────────
// Manage jadwal per dokter — list + add + toggle + delete
function ScheduleModal({ doctor, onClose }) {
    const [schedules,   setSchedules]   = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [saving,      setSaving]      = useState(false);
    const [error,       setError]       = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSched,    setNewSched]    = useState({ day_of_week: "Monday", start_time: "08:00", end_time: "17:00" });

    const doctorId = doctor.doctor_id;

    // Fetch jadwal dokter
    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getDoctorSchedules(doctorId);
            setSchedules(res.data?.data ?? res.data ?? []);
        } catch {
            setError("Gagal memuat jadwal.");
        } finally {
            setLoading(false);
        }
    }, [doctorId]);

    useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

    // Tambah jadwal baru
    const handleAddSchedule = async () => {
        setSaving(true);
        setError("");
        try {
            await createSchedule(doctorId, newSched);
            setShowAddForm(false);
            setNewSched({ day_of_week: "Monday", start_time: "08:00", end_time: "17:00" });
            await fetchSchedules();
        } catch (err) {
            setError(err?.response?.data?.message ?? "Gagal menambah jadwal.");
        } finally {
            setSaving(false);
        }
    };

    // Toggle aktif/nonaktif jadwal
    const handleToggle = async (scheduleId) => {
        try {
            await toggleSchedule(doctorId, scheduleId);
            await fetchSchedules();
        } catch {
            setError("Gagal mengubah status jadwal.");
        }
    };

    // Hapus jadwal
    const handleDelete = async (scheduleId) => {
        try {
            await deleteSchedule(doctorId, scheduleId);
            await fetchSchedules();
        } catch {
            setError("Gagal menghapus jadwal.");
        }
    };

    const inputCls = "px-3 py-2 rounded-xl border border-[rgba(184,124,90,0.22)] bg-white text-[#2c1f1a] text-sm outline-none focus:border-[#b87c5a] transition-all";

    return (
        // isOpen selalu true karena ScheduleModal hanya di-render saat scheduleTarget !== null
        <Modal isOpen={true} title={`Jadwal — dr. ${doctor.user?.full_name ?? "—"}`} onClose={onClose}>
            <div className="flex flex-col gap-4">

                {error && (
                    <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
                )}

                {/* ── List jadwal ── */}
                {loading ? (
                    <div className="flex flex-col gap-2">
                        {[1,2,3].map((k) => <Skeleton key={k} className="h-12 w-full" />)}
                    </div>
                ) : schedules.length === 0 ? (
                    <p className="text-sm text-[#9a6e62] py-2">Belum ada jadwal.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {schedules.map((s) => (
                            <div key={s.schedule_id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                style={{ background: "rgba(184,124,90,0.04)", border: "1px solid rgba(184,124,90,0.12)" }}>
                                {/* Hari */}
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                                    style={{ background: s.is_active ? "rgba(184,124,90,0.15)" : "rgba(184,124,90,0.06)", color: "#b87c5a" }}>
                                    {DAYS_SHORT[s.day_of_week]}
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#2c1f1a]">{s.day_of_week}</p>
                                    <p className="text-xs text-[#9a6e62]">{s.start_time} – {s.end_time}</p>
                                </div>
                                {/* Status badge */}
                                <span className="text-xs px-2 py-0.5 rounded-full"
                                    style={{
                                        background: s.is_active ? "rgba(106,154,106,0.12)" : "rgba(184,124,90,0.08)",
                                        color:      s.is_active ? "#3a7a3a"                 : "#9a6e62",
                                    }}>
                                    {s.is_active ? "Aktif" : "Nonaktif"}
                                </span>
                                {/* Actions */}
                                <div className="flex gap-1.5 shrink-0">
                                    <button onClick={() => handleToggle(s.schedule_id)}
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition hover:opacity-70"
                                        style={{ background: "rgba(184,124,90,0.1)", color: "#b87c5a" }}
                                        title={s.is_active ? "Nonaktifkan" : "Aktifkan"}>
                                        {s.is_active ? "⏸" : "▶"}
                                    </button>
                                    <button onClick={() => handleDelete(s.schedule_id)}
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition hover:opacity-70"
                                        style={{ background: "rgba(200,80,80,0.08)", color: "#9a3030" }}
                                        title="Hapus">
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Add form ── */}
                {showAddForm ? (
                    <div className="flex flex-col gap-3 p-4 rounded-xl"
                        style={{ background: "rgba(184,124,90,0.04)", border: "1px solid rgba(184,124,90,0.15)" }}>
                        <p className="text-xs font-medium text-[#5a3e35]">Jadwal Baru</p>
                        {/* Day */}
                        <select value={newSched.day_of_week}
                            onChange={(e) => setNewSched((p) => ({ ...p, day_of_week: e.target.value }))}
                            className={`${inputCls} w-full`}>
                            {DAYS_FULL.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {/* Time */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-[#5a3e35] mb-1 block">Mulai</label>
                                <input type="time" value={newSched.start_time}
                                    onChange={(e) => setNewSched((p) => ({ ...p, start_time: e.target.value }))}
                                    className={`${inputCls} w-full`} />
                            </div>
                            <div>
                                <label className="text-xs text-[#5a3e35] mb-1 block">Selesai</label>
                                <input type="time" value={newSched.end_time}
                                    onChange={(e) => setNewSched((p) => ({ ...p, end_time: e.target.value }))}
                                    className={`${inputCls} w-full`} />
                            </div>
                        </div>
                        {/* Actions */}
                        <div className="flex gap-2">
                            <button onClick={() => setShowAddForm(false)}
                                className="flex-1 py-2 rounded-xl text-sm border border-[rgba(184,124,90,0.25)] text-[#5a3e35] hover:bg-[rgba(184,124,90,0.05)] transition">
                                Batal
                            </button>
                            <button onClick={handleAddSchedule} disabled={saving}
                                className="flex-1 py-2 rounded-xl text-white text-sm transition disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, #c4865f, #a0613e)" }}>
                                {saving ? "Menyimpan…" : "Simpan"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setShowAddForm(true)}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition hover:opacity-80"
                        style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34", border: "1px dashed rgba(184,124,90,0.3)" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Tambah Jadwal
                    </button>
                )}
            </div>
        </Modal>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function DoctorPage() {
    const [doctors,         setDoctors]         = useState([]);
    const [specializations, setSpecs]           = useState([]);
    const [search,          setSearch]          = useState("");
    const [loading,         setLoading]         = useState(true);
    const [saving,          setSaving]          = useState(false);
    const [error,           setError]           = useState("");

    // Modal state — null = tertutup, object = terbuka
    const [doctorModal,    setDoctorModal]    = useState(null); // null | { mode: 'create'|'edit', doctor?: obj }
    const [deleteTarget,   setDeleteTarget]   = useState(null); // doctor obj
    const [scheduleTarget, setScheduleTarget] = useState(null); // doctor obj

    // ── Fetch doctors + specializations ───────────────────────────────────
    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [dRes, sRes] = await Promise.all([getAllDoctors(), getSpecializations()]);
            setDoctors(dRes.data?.data ?? dRes.data ?? []);
            setSpecs(sRes.data?.data   ?? sRes.data   ?? []);
        } catch {
            setError("Gagal memuat data dokter.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

    // ── Filter ────────────────────────────────────────────────────────────
    const filtered = doctors.filter((d) => {
        const q = search.toLowerCase();
        return !q
            || (d.user?.full_name ?? "").toLowerCase().includes(q)
            || (d.specialization?.spec_name ?? "").toLowerCase().includes(q);
    });

    // ── Create / Edit doctor ──────────────────────────────────────────────
    const handleDoctorSubmit = async (payload) => {
        setSaving(true);
        setError("");
        try {
            if (doctorModal.mode === "create") {
                await createDoctor(payload);
            } else {
                await updateDoctor(doctorModal.doctor.doctor_id, payload);
            }
            setDoctorModal(null);
            await fetchDoctors();
        } catch (err) {
            setError(err?.response?.data?.message ?? "Gagal menyimpan data dokter.");
        } finally {
            setSaving(false);
        }
    };

    // ── Delete doctor ─────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setSaving(true);
        try {
            await deleteDoctor(deleteTarget.doctor_id);
            setDeleteTarget(null);
            await fetchDoctors();
        } catch (err) {
            setError(err?.response?.data?.message ?? "Gagal menghapus dokter.");
        } finally {
            setSaving(false);
        }
    };

    // ── Toggle availability ───────────────────────────────────────────────
    const handleToggleAvailability = async (doctorId) => {
        try {
            await toggleDoctorAvailability(doctorId);
            await fetchDoctors();
        } catch {
            setError("Gagal mengubah status dokter.");
        }
    };

    // ── Derived stats ─────────────────────────────────────────────────────
    const totalActive   = doctors.filter((d) => d.is_active).length;
    const totalInactive = doctors.filter((d) => !d.is_active).length;

    return (
        <div className="min-h-screen" style={{ background: "#faf8f5", color: "#2c1f1a" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');`}</style>

            <div className="max-w-5xl mx-auto px-6 py-10">

                {/* ── Header ── */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Admin · Manage</p>
                        <h1 className="text-4xl font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Doctors <span className="italic" style={{ color: "#b87c5a" }}>& Staff</span>
                        </h1>
                    </div>
                    <button onClick={() => setDoctorModal({ mode: "create" })}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm transition hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #c4865f, #a0613e)" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add Doctor
                    </button>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
                )}

                {/* ── Stats ── */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Total Doctors", value: doctors.length },
                        { label: "Active",         value: totalActive   },
                        { label: "Inactive",       value: totalInactive },
                    ].map((s) => (
                        <div key={s.label} className="p-5 rounded-2xl"
                            style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}>
                            {loading
                                ? <div className="h-7 w-12 rounded-lg bg-[rgba(184,124,90,0.08)] animate-pulse mb-1" />
                                : <p className="text-2xl font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{s.value}</p>
                            }
                            <p className="text-xs mt-0.5" style={{ color: "#9a6e62" }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Search ── */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
                    style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.15)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0a090" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or specialization…"
                        className="flex-1 text-sm outline-none bg-transparent text-[#2c1f1a] placeholder-[#c4a898]" />
                    {search && (
                        <button onClick={() => setSearch("")} className="text-xs text-[#c0a090]">✕</button>
                    )}
                </div>

                {/* ── Table ── */}
                <div className="rounded-2xl overflow-hidden"
                    style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}>

                    {/* Header */}
                    <div className="grid gap-4 px-6 py-3"
                        style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr auto", background: "#fdf8f4", borderBottom: "1px solid rgba(184,124,90,0.08)" }}>
                        {["Doctor","Specialization","Status","Availability","Actions"].map((h) => (
                            <span key={h} className="text-xs tracking-widest uppercase" style={{ color: "#b87c5a" }}>{h}</span>
                        ))}
                    </div>

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="flex flex-col gap-0">
                            {[1,2,3,4].map((k) => (
                                <div key={k} className="grid gap-4 px-6 py-4 items-center"
                                    style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr auto", borderBottom: "1px solid rgba(184,124,90,0.06)" }}>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-9 h-9 rounded-full" />
                                        <div className="flex flex-col gap-1.5">
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-7 w-20 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <span className="text-3xl opacity-20" style={{ color: "#b87c5a" }}>◈</span>
                            <p className="text-sm" style={{ color: "#c0a090" }}>No doctors found.</p>
                        </div>
                    )}

                    {/* Rows */}
                    {!loading && filtered.map((d, i) => (
                        <div key={d.doctor_id}
                            className="grid items-center gap-4 px-6 py-4 transition-all hover:bg-stone-50"
                            style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr auto", borderBottom: i < filtered.length - 1 ? "1px solid rgba(184,124,90,0.06)" : "none" }}>

                            {/* Doctor */}
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                                    style={{ background: "linear-gradient(135deg, #e8c9b0, #d4a882)", color: "#5a2e12", fontFamily: "'Playfair Display', Georgia, serif" }}>
                                    {initials(d.user?.full_name ?? "")}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate text-[#2c1f1a]">dr. {d.user?.full_name ?? "—"}</p>
                                    <p className="text-xs truncate text-[#9a6e62]">{d.user?.email ?? ""}</p>
                                </div>
                            </div>

                            {/* Specialization */}
                            <p className="text-sm truncate text-[#5a3e35]">{d.specialization?.spec_name ?? "—"}</p>

                            {/* is_active */}
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs w-fit"
                                style={{
                                    background: d.is_active ? "rgba(106,154,106,0.12)" : "rgba(184,124,90,0.08)",
                                    color:      d.is_active ? "#3a7a3a"                 : "#9a6e62",
                                }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.is_active ? "#3a7a3a" : "#c0a090" }} />
                                {d.is_active ? "Active" : "Inactive"}
                            </span>

                            {/* is_available — toggle langsung di baris */}
                            <button onClick={() => handleToggleAvailability(d.doctor_id)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs w-fit transition hover:opacity-70"
                                style={{
                                    background: d.is_available ? "rgba(90,134,180,0.12)" : "rgba(184,124,90,0.08)",
                                    color:      d.is_available ? "#2a5a8a"                : "#9a6e62",
                                }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.is_available ? "#2a5a8a" : "#c0a090" }} />
                                {d.is_available ? "Open" : "Closed"}
                            </button>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5">
                                {/* Schedule */}
                                <button onClick={() => setScheduleTarget(d)} title="Kelola Jadwal"
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition hover:opacity-70"
                                    style={{ background: "rgba(90,134,180,0.1)", color: "#2a5a8a" }}>
                                    📅
                                </button>
                                {/* Edit */}
                                <button onClick={() => setDoctorModal({ mode: "edit", doctor: d })} title="Edit"
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition hover:opacity-70"
                                    style={{ background: "rgba(184,124,90,0.1)", color: "#b87c5a" }}>
                                    ✎
                                </button>
                                {/* Delete */}
                                <button onClick={() => setDeleteTarget(d)} title="Hapus"
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition hover:opacity-70"
                                    style={{ background: "rgba(200,80,80,0.08)", color: "#9a3030" }}>
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Doctor Create/Edit Modal ── */}
            {/* isOpen selalu true di sini — conditional render sudah dijaga oleh doctorModal !== null */}
            {doctorModal && (
                <Modal
                    isOpen={true}
                    title={doctorModal.mode === "create" ? "Add New Doctor" : "Edit Doctor"}
                    onClose={() => setDoctorModal(null)}
                >
                    <DoctorForm
                        mode={doctorModal.mode}
                        defaultValues={doctorModal.doctor ?? null}
                        specializations={specializations}
                        onSubmit={handleDoctorSubmit}
                        onCancel={() => setDoctorModal(null)}
                        isLoading={saving}
                    />
                </Modal>
            )}

            {/* ── Delete Confirm Modal ── */}
            {/* isOpen selalu true di sini — conditional render sudah dijaga oleh deleteTarget !== null */}
            {deleteTarget && (
                <Modal
                    isOpen={true}
                    title="Remove Doctor"
                    onClose={() => setDeleteTarget(null)}
                >
                    <p className="text-sm mb-6 text-[#5a3e35]">
                        Are you sure you want to remove{" "}
                        <strong>dr. {deleteTarget.user?.full_name}</strong>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setDeleteTarget(null)} disabled={saving}
                            className="px-5 py-2 rounded-xl text-sm transition hover:bg-stone-100"
                            style={{ color: "#5a3e35", border: "1px solid rgba(90,62,53,0.2)" }}>
                            Cancel
                        </button>
                        <button onClick={handleDelete} disabled={saving}
                            className="px-5 py-2 rounded-xl text-sm text-white transition disabled:opacity-50"
                            style={{ background: "#c05050" }}>
                            {saving ? "Removing…" : "Yes, Remove"}
                        </button>
                    </div>
                </Modal>
            )}

            {/* ── Schedule Modal ── */}
            {/* ScheduleModal sudah wrap Modal sendiri dengan isOpen={true} di dalamnya */}
            {scheduleTarget && (
                <ScheduleModal doctor={scheduleTarget} onClose={() => setScheduleTarget(null)} />
            )}
        </div>
    );
}