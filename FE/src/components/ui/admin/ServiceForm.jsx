import { useState, useEffect } from "react";

// ── Constants ──────────────────────────────────────────────────────────────
const EMPTY = {
    service_name: "",
    category_id:  "",
    description:  "",
    base_price:   "",
    unit:         "",
    is_active:    true,
};

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

// ── ServiceForm ────────────────────────────────────────────────────────────
// Props:
//   mode: 'create' | 'edit'
//   defaultValues: service object dari API (edit mode) — field: service_id, service_name, base_price, dll
//   categories: ServiceCategory[] dari API — field: category_id, category_name
//   onSubmit: (payload) => Promise<void>
//   onCancel: () => void
//   isLoading: boolean
export default function ServiceForm({
    mode = "create",
    defaultValues = null,
    categories = [],
    onSubmit,
    onCancel,
    isLoading = false,
}) {
    const [form,   setForm]   = useState(EMPTY);
    const [errors, setErrors] = useState({});

    // ── Sync form saat defaultValues berubah (edit mode) ──────────────────
    useEffect(() => {
        if (mode === "edit" && defaultValues) {
            setForm({
                service_name: defaultValues.service_name ?? "",
                category_id:  defaultValues.category_id  ?? "",
                description:  defaultValues.description   ?? "",
                base_price:   defaultValues.base_price    ?? "",
                unit:         defaultValues.unit           ?? "",
                is_active:    defaultValues.is_active      ?? true,
            });
        } else {
            setForm(EMPTY);
        }
        setErrors({});
    }, [mode, defaultValues?.service_id]);

    // ── Helpers ────────────────────────────────────────────────────────────
    const set = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const validate = () => {
        const e = {};
        if (!form.service_name.trim())               e.service_name = "Nama layanan wajib diisi.";
        if (!form.category_id)                        e.category_id  = "Kategori wajib dipilih.";
        if (form.base_price === "")                   e.base_price   = "Harga wajib diisi.";
        else if (isNaN(Number(form.base_price)) || Number(form.base_price) < 0)
            e.base_price = "Harga harus angka yang valid.";
        return e;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        onSubmit({
            service_name: form.service_name.trim(),
            category_id:  Number(form.category_id),
            description:  form.description.trim() || null,
            base_price:   Number(form.base_price),
            unit:         form.unit.trim() || null,
            // is_active tidak dikirim di payload store/update —
            // toggle is_active pakai endpoint PATCH /services/:id/toggle terpisah
        });
    };

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

            {/* ── Nama Layanan ── */}
            <Field label="Nama Layanan" required error={errors.service_name}>
                <input type="text" placeholder="Facial Treatment"
                    value={form.service_name} onChange={(e) => set("service_name", e.target.value)}
                    className={inputCls} disabled={isLoading} />
            </Field>

            {/* ── Row: Kategori + Unit ── */}
            <div className="grid grid-cols-2 gap-3">
                <Field label="Kategori" required error={errors.category_id}>
                    <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)}
                        className={inputCls} disabled={isLoading}>
                        <option value="">Pilih kategori…</option>
                        {categories.map((c) => (
                            <option key={c.category_id} value={c.category_id}>
                                {c.category_name}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label="Unit" error={errors.unit}>
                    <input type="text" placeholder="sesi / 30 menit"
                        value={form.unit} onChange={(e) => set("unit", e.target.value)}
                        className={inputCls} disabled={isLoading} />
                </Field>
            </div>

            {/* ── Harga ── */}
            <Field label="Harga (Rp)" required error={errors.base_price}>
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
                        style={{ color: "#9a6e62" }}>
                        Rp
                    </span>
                    <input type="number" min="0" placeholder="350000"
                        value={form.base_price} onChange={(e) => set("base_price", e.target.value)}
                        className={`${inputCls} pl-9`} disabled={isLoading} />
                </div>
                {form.base_price !== "" && !errors.base_price && (
                    <p className="text-xs mt-1" style={{ color: "#9a6e62" }}>
                        {Number(form.base_price) === 0
                            ? "Gratis"
                            : "Rp " + Number(form.base_price).toLocaleString("id-ID")}
                    </p>
                )}
            </Field>

            {/* ── Deskripsi ── */}
            <Field label="Deskripsi Layanan">
                <textarea rows={3}
                    placeholder="Jelaskan manfaat, prosedur, dan untuk siapa layanan ini cocok…"
                    value={form.description} onChange={(e) => set("description", e.target.value)}
                    className={`${inputCls} resize-none`} disabled={isLoading} />
            </Field>

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
                        : mode === "edit" ? "Simpan Perubahan" : "Tambah Layanan"
                    }
                </button>
            </div>
        </form>
    );
}