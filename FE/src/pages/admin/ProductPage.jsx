import { useState, useEffect } from "react";

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_CATEGORIES = [
  { id: 1, name: "Skincare" },
  { id: 2, name: "Serum & Ampoule" },
  { id: 3, name: "Sunscreen" },
  { id: 4, name: "Treatment Kit" },
];

const MOCK_PRODUCTS = [
  { id: 1, name: "Brightening Facial Wash", category_id: 1, category: "Skincare", price: 185000, stock_qty: 42, description: "Gentle foaming cleanser with niacinamide and vitamin C." },
  { id: 2, name: "Hydra-Glow Serum", category_id: 2, category: "Serum & Ampoule", price: 320000, stock_qty: 18, description: "Hyaluronic acid + peptide serum for intense 24-hour hydration." },
  { id: 3, name: "UV Shield SPF 50+", category_id: 3, category: "Sunscreen", price: 145000, stock_qty: 7, description: "Lightweight daily sunscreen suitable for all skin types." },
  { id: 4, name: "Post-Laser Recovery Kit", category_id: 4, category: "Treatment Kit", price: 590000, stock_qty: 5, description: "Complete aftercare set for post-laser skin treatment." },
  { id: 5, name: "Barrier Repair Cream", category_id: 1, category: "Skincare", price: 260000, stock_qty: 31, description: "Ceramide-rich cream that restores the skin's protective barrier." },
  { id: 6, name: "Vitamin C Ampoule", category_id: 2, category: "Serum & Ampoule", price: 410000, stock_qty: 0, description: "Concentrated 20% vitamin C for visible brightening results." },
];

const EMPTY_FORM = { name: "", category_id: "", price: "", stock_qty: "", description: "" };

// ── Helpers ────────────────────────────────────────────────────────────────
const formatPrice = (n) => "Rp " + Number(n).toLocaleString("id-ID");

const stockStatus = (qty) => {
  if (qty === 0) return { label: "Out of Stock", color: "#c0392b", bg: "rgba(192,57,43,0.1)" };
  if (qty <= 10) return { label: "Low Stock", color: "#d97706", bg: "rgba(217,119,6,0.1)" };
  return { label: "In Stock", color: "#16a34a", bg: "rgba(22,163,74,0.1)" };
};

// ── Sub-components ─────────────────────────────────────────────────────────
function StatusBadge({ qty }) {
  const s = stockStatus(qty);
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ color: s.color, background: s.bg }}
    >
      {s.label}
    </span>
  );
}

function ProductModal({ open, onClose, onSubmit, defaultValues, isLoading }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setForm(defaultValues ? { ...defaultValues } : EMPTY_FORM);
  }, [defaultValues, open]);

  if (!open) return null;

  const isEdit = !!defaultValues?.id;

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(44,31,26,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{ background: "#faf8f5", boxShadow: "0 30px 80px rgba(150,80,40,0.2)" }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6" style={{ borderBottom: "1px solid rgba(184,124,90,0.12)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>
                {isEdit ? "Edit Product" : "New Product"}
              </p>
              <h3
                className="text-2xl font-normal"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
              >
                {isEdit ? "Update Details" : "Add to Catalogue"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-stone-100"
              style={{ color: "#9a6e62" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="block text-xs tracking-wide uppercase mb-1.5" style={{ color: "#6b4c40" }}>
              Product Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Brightening Facial Wash"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "#fff",
                border: "1px solid rgba(184,124,90,0.2)",
                color: "#2c1f1a",
              }}
            />
          </div>

          {/* Category + Price row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wide uppercase mb-1.5" style={{ color: "#6b4c40" }}>
                Category
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(184,124,90,0.2)",
                  color: form.category_id ? "#2c1f1a" : "#9a8070",
                }}
              >
                <option value="">Select…</option>
                {MOCK_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-wide uppercase mb-1.5" style={{ color: "#6b4c40" }}>
                Price (Rp)
              </label>
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                required
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(184,124,90,0.2)",
                  color: "#2c1f1a",
                }}
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs tracking-wide uppercase mb-1.5" style={{ color: "#6b4c40" }}>
              Stock Qty
            </label>
            <input
              name="stock_qty"
              type="number"
              min="0"
              value={form.stock_qty}
              onChange={handleChange}
              required
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "#fff",
                border: "1px solid rgba(184,124,90,0.2)",
                color: "#2c1f1a",
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs tracking-wide uppercase mb-1.5" style={{ color: "#6b4c40" }}>
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief product description…"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{
                background: "#fff",
                border: "1px solid rgba(184,124,90,0.2)",
                color: "#2c1f1a",
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full text-sm transition-all hover:bg-stone-100"
              style={{ color: "#5a3e35", border: "1px solid rgba(90,62,53,0.2)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-full text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #c4865f, #a0613e)" }}
            >
              {isLoading ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ open, product, onClose, onConfirm, isLoading }) {
  if (!open || !product) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(44,31,26,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-8 text-center"
        style={{ background: "#faf8f5", boxShadow: "0 30px 80px rgba(150,80,40,0.2)" }}
      >
        <div
          className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center text-2xl"
          style={{ background: "rgba(192,57,43,0.08)", color: "#c0392b" }}
        >
          ◈
        </div>
        <h3
          className="text-xl font-normal mb-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
        >
          Remove Product?
        </h3>
        <p className="text-sm mb-6" style={{ color: "#7a5a52" }}>
          <span className="font-medium" style={{ color: "#2c1f1a" }}>{product.name}</span> will be permanently removed from the catalogue.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm transition-all hover:bg-stone-100"
            style={{ color: "#5a3e35", border: "1px solid rgba(90,62,53,0.2)" }}
          >
            Keep It
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-full text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #c0392b, #922b21)" }}
          >
            {isLoading ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ProductPage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ── Derived state ──────────────────────────────────────────────────────
  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => filterCategory === "all" || String(p.category_id) === filterCategory)
    .filter((p) => {
      if (filterStock === "in") return p.stock_qty > 10;
      if (filterStock === "low") return p.stock_qty > 0 && p.stock_qty <= 10;
      if (filterStock === "out") return p.stock_qty === 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "stock") return a.stock_qty - b.stock_qty;
      return 0;
    });

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.stock_qty > 0).length,
    lowStock: products.filter((p) => p.stock_qty > 0 && p.stock_qty <= 10).length,
    outOfStock: products.filter((p) => p.stock_qty === 0).length,
  };

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleOpenAdd = () => { setEditTarget(null); setModalOpen(true); };
  const handleOpenEdit = (p) => { setEditTarget(p); setModalOpen(true); };

  const handleSubmit = (form) => {
    setIsLoading(true);
    setTimeout(() => {
      const cat = MOCK_CATEGORIES.find((c) => String(c.id) === String(form.category_id));
      if (editTarget) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editTarget.id
              ? { ...p, ...form, category: cat?.name || p.category, price: Number(form.price), stock_qty: Number(form.stock_qty) }
              : p
          )
        );
      } else {
        setProducts((prev) => [
          ...prev,
          {
            id: Date.now(),
            ...form,
            category: cat?.name || "",
            price: Number(form.price),
            stock_qty: Number(form.stock_qty),
          },
        ]);
      }
      setIsLoading(false);
      setModalOpen(false);
    }, 600);
  };

  const handleDelete = () => {
    setIsLoading(true);
    setTimeout(() => {
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setIsLoading(false);
      setDeleteTarget(null);
    }, 500);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen font-sans" style={{ background: "#faf8f5", color: "#2c1f1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
        input:focus, select:focus, textarea:focus {
          border-color: rgba(184,124,90,0.5) !important;
          box-shadow: 0 0 0 3px rgba(184,124,90,0.08);
        }
        tr:hover td { background: rgba(253,246,239,0.7); }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#b87c5a" }}>
              Admin · Catalogue
            </p>
            <h1
              className="text-4xl font-normal"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
            >
              Products
            </h1>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm tracking-wide transition-all hover:opacity-90 hover:-translate-y-0.5 duration-200"
            style={{ background: "linear-gradient(135deg, #c4865f, #a0613e)" }}
          >
            <span style={{ fontSize: 16 }}>✦</span>
            Add Product
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: stats.total, icon: "◈", accent: "#b87c5a" },
            { label: "In Stock", value: stats.inStock, icon: "◉", accent: "#16a34a" },
            { label: "Low Stock", value: stats.lowStock, icon: "◇", accent: "#d97706" },
            { label: "Out of Stock", value: stats.outOfStock, icon: "✦", accent: "#c0392b" },
          ].map((s) => (
            <div
              key={s.label}
              className="p-5 rounded-2xl"
              style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.1)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl" style={{ color: s.accent }}>{s.icon}</span>
              </div>
              <div
                className="text-3xl font-normal mb-0.5"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
              >
                {s.value}
              </div>
              <div className="text-xs" style={{ color: "#9a6e62" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Filters & Search ── */}
        <div
          className="p-5 rounded-2xl mb-6 flex flex-col md:flex-row gap-4"
          style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.1)" }}
        >
          {/* Search */}
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#b87c5a" }}>◉</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "#faf8f5",
                border: "1px solid rgba(184,124,90,0.15)",
                color: "#2c1f1a",
              }}
            />
          </div>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "#faf8f5",
              border: "1px solid rgba(184,124,90,0.15)",
              color: "#5a3e35",
              minWidth: 160,
            }}
          >
            <option value="all">All Categories</option>
            {MOCK_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Stock filter */}
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "#faf8f5",
              border: "1px solid rgba(184,124,90,0.15)",
              color: "#5a3e35",
              minWidth: 150,
            }}
          >
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "#faf8f5",
              border: "1px solid rgba(184,124,90,0.15)",
              color: "#5a3e35",
              minWidth: 160,
            }}
          >
            <option value="name">Sort: Name</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="stock">Stock: Ascending</option>
          </select>
        </div>

        {/* ── Table ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.1)" }}
        >
          {/* Result count */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(184,124,90,0.08)" }}
          >
            <p className="text-xs" style={{ color: "#9a6e62" }}>
              Showing <span style={{ color: "#2c1f1a", fontWeight: 500 }}>{filtered.length}</span> of {products.length} products
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(184,124,90,0.08)" }}>
                  {["Product", "Category", "Price", "Stock", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs tracking-widest uppercase font-normal"
                      style={{ color: "#9a6e62" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="text-3xl mb-3 opacity-20" style={{ color: "#b87c5a" }}>◈</div>
                      <p className="text-sm" style={{ color: "#9a6e62" }}>No products match your filters.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="transition-colors duration-100"
                      style={{ borderBottom: "1px solid rgba(184,124,90,0.06)" }}
                    >
                      {/* Product name + desc */}
                      <td className="px-6 py-4">
                        <div className="font-medium" style={{ color: "#2c1f1a" }}>{p.name}</div>
                        {p.description && (
                          <div
                            className="text-xs mt-0.5 max-w-xs truncate"
                            style={{ color: "#9a6e62" }}
                            title={p.description}
                          >
                            {p.description}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs"
                          style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34" }}
                        >
                          {p.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <span
                          className="font-medium"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
                        >
                          {formatPrice(p.price)}
                        </span>
                      </td>

                      {/* Stock qty */}
                      <td className="px-6 py-4" style={{ color: p.stock_qty === 0 ? "#c0392b" : "#2c1f1a" }}>
                        {p.stock_qty}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge qty={p.stock_qty} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
                            style={{ background: "rgba(184,124,90,0.1)", color: "#8b4c34" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
                            style={{ background: "rgba(192,57,43,0.08)", color: "#c0392b" }}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Modals ── */}
      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        defaultValues={editTarget}
        isLoading={isLoading}
      />
      <DeleteConfirmModal
        open={!!deleteTarget}
        product={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
}