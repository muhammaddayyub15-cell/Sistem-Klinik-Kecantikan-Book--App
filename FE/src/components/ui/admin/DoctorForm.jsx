import { useState, useEffect } from "react";
import { getUnassignedDoctorUsers } from "../../../api/adminApi";

// ── Constants ──────────────────────────────────────────────────────────────
const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_SHORT = { Monday: "Sen", Tuesday: "Sel", Wednesday: "Rab", Thursday: "Kam", Friday: "Jum", Saturday: "Sab", Sunday: "Min" };

// ── Styles ─────────────────────────────────────────────────────────────────
const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-[rgba(184,124,90,0.22)] bg-white text-[#2c1f1a] text-sm outline-none transition-all focus:border-[#b87c5a] focus:shadow-[0_0_0_3px_rgba(184,124,90,0.1)] disabled:bg-[#faf4f0] disabled:text-[#9a7a72] disabled:cursor-not-allowed placeholder-[#c4a898]";
const labelCls = "block text-xs font-medium text-[#5a3e35] mb-1.5";

function Field({ label, required, error, children }) {
    return (
        <div>
            <label className={labelCls}>
                {label}{required && <span className="text-[#b87c5a] ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-[#c0392b] mt-1">{error}</p>}
        </div>
    );
}

// ── DoctorForm ─────────────────────────────────────────────────────────────
// Props:
//   mode: 'create' | 'edit'
//   defaultValues: doctor object dari API (edit mode)
//   specializations: Specialization[] dari API
//   onSubmit: (payload) => Promise<void>
//   onCancel: () => void
//   isLoading: boolean
export default function DoctorForm({
    mode = "create",
    defaultValues = null,
    specializations = [],
    onSubmit,
    onCancel,
    isLoading = false,
}) {
    // ── State ──────────────────────────────────────────────────────────────
    const [form, setForm] = useState({
        user_id:      "",
        spec_id:      "",
        license_no:   "",
        bio:          "",
        is_active:    true,
        is_available: true,
    });
    const [errors,           setErrors]           = useState({});
    const [unassignedUsers,  setUnassignedUsers]  = useState([]);
    const [fetchingUsers,    setFetchingUsers]     = useState(false);

    // ── Sync form saat defaultValues berubah (edit mode) ──────────────────
    useEffect(() => {
        if (mode === "edit" && defaultValues) {
            setForm({
                user_id:      defaultValues.user_id      ?? "",
                spec_id:      defaultValues.spec_id      ?? "",
                license_no:   defaultValues.license_no   ?? "",
                bio:          defaultValues.bio           ?? "",
                is_active:    defaultValues.is_active     ?? true,
                is_available: defaultValues.is_available  ?? true,
            });
        } else {
            setForm({ user_id: "", spec_id: "", license_no: "", bio: "", is_active: true, is_available: true });
        }
        setErrors({});
    }, [mode, defaultValues?.doctor_id]);

    // ── Fetch unassigned users saat create mode ────────────────────────────
    useEffect(() => {
        if (mode !== "create") return;
        const run = async () => {
            setFetchingUsers(true);
            try {
                const res = await getUnassignedDoctorUsers();
                setUnassignedUsers(res.data?.data ?? res.data ?? []);
            } catch {
                setErrors((prev) => ({ ...prev, user_id: "Gagal memuat data user." }));
            } finally {
                setFetchingUsers(false);
            }
        };
        run();
    }, [mode]);

    // ── Helpers ────────────────────────────────────────────────────────────
    const set = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const validate = () => {
        const e = {};
        if (mode === "create" && !form.user_id)    e.user_id    = "User wajib dipilih.";
        if (!form.spec_id)                          e.spec_id    = "Spesialisasi wajib dipilih.";
        if (!form.license_no.trim())                e.license_no = "Nomor lisensi wajib diisi.";
        return e;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        const payload = {
            spec_id:      Number(form.spec_id),
            license_no:   form.license_no.trim(),
            bio:          form.bio.trim() || null,
            is_active:    form.is_active,
            is_available: form.is_available,
        };

        // user_id hanya dikirim saat create — tidak bisa diubah saat edit
        if (mode === "create") payload.user_id = Number(form.user_id);

        onSubmit(payload);
    };

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

            {/* ── User (create only) ── */}
            {mode === "create" && (
                <Field label="User (role: doctor)" required error={errors.user_id}>
                    {fetchingUsers ? (
                        <div className="h-10 rounded-xl bg-[rgba(184,124,90,0.06)] animate-pulse" />
                    ) : unassignedUsers.length === 0 ? (
                        <div className="px-4 py-3 rounded-xl text-sm text-[#9a6e62]"
                            style={{ background: "rgba(184,124,90,0.06)", border: "1px solid rgba(184,124,90,0.15)" }}>
                            Tidak ada user dengan role doctor yang belum terassign.
                            <br />
                            <span className="text-xs">Minta user register dengan role doctor terlebih dahulu.</span>
                        </div>
                    ) : (
                        <select value={form.user_id} onChange={(e) => set("user_id", e.target.value)}
                            className={inputCls} disabled={isLoading}>
                            <option value="">Pilih user…</option>
                            {unassignedUsers.map((u) => (
                                <option key={u.user_id} value={u.user_id}>
                                    {u.full_name} — {u.email}
                                </option>
                            ))}
                        </select>
                    )}
                </Field>
            )}

            {/* ── Edit mode: tampilkan nama user (read only) ── */}
            {mode === "edit" && defaultValues?.user && (
                <div className="px-4 py-3 rounded-xl text-sm"
                    style={{ background: "rgba(184,124,90,0.06)", border: "1px solid rgba(184,124,90,0.12)" }}>
                    <p className="text-xs text-[#9a6e62] mb-0.5">User</p>
                    <p className="font-medium text-[#2c1f1a]">{defaultValues.user.full_name}</p>
                    <p className="text-xs text-[#9a6e62]">{defaultValues.user.email}</p>
                </div>
            )}

            {/* ── Spesialisasi ── */}
            <Field label="Spesialisasi" required error={errors.spec_id}>
                <select value={form.spec_id} onChange={(e) => set("spec_id", e.target.value)}
                    className={inputCls} disabled={isLoading}>
                    <option value="">Pilih spesialisasi…</option>
                    {specializations.map((s) => (
                        <option key={s.spec_id} value={s.spec_id}>{s.spec_name}</option>
                    ))}
                </select>
            </Field>

            {/* ── License No ── */}
            <Field label="Nomor Lisensi (STR)" required error={errors.license_no}>
                <input type="text" placeholder="contoh: 123/STR/2024"
                    value={form.license_no} onChange={(e) => set("license_no", e.target.value)}
                    className={inputCls} disabled={isLoading} />
            </Field>

            {/* ── Bio ── */}
            <Field label="Bio Singkat">
                <textarea rows={3} placeholder="Deskripsi singkat dokter dan keahliannya…"
                    value={form.bio} onChange={(e) => set("bio", e.target.value)}
                    className={`${inputCls} resize-none`} disabled={isLoading} />
            </Field>

            {/* ── Toggle: is_active + is_available ── */}
            <div className="flex flex-col gap-3 pt-1">
                {[
                    { field: "is_active",    label: "Aktif",      desc: "Dokter muncul di sistem"          },
                    { field: "is_available", label: "Tersedia",   desc: "Dokter bisa menerima booking baru" },
                ].map(({ field, label, desc }) => (
                    <div key={field} className="flex items-center justify-between px-4 py-3 rounded-xl"
                        style={{ background: "rgba(184,124,90,0.04)", border: "1px solid rgba(184,124,90,0.12)" }}>
                        <div>
                            <p className="text-sm font-medium text-[#2c1f1a]">{label}</p>
                            <p className="text-xs text-[#9a6e62]">{desc}</p>
                        </div>
                        <button type="button" disabled={isLoading}
                            onClick={() => set(field, !form[field])}
                            className="w-11 h-6 rounded-full transition-all duration-200 relative shrink-0"
                            style={{ background: form[field] ? "#b87c5a" : "rgba(184,124,90,0.2)" }}>
                            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
                                style={{ left: form[field] ? "calc(100% - 22px)" : "2px" }} />
                        </button>
                    </div>
                ))}
            </div>

            {/* ── Divider ── */}
            <div style={{ borderTop: "1px solid rgba(184,124,90,0.12)" }} />

            {/* ── Actions ── */}
            <div className="flex justify-end gap-3">
                <button type="button" onClick={onCancel} disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl text-sm transition hover:bg-[rgba(184,124,90,0.06)]"
                    style={{ color: "#5a3e35", border: "1px solid rgba(90,62,53,0.2)" }}>
                    Batal
                </button>
                <button type="submit" disabled={isLoading}
                    className="px-6 py-2.5 rounded-xl text-white text-sm font-medium transition disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #c4865f, #a0613e)" }}>
                    {isLoading
                        ? <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                            Menyimpan…
                          </span>
                        : mode === "edit" ? "Simpan Perubahan" : "Tambah Dokter"
                    }
                </button>
            </div>
        </form>
    );
}