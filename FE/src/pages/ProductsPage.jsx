import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "Serum", "Moisturiser", "Sunscreen", "Treatment", "Cleanser"];

const PRODUCTS = [
  {
    id: 1,
    name: "Brightening Vitamin C Serum",
    category: "Serum",
    price: 385000,
    originalPrice: 450000,
    rating: 4.9,
    reviews: 128,
    tag: "Best Seller",
    icon: "◈",
    desc: "High-potency 20% Vitamin C with niacinamide for visible brightening in 2 weeks.",
    color: "#f7ede2",
  },
  {
    id: 2,
    name: "Barrier Repair Moisturiser",
    category: "Moisturiser",
    price: 295000,
    originalPrice: null,
    rating: 4.8,
    reviews: 94,
    tag: "Doctor's Pick",
    icon: "◉",
    desc: "Ceramide-rich formula that restores skin barrier and locks in moisture all day.",
    color: "#fdf6ef",
  },
  {
    id: 3,
    name: "Invisible SPF 50+ Sunscreen",
    category: "Sunscreen",
    price: 245000,
    originalPrice: 280000,
    rating: 4.9,
    reviews: 213,
    tag: "Most Popular",
    icon: "✦",
    desc: "Lightweight, non-greasy broad-spectrum UVA/UVB protection. Zero white cast.",
    color: "#f7ede2",
  },
  {
    id: 4,
    name: "Retinol Night Treatment",
    category: "Treatment",
    price: 520000,
    originalPrice: null,
    rating: 4.7,
    reviews: 67,
    tag: "Premium",
    icon: "◇",
    desc: "0.3% encapsulated retinol with bakuchiol for visible anti-aging results.",
    color: "#fdf6ef",
  },
  {
    id: 5,
    name: "Gentle Foam Cleanser",
    category: "Cleanser",
    price: 175000,
    originalPrice: null,
    rating: 4.8,
    reviews: 156,
    tag: "Daily Essential",
    icon: "◈",
    desc: "pH-balanced foaming cleanser that removes impurities without stripping skin.",
    color: "#f7ede2",
  },
  {
    id: 6,
    name: "Hyaluronic Acid Booster",
    category: "Serum",
    price: 310000,
    originalPrice: 360000,
    rating: 4.9,
    reviews: 189,
    tag: "Hydration Hero",
    icon: "◉",
    desc: "Multi-weight HA complex with 3 molecular sizes for deep and surface hydration.",
    color: "#fdf6ef",
  },
  {
    id: 7,
    name: "AHA BHA Exfoliating Toner",
    category: "Treatment",
    price: 265000,
    originalPrice: null,
    rating: 4.6,
    reviews: 82,
    tag: "Clinic Formula",
    icon: "✦",
    desc: "10% AHA + 2% BHA blend for smooth texture, unclogged pores and even tone.",
    color: "#f7ede2",
  },
  {
    id: 8,
    name: "Calming Centella Cream",
    category: "Moisturiser",
    price: 230000,
    originalPrice: 260000,
    rating: 4.8,
    reviews: 110,
    tag: "Sensitive Skin",
    icon: "◇",
    desc: "Cica-powered formula that soothes redness and strengthens compromised skin.",
    color: "#fdf6ef",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

// ── Shared styles (mengikuti pola inputCls / labelCls di RegisterPage) ────────

const filterBtnCls = (active) =>
  `flex-shrink-0 px-5 py-2 rounded-full text-xs tracking-wide transition-all duration-200 cursor-pointer border ${active
    ? "bg-[#b87c5a] text-white border-[#b87c5a]"
    : "bg-transparent text-[#5a3e35] border-[rgba(184,124,90,0.25)] hover:border-[rgba(184,124,90,0.4)]"
  }`;

const addBtnCls = (inCart) =>
  `px-3 py-1.5 rounded-full text-xs transition-all duration-200 active:scale-95 border border-[rgba(184,124,90,0.2)] cursor-pointer ${inCart
    ? "bg-[#b87c5a] text-white"
    : "bg-[rgba(184,124,90,0.1)] text-[#8b4c34] hover:bg-[rgba(184,124,90,0.2)]"
  }`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [added, setAdded] = useState(null);

  const { cartItems, addToCart, totalItems } = useCart();
  const { isAuthenticated } = useAuth();

  const filtered =
    activeCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  // CartContext.addToCart() sudah handle qty increment secara internal,
  // jadi tidak perlu cek manual apakah produk sudah ada di cart.
  const handleAdd = (product) => {
    addToCart({ id: product.id, name: product.name, price: product.price }, 1);
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1200);
  };

  // Ambil qty produk di cart untuk label tombol dan badge visual.
  const getQtyInCart = (productId) =>
    cartItems.find((item) => item.id === productId)?.qty ?? 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
      `}</style>

      <div
        className="min-h-screen font-sans bg-[#faf8f5] text-[#2c1f1a]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >

        {/* ── HEADER ── */}
        <section
          className="pt-24 pb-16 px-6 text-center"
          style={{ background: "linear-gradient(135deg, #fdf6ef 0%, #f7ede2 100%)" }}
        >
          <div className="max-w-2xl mx-auto">
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#b87c5a] mb-4">
              ✦ Clinic-Grade Skincare
            </p>
            <h1
              className="text-5xl lg:text-6xl font-normal text-[#2c1f1a] mb-5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Our Products
            </h1>
            <p className="text-sm leading-relaxed max-w-md mx-auto text-[#6b4c40]">
              Formulated with dermatologist expertise. Every product is tested and
              recommended by our clinic doctors for real, visible results.
            </p>
            <div className="mt-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs tracking-wide text-[#5a3e35] border border-[rgba(90,62,53,0.25)] transition-all duration-200 hover:opacity-80"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </section>

        {/* ── CATEGORY FILTER ── */}
        <div
          className="sticky top-0 z-30 py-4 px-6 backdrop-blur-md bg-[rgba(250,248,245,0.95)] border-b border-[rgba(184,124,90,0.1)]"
        >
          <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={filterBtnCls(activeCategory === cat)}
              >
                {cat}
              </button>
            ))}

            {/* Cart indicator — auth-aware:
                - Login + ada item  → tampil jumlah item
                - Guest + ada item  → tampil link ke /login                */}
            {totalItems > 0 && (
              isAuthenticated ? (
                <div className="flex-shrink-0 ml-auto flex items-center gap-2 px-4 py-2 rounded-full text-xs bg-[rgba(184,124,90,0.1)] text-[#8b4c34] border border-[rgba(184,124,90,0.2)]">
                  <span>◉</span>
                  {totalItems} item{totalItems > 1 ? "s" : ""} in cart
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex-shrink-0 ml-auto flex items-center gap-2 px-4 py-2 rounded-full text-xs bg-[rgba(184,124,90,0.1)] text-[#8b4c34] border border-[rgba(184,124,90,0.2)] transition-all duration-200 hover:opacity-80"
                >
                  <span>◉</span>
                  {totalItems} item{totalItems > 1 ? "s" : ""} — Login to view cart
                </Link>
              )
            )}
          </div>
        </div>

        {/* ── PRODUCT GRID ── */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <p className="text-xs text-[#9a6e62] mb-8">
            Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((p) => {
              const qtyInCart = getQtyInCart(p.id);
              const isAdding = added === p.id;

              return (
                <div
                  key={p.id}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-[rgba(184,124,90,0.12)] transition-all duration-300 hover:-translate-y-1"
                  style={{ boxShadow: "0 2px 12px rgba(150,80,40,0.04)" }}
                >
                  {/* Visual area */}
                  <div className="relative h-44 flex items-center justify-center" style={{ background: p.color }}>
                    <span className="text-6xl opacity-30 select-none text-[#b87c5a]">{p.icon}</span>

                    {/* Tag badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs text-[#8b4c34] bg-[rgba(255,255,255,0.8)] backdrop-blur-sm">
                      {p.tag}
                    </div>

                    {/* Sale badge */}
                    {p.originalPrice && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium bg-[#b87c5a] text-white">
                        Sale
                      </div>
                    )}

                    {/* Qty badge — muncul saat produk sudah di cart,
                        menampilkan jumlah qty agar user tahu tanpa memblokir tombol */}
                    {qtyInCart > 0 && (
                      <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-[#b87c5a] text-white">
                        {qtyInCart}
                      </div>
                    )}
                  </div>

                  {/* Info area */}
                  <div className="p-5">
                    <p className="text-xs text-[#b87c5a] mb-1">{p.category}</p>
                    <h3 className="text-sm font-medium text-[#2c1f1a] leading-snug mb-2">{p.name}</h3>
                    <p className="text-xs text-[#7a5a52] leading-relaxed mb-4">{p.desc}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-4">
                      <span className="text-[11px] text-[#b87c5a]">{"★".repeat(5)}</span>
                      <span className="text-xs text-[#9a6e62]">
                        {p.rating} ({p.reviews})
                      </span>
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-base font-semibold text-[#2c1f1a]">{fmt(p.price)}</span>
                        {p.originalPrice && (
                          <span className="text-xs ml-1.5 line-through text-[#b0907e]">
                            {fmt(p.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Tombol selalu aktif (tidak ada disabled).
                          Label:
                            - isAdding  → "Added ✓"   (feedback 1.2 detik)
                            - qtyInCart → "+ 1 more"  (sudah di cart, bisa tambah lagi)
                            - default   → "+ Cart"    (belum di cart)              */}
                      <button onClick={() => handleAdd(p)} className={addBtnCls(qtyInCart > 0)}>
                        {isAdding ? "Added ✓" : qtyInCart > 0 ? "+ 1 more" : "+ Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA STRIP ── */}
        <section
          className="py-16 px-6 text-center"
          style={{ background: "linear-gradient(135deg, #f0ddd0, #e8c9b0)" }}
        >
          <p className="text-[10px] tracking-[0.12em] uppercase text-[#8b4c34] mb-3">
            Not sure what to use?
          </p>
          <h2
            className="text-3xl font-normal text-[#2c1208] mb-5"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Get a personalised <em>product plan</em>
          </h2>
          <Link
            to="/login"
            className="inline-block px-8 py-3 rounded-full text-white text-sm tracking-wide transition-all duration-300 hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #c4865f, #8b4c34)" }}
          >
            Book Consultation
          </Link>
        </section>

      </div>
    </>
  );
}

