import { useState, useEffect } from "react";


const EMPTY = {
  name: "",
  category_id: "",
  description: "",
  price: "",
  stock_qty: "",
  sku: "",
  unit: "pcs",
  is_active: true,
};

const UNITS = ["pcs", "botol", "tube", "sachet", "box", "ml", "gr"];

export default function ProductForm({
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
    if (!form.name.trim()) e.name = "Nama produk wajib diisi";
    if (!form.category_id) e.category_id = "Kategori wajib dipilih";
    if (!form.price) e.price = "Harga wajib diisi";
    else if (isNaN(Number(form.price)) || Number(form.price) < 0)
      e.price = "Harga harus angka yang valid";
    if (!form.stock_qty && form.stock_qty !== 0) e.stock_qty = "Stok wajib diisi";
    else if (isNaN(Number(form.stock_qty)) || Number(form.stock_qty) < 0)
      e.stock_qty = "Stok harus angka ≥ 0";
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
      price: Number(form.price),
      stock_qty: Number(form.stock_qty),
    });
  };

  const stockLevel = () => {
    const qty = Number(form.stock_qty);
    if (!form.stock_qty || isNaN(qty)) return null;
    if (qty === 0) return { label: "Habis", color: "#c0392b", bg: "rgba(192,57,43,0.08)" };
    if (qty <= 10) return { label: "Hampir habis", color: "#d4890a", bg: "rgba(212,137,10,0.1)" };
    return { label: "Tersedia", color: "#2e8b57", bg: "rgba(46,139,87,0.08)" };
  };

  const stock = stockLevel();

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* ── Nama produk ── */}
      <Field label="Nama Produk" required error={errors.name}>
        <input
          type="text"
          placeholder="Serum Vitamin C"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="form-input"
          disabled={isLoading}
        />
      </Field>

      {/* ── Row: Kategori + SKU ── */}
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

        <Field label="SKU (opsional)">
          <input
            type="text"
            placeholder="AUR-SVC-001"
            value={form.sku}
            onChange={(e) => set("sku", e.target.value.toUpperCase())}
            className="form-input font-mono"
            disabled={isLoading}
          />
        </Field>
      </div>

      {/* ── Row: Harga + Stok + Satuan ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Harga (Rp)" required error={errors.price}>
          <div className="relative">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
              style={{ color: "#9a6e62" }}
            >
              Rp
            </span>
            <input
              type="number"
              min="0"
              placeholder="120000"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              className="form-input pl-9"
              disabled={isLoading}
            />
          </div>
          {form.price && !errors.price && (
            <p className="text-xs" style={{ color: "#9a6e62" }}>
              Rp {Number(form.price).toLocaleString("id-ID")}
            </p>
          )}
        </Field>

        <Field label="Stok" required error={errors.stock_qty}>
          <input
            type="number"
            min="0"
            placeholder="50"
            value={form.stock_qty}
            onChange={(e) => set("stock_qty", e.target.value)}
            className="form-input"
            disabled={isLoading}
          />
          {stock && !errors.stock_qty && (
            <span
              className="text-xs px-2 py-0.5 rounded-full w-fit"
              style={{ color: stock.color, background: stock.bg }}
            >
              {stock.label}
            </span>
          )}
        </Field>

        <Field label="Satuan">
          <select
            value={form.unit}
            onChange={(e) => set("unit", e.target.value)}
            className="form-input"
            disabled={isLoading}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* ── Deskripsi ── */}
      <Field label="Deskripsi Produk">
        <textarea
          rows={3}
          placeholder="Jelaskan kandungan, manfaat, dan cara penggunaan produk…"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="form-input resize-none"
          disabled={isLoading}
        />
      </Field>

      {/* ── Info stok rendah ── */}
      {stock?.label === "Hampir habis" && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(212,137,10,0.08)", border: "1px solid rgba(212,137,10,0.2)", color: "#a06a07" }}
        >
          <span>◈</span>
          <span>Stok di bawah 10 unit — pertimbangkan untuk segera restok.</span>
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
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300"
            style={{ left: form.is_active ? "calc(100% - 22px)" : "2px" }}
          />
        </button>
        <span className="text-sm" style={{ color: "#5a3e35" }}>
          Produk {form.is_active ? "dijual / aktif" : "disembunyikan"}
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
            "Tambah Produk"
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
      .font-mono { font-family: 'Courier New', monospace; letter-spacing: 0.05em; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .animate-spin { animation: spin 0.8s linear infinite; }
    `}</style>
  );
}