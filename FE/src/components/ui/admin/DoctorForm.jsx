import { useState, useEffect } from "react";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  specialization_id: "",
  experience_years: "",
  bio: "",
  schedule_days: [],
  schedule_start: "08:00",
  schedule_end: "17:00",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABELS = {
  Mon: "Senin",
  Tue: "Selasa",
  Wed: "Rabu",
  Thu: "Kamis",
  Fri: "Jumat",
  Sat: "Sabtu",
  Sun: "Minggu",
};

export default function DoctorForm({
  onSubmit,
  defaultValues = {},
  isLoading = false,
  specializations = [],
}) {
  const [form, setForm] = useState({ ...EMPTY, ...defaultValues });
  const [errors, setErrors] = useState({});

  // Sync saat defaultValues berubah (switch antara create/edit)
  useEffect(() => {
    setForm({ ...EMPTY, ...defaultValues });
    setErrors({});
  }, [JSON.stringify(defaultValues)]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      schedule_days: prev.schedule_days.includes(day)
        ? prev.schedule_days.filter((d) => d !== day)
        : [...prev.schedule_days, day],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nama dokter wajib diisi";
    if (!form.email.trim()) e.email = "Email wajib diisi";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Format email tidak valid";
    if (!form.specialization_id) e.specialization_id = "Spesialisasi wajib dipilih";
    if (!form.experience_years) e.experience_years = "Pengalaman wajib diisi";
    else if (isNaN(Number(form.experience_years)) || Number(form.experience_years) < 0)
      e.experience_years = "Masukkan angka yang valid";
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
      experience_years: Number(form.experience_years),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* ── Row: Nama + Email ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nama Dokter" required error={errors.name}>
          <input
            type="text"
            placeholder="dr. Anisa Putri"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="form-input"
            disabled={isLoading}
          />
        </Field>

        <Field label="Email" required error={errors.email}>
          <input
            type="email"
            placeholder="dokter@auraclinic.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="form-input"
            disabled={isLoading}
          />
        </Field>
      </div>

      {/* ── Row: Telepon + Spesialisasi ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nomor Telepon">
          <input
            type="tel"
            placeholder="08xxxxxxxxxx"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="form-input"
            disabled={isLoading}
          />
        </Field>

        <Field label="Spesialisasi" required error={errors.specialization_id}>
          <select
            value={form.specialization_id}
            onChange={(e) => set("specialization_id", e.target.value)}
            className="form-input"
            disabled={isLoading}
          >
            <option value="">Pilih spesialisasi…</option>
            {specializations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* ── Pengalaman ── */}
      <Field label="Pengalaman (tahun)" required error={errors.experience_years}>
        <input
          type="number"
          min="0"
          max="60"
          placeholder="5"
          value={form.experience_years}
          onChange={(e) => set("experience_years", e.target.value)}
          className="form-input"
          style={{ maxWidth: 140 }}
          disabled={isLoading}
        />
      </Field>

      {/* ── Bio ── */}
      <Field label="Bio Singkat">
        <textarea
          rows={3}
          placeholder="Deskripsi singkat mengenai dokter dan keahliannya…"
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          className="form-input resize-none"
          disabled={isLoading}
        />
      </Field>

      {/* ── Jadwal Praktik ── */}
      <div>
        <p className="form-label mb-2">Hari Praktik</p>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => {
            const active = form.schedule_days.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-full text-xs transition-all duration-200"
                style={{
                  background: active ? "#b87c5a" : "rgba(184,124,90,0.1)",
                  color: active ? "#fff" : "#8b4c34",
                  border: `1px solid ${active ? "#b87c5a" : "rgba(184,124,90,0.2)"}`,
                }}
              >
                {DAY_LABELS[day]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Jam Praktik ── */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Mulai">
          <input
            type="time"
            value={form.schedule_start}
            onChange={(e) => set("schedule_start", e.target.value)}
            className="form-input"
            disabled={isLoading}
          />
        </Field>
        <Field label="Selesai">
          <input
            type="time"
            value={form.schedule_end}
            onChange={(e) => set("schedule_end", e.target.value)}
            className="form-input"
            disabled={isLoading}
          />
        </Field>
      </div>

      {/* ── Divider ── */}
      <div style={{ borderTop: "1px solid rgba(184,124,90,0.12)" }} />

      {/* ── Submit ── */}
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
            "Tambah Dokter"
          )}
        </button>
      </div>

      <FormStyles />
    </form>
  );
}

/* ── Helpers ── */

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
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
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
        transition: border-color 0.2s;
      }
      .form-input::placeholder { color: #c4a898; }
      .form-input:focus { border-color: #b87c5a; box-shadow: 0 0 0 3px rgba(184,124,90,0.1); }
      .form-input:disabled { background: #faf4f0; color: #9a7a72; cursor: not-allowed; }
      select.form-input { cursor: pointer; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .animate-spin { animation: spin 0.8s linear infinite; }
    `}</style>
  );
}