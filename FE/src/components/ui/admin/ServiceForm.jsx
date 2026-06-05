import { useState, useEffect } from "react";

const EMPTY = {
  name: "",
  category_id: "",
  description: "",
  duration_minutes: "",
  price: "",
  tag: "",
  is_active: true,
};

const TAG_OPTIONS = [
  { value: "Most Popular", label: "Most Popular" },
  { value: "Premium", label: "Premium" },
  { value: "Expert Care", label: "Expert Care" },
  { value: "Free First Visit", label: "Free First Visit" },
  { value: "New", label: "New" },
  { value: "", label: "Tanpa label" },
];

export default function ServiceForm({
  onSubmit,
  defaultValues = {},
  isLoading = false,
  categories = [],
}) {
  const [form, setForm] = useState({ ...EMPTY, ...defaultValues });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({ ...EMPTY, ...defaultValues });
    setErrors({});
  }, [JSON.stringify(defaultValues)]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nama layanan wajib diisi";
    if (!form.category_id) e.category_id = "Kategori wajib dipilih";
    if (!form.duration_minutes) e.duration_minutes = "Durasi wajib diisi";
    else if (isNaN(Number(form.duration_minutes)) || Number(form.duration_minutes) <= 0)
      e.duration_minutes = "Durasi harus angka positif";
    if (!form.price) e.price = "Harga wajib diisi";
    else if (isNaN(Number(form.price)) || Number(form.price) < 0)
      e.price = "Harga harus angka yang valid";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e_ = validate();
    if (Object.keys(e_).length) {
      setErrors(e_);
      return;
    }
    onSubmit({
      ...form,
      duration_minutes: Number(form.duration_minutes),
      price: Number(form.price),
    });
  };

  // Format angka harga saat display
  const formatPrice = (val) => {
    if (!val) return "";
    return Number(val).toLocaleString("id-ID");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* ── Nama layanan ── */}
      <Field label="Nama Layanan" required error={errors.name}>
        <input
          type="text"
          placeholder="Facial Treatment"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="form-input"
          disabled={isLoading}
        />
      </Field>

      {/* ── Row: Kategori + Tag ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Kategori" required error={errors.category_id}>
          <select
            value={form.category_id}
            onChange={(e) => set("category_id", e.target.value)}
            className="form-input"
            disabled={isLoading}
          >
            <option value="">Pilih kategori…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Label / Tag">
          <select
            value={form.tag}
            onChange={(e) => set("tag", e.target.value)}
            className="form-input"
            disabled={isLoading}
          >
            {TAG_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* ── Row: Durasi + Harga ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Durasi (menit)" required error={errors.duration_minutes}>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="480"
              placeholder="60"
              value={form.duration_minutes}
              onChange={(e) => set("duration_minutes", e.target.value)}
              className="form-input pr-14"
              disabled={isLoading}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: "#9a6e62" }}
            >
              menit
            </span>
          </div>
        </Field>

        <Field label="Harga (Rp)" required error={errors.price}>
          <div className="relative">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: "#9a6e62" }}
            >
              Rp
            </span>
            <input
              type="number"
              min="0"
              placeholder="350000"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              className="form-input pl-9"
              disabled={isLoading}
            />
          </div>
          {form.price && !errors.price && (
            <p className="text-xs" style={{ color: "#9a6e62" }}>
              Rp {formatPrice(form.price)}
            </p>
          )}
        </Field>
      </div>

      {/* ── Deskripsi ── */}
      <Field label="Deskripsi Layanan">
        <textarea
          rows={3}
          placeholder="Jelaskan manfaat, prosedur, dan untuk siapa layanan ini cocok…"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="form-input resize-none"
          disabled={isLoading}
        />
      </Field>

      {/* ── Preview tag ── */}
      {form.tag && (
        <div className="flex items-center gap-2">
          <p className="form-label">Preview label:</p>
          <span
            className="px-2.5 py-0.5 rounded-full text-xs"
            style={{ background: "rgba(184,124,90,0.1)", color: "#8b4c34" }}
          >
            {form.tag}
          </span>
        </div>
      )}

      {/* ── Status aktif ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={form.is_active}
          onClick={() => set("is_active", !form.is_active)}
          disabled={isLoading}
          className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
          style={{
            background: form.is_active ? "#b87c5a" : "rgba(184,124,90,0.2)",
          }}
        >
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
            style={{ left: form.is_active ? "calc(100% - 22px)" : "2px" }}
          />
        </button>
        <span className="text-sm" style={{ color: "#5a3e35" }}>
          Layanan {form.is_active ? "aktif" : "nonaktif"}
        </span>
      </div>

      {/* ── Divider ── */}
      <div style={{ borderTop: "1px solid rgba(184,124,90,0.12)" }} />

      {/* ── Actions ── */}
      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          className="px-6 py-2.5 rounded-full text-sm transition-all duration-200 hover:bg-stone-100"
          style={{ color: "#5a3e35", border: "1px solid rgba(90,62,53,0.2)" }}
          disabled={isLoading}
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-7 py-2.5 rounded-full text-white text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-60"
          style={{
            background: isLoading
              ? "#c4a07e"
              : "linear-gradient(135deg, #c4865f, #a0613e)",
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Menyimpan…
            </span>
          ) : defaultValues?.id ? (
            "Simpan Perubahan"
          ) : (
            "Tambah Layanan"
          )}
        </button>
      </div>

      <FormStyles />
    </form>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="form-label">
        {label}
        {required && <span style={{ color: "#b87c5a", marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs" style={{ color: "#c0392b" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function FormStyles() {
  return (
    <style>{`
      .form-label {
        font-size: 0.8125rem;
        color: #5a3e35;
        font-weight: 500;
        letter-spacing: 0.01em;
      }
      .form-input {
        width: 100%;
        padding: 0.625rem 0.875rem;
        border-radius: 0.75rem;
        border: 1px solid rgba(184,124,90,0.22);
        background: #fff;
        color: #2c1f1a;
        font-size: 0.875rem;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .form-input::placeholder { color: #c4a898; }
      .form-input:focus { border-color: #b87c5a; box-shadow: 0 0 0 3px rgba(184,124,90,0.1); }
      .form-input:disabled { background: #faf4f0; color: #9a7a72; cursor: not-allowed; }
      select.form-input { cursor: pointer; }
      input[type=number].form-input { appearance: textfield; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .animate-spin { animation: spin 0.8s linear infinite; }
    `}</style>
  );
}