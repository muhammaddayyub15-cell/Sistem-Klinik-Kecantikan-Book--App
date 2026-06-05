import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { getProducts } from "../../api/productApi";
import { getServices } from "../../api/serviceApi";


// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) =>
    "Rp " + Number(n).toLocaleString("id-ID");

// ── Shared styles ─────────────────────────────────────────────────────────────

const ICONS = ["◈", "◉", "✦", "◇", "◎", "◆"];
const getIcon = (id) => ICONS[id % ICONS.length];

// ── Sub-components ────────────────────────────────────────────────────────────

function TabPill({ active, onClick, children, count }) {
    return (
        <button
            onClick={onClick}
            className="relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm tracking-wide transition-all duration-300"
            style={{
                background: active ? "linear-gradient(135deg, #c4865f, #9a5030)" : "transparent",
                color: active ? "#fff" : "#5a3e35",
                border: active ? "none" : "1px solid rgba(184,124,90,0.25)",
                fontWeight: active ? 500 : 400,
            }}
        >
            {children}
            {count > 0 && (
                <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                        background: active ? "rgba(255,255,255,0.25)" : "rgba(184,124,90,0.12)",
                        color: active ? "#fff" : "#8b4c34",
                    }}
                >
                    {count}
                </span>
            )}
        </button>
    );
}

function FilterPill({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className="shrink-0 px-4 py-1.5 rounded-full text-xs tracking-wide transition-all duration-200 border"
            style={{
                background: active ? "#b87c5a" : "transparent",
                color: active ? "#fff" : "#5a3e35",
                borderColor: active ? "#b87c5a" : "rgba(184,124,90,0.25)",
            }}
        >
            {children}
        </button>
    );
}

function LoadingSkeleton({ count = 8, cols = 4 }) {
    return (
        <div className={`grid sm:grid-cols-2 lg:grid-cols-${cols} gap-5`}>
            {[...Array(count)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-[rgba(184,124,90,0.06)] animate-pulse" style={{ height: 260 }} />
            ))}
        </div>
    );
}

// ── Products Tab ──────────────────────────────────────────────────────────────

function ProductsTab({ cartItems, addToCart, updateQty, setCartOpen }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(["All"]);
    const [activeCategory, setActiveCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await getProducts();
                const data = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
                setProducts(data);
                const cats = ["All", ...new Set(data.map(p => p.category?.category_name ?? p.category?.name).filter(Boolean))];

                setCategories(cats);
            } catch {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = activeCategory === "All"
        ? products
        : products.filter(p => (p.category?.category_name ?? p.category?.name) === activeCategory);


    const getQty = (id) => cartItems.find(i => i.id === id)?.qty ?? 0;

    const handleAdd = (p) => {
        addToCart({
            id: p.product_id ?? p.id,
            name: p.product_name ?? p.name,
            price: Number(p.price),
            type: "product",
        }, 1);
        setAdded(p.product_id ?? p.id);
        navigate("/patient/products");
    };

    if (loading) return <LoadingSkeleton count={8} cols={4} />;

    if (products.length === 0) return (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-5xl opacity-20 text-[#b87c5a]">◈</span>
            <p className="text-sm text-[#c0a090]">No products available.</p>
        </div>
    );

    return (
        <div>
            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-8" style={{ scrollbarWidth: "none" }}>
                {categories.map(cat => (
                    <FilterPill key={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)}>
                        {cat}
                    </FilterPill>
                ))}
            </div>

            <p className="text-xs text-[#9a6e62] mb-6">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filtered.map((p) => {
                    const id = p.product_id ?? p.id;
                    const name = p.product_name ?? p.name;
                    const price = Number(p.price);
                    const origPrice = p.original_price ?? p.originalPrice ?? null;
                    const category = p.category?.category_name ?? p.category?.name ?? "";
                    const tag = p.tag ?? null;
                    const qty = getQty(id);
                    const isAdding = added === id;

                    return (
                        <div
                            key={id}
                            className="group rounded-2xl overflow-hidden bg-white border border-[rgba(184,124,90,0.12)] transition-all duration-300 hover:-translate-y-1"
                            style={{ boxShadow: "0 2px 12px rgba(150,80,40,0.04)" }}
                        >
                            {/* Visual */}
                            <div
                                className="relative h-40 flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, #fdf6ef, #f0ddd0)" }}
                            >
                                <span className="text-5xl opacity-25 select-none text-[#b87c5a]">{getIcon(id)}</span>
                                {tag && (
                                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs text-[#8b4c34] bg-[rgba(255,255,255,0.85)]">
                                        {tag}
                                    </div>
                                )}
                                {origPrice && (
                                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium bg-[#b87c5a] text-white">
                                        Sale
                                    </div>
                                )}
                                {qty > 0 && (
                                    <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-[#2c1f1a] text-white">
                                        {qty}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-5">
                                <p className="text-xs text-[#b87c5a] mb-1">{category}</p>
                                <h3 className="text-sm font-medium text-[#2c1f1a] leading-snug mb-3">{name}</h3>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-semibold text-[#2c1f1a]">{fmt(price)}</span>
                                        {origPrice && (
                                            <span className="text-xs ml-1.5 line-through text-[#b0907e]">{fmt(origPrice)}</span>
                                        )}
                                    </div>

                                    {qty === 0 ? (
                                        <button
                                            onClick={() => handleAdd(p)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all hover:opacity-80 active:scale-95"
                                            style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)", color: "#fff" }}
                                        >
                                            {isAdding ? "✓" : "+"}
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => updateQty(id, qty - 1)}
                                                className="w-7 h-7 rounded-full flex items-center justify-center text-sm border transition-all"
                                                style={{ borderColor: "rgba(184,124,90,0.3)", color: "#b87c5a" }}
                                            >
                                                −
                                            </button>
                                            <span className="text-sm font-medium w-4 text-center text-[#2c1f1a]">{qty}</span>
                                            <button
                                                onClick={() => handleAdd(p)}
                                                className="w-7 h-7 rounded-full flex items-center justify-center text-sm hover:opacity-80 active:scale-95"
                                                style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)", color: "#fff" }}
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Services Tab ──────────────────────────────────────────────────────────────

function ServicesTab({ isAuthenticated }) {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState(["All"]);
    const [activeCategory, setActiveCategory] = useState("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await getServices();
                const data = res.data?.data ?? res.data ?? [];
                setServices(data);
                const cats = ["All", ...new Set(data.map(s => s.category?.category_name).filter(Boolean))];
                setCategories(cats);
            } catch {
                setServices([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = activeCategory === "All"
        ? services
        : services.filter(s => s.category?.category_name === activeCategory);

    const handleBook = (service) => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        navigate(`/patient/booking?service_id=${service.service_id}`);
    };

    if (loading) return <LoadingSkeleton count={6} cols={3} />;

    if (services.length === 0) return (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-5xl opacity-20 text-[#b87c5a]">◇</span>
            <p className="text-sm text-[#c0a090]">No services available.</p>
        </div>
    );

    return (
        <div>
            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-8" style={{ scrollbarWidth: "none" }}>
                {categories.map(cat => (
                    <FilterPill key={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)}>
                        {cat}
                    </FilterPill>
                ))}
            </div>

            <p className="text-xs text-[#9a6e62] mb-6">
                {filtered.length} service{filtered.length !== 1 ? "s" : ""}
                {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((s) => {
                    const id = s.service_id;
                    const name = s.service_name;
                    const price = Number(s.base_price ?? 0);
                    const desc = s.description ?? "";
                    const category = s.category?.category_name ?? "";

                    return (
                        <div
                            key={id}
                            className="group rounded-2xl bg-white border border-[rgba(184,124,90,0.12)] p-7 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                            style={{ boxShadow: "0 2px 12px rgba(150,80,40,0.04)" }}
                        >
                            {/* Icon + category */}
                            <div className="flex items-start justify-between mb-5">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                                    style={{ background: "linear-gradient(135deg, #f0ddd0, #e8c9b0)", color: "#b87c5a" }}
                                >
                                    {getIcon(id)}
                                </div>
                                {category && (
                                    <span
                                        className="text-xs px-2.5 py-0.5 rounded-full"
                                        style={{ background: "rgba(184,124,90,0.1)", color: "#8b4c34" }}
                                    >
                                        {category}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <h3
                                className="text-base font-medium text-[#2c1f1a] mb-2"
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                                {name}
                            </h3>
                            {desc && (
                                <p className="text-xs text-[#7a5a52] leading-relaxed mb-5 flex-1">{desc}</p>
                            )}

                            {/* Price + CTA */}
                            <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: "1px solid rgba(184,124,90,0.08)" }}>
                                <div>
                                    <p className="text-xs text-[#9a6e62] mb-0.5">Starting from</p>
                                    <p className="text-base font-semibold text-[#b87c5a]">{fmt(price)}</p>
                                </div>
                                <button
                                    onClick={() => handleBook(s)}
                                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white text-xs tracking-wide transition-all duration-200 hover:opacity-90 active:scale-95"
                                    style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)" }}
                                >
                                    Book Now →
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Cart Drawer ───────────────────────────────────────────────────────────────

function CartDrawer({ open, onClose, cartItems, updateQty, clearCart, totalPrice, isAuthenticated }) {
    const navigate = useNavigate();

    const handleCheckout = () => {
        onClose();
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        navigate("/patient/cart");
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-[rgba(44,31,26,0.4)] backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-[#faf8f5] rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between px-7 py-5 border-b border-[rgba(184,124,90,0.12)]">
                        <div>
                            <p className="text-[10px] tracking-[0.12em] uppercase text-[#b87c5a] mb-0.5">Your</p>
                            <h2 className="text-2xl font-normal text-[#2c1f1a]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                                Cart
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition text-[#5a3e35]"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto px-7 py-5">
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <span className="text-4xl opacity-20 text-[#b87c5a]">◇</span>
                                <p className="text-sm text-[#c0a090]">Your cart is empty</p>
                                <button
                                    onClick={onClose}
                                    className="text-sm px-5 py-2 rounded-full hover:opacity-80 transition"
                                    style={{ background: "rgba(184,124,90,0.1)", color: "#8b4c34" }}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[rgba(184,124,90,0.1)]"
                                    >
                                        <div
                                            className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
                                            style={{ background: "linear-gradient(135deg, #fdf6ef, #f0ddd0)", color: "#b87c5a" }}
                                        >
                                            {getIcon(item.id)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#2c1f1a] truncate">{item.name}</p>
                                            <p className="text-xs mt-0.5 text-[#b87c5a]">{fmt(item.price)}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                onClick={() => updateQty(item.id, item.qty - 1)}
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs border border-[rgba(184,124,90,0.3)] text-[#b87c5a]"
                                            >
                                                −
                                            </button>
                                            <span className="text-sm w-4 text-center text-[#2c1f1a]">{item.qty}</span>
                                            <button
                                                onClick={() => updateQty(item.id, item.qty + 1)}
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs hover:opacity-80"
                                                style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)", color: "#fff" }}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                        <div className="px-7 py-6 border-t border-[rgba(184,124,90,0.12)]">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-[#9a6e62]">Subtotal</span>
                                <span className="text-sm font-semibold text-[#2c1f1a]">{fmt(totalPrice)}</span>
                            </div>
                            <p className="text-xs text-[#b0907e] mb-5">Shipping calculated at checkout</p>
                            <button
                                onClick={handleCheckout}
                                className="w-full py-3.5 rounded-full text-white text-sm tracking-wide hover:opacity-90 transition"
                                style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)" }}
                            >
                                Checkout — {fmt(totalPrice)}
                            </button>
                            <button
                                onClick={clearCart}
                                className="w-full mt-2 py-2 text-xs text-[#c0a090] hover:opacity-70 transition"
                            >
                                Clear cart
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function InProductsPage() {
    const [activeTab, setActiveTab] = useState("products"); // 'products' | 'services'
    const [cartOpen, setCartOpen] = useState(false);

    const { cartItems, addToCart, updateQty, clearCart, totalItems, totalPrice } = useCart();
    const { isAuthenticated } = useAuth();

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
        ::-webkit-scrollbar { display: none; }
      `}</style>

            <div className="min-h-screen bg-[#faf8f5] text-[#2c1f1a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

                {/* ── HEADER ── */}
                <section
                    className="pt-24 pb-14 px-6 text-center"
                    style={{ background: "linear-gradient(135deg, #fdf6ef 0%, #f7ede2 100%)" }}
                >
                    <div className="max-w-2xl mx-auto">
                        <p className="text-[10px] tracking-[0.14em] uppercase text-[#b87c5a] mb-4">✦ Aura Clinic</p>
                        <h1
                            className="text-5xl lg:text-6xl font-normal text-[#2c1f1a] mb-4"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            {activeTab === "products"
                                ? <>Our <em className="text-[#b87c5a]">Products</em></>
                                : <>Our <em className="text-[#b87c5a]">Services</em></>
                            }
                        </h1>
                        <p className="text-sm leading-relaxed text-[#6b4c40] max-w-md mx-auto">
                            {activeTab === "products"
                                ? "Clinic-grade skincare formulated by dermatologists for real, visible results."
                                : "Expert aesthetic treatments tailored to your unique skin needs."
                            }
                        </p>

                        {/* Back link */}
                        <div className="mt-6">
                            <Link
                                to="/patient/dashboard"
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs text-[#5a3e35] border border-[rgba(90,62,53,0.2)] transition hover:opacity-80"
                            >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── STICKY TAB BAR ── */}
                <div
                    className="sticky top-0 z-30 py-4 px-6 backdrop-blur-md border-b border-[rgba(184,124,90,0.1)]"
                    style={{ background: "rgba(250,248,245,0.95)" }}
                >
                    <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">

                        {/* Tabs */}
                        <div className="flex gap-2">
                            <TabPill active={activeTab === "products"} onClick={() => setActiveTab("products")}>
                                ◈ Products
                            </TabPill>
                            <TabPill active={activeTab === "services"} onClick={() => setActiveTab("services")}>
                                ◇ Services
                            </TabPill>
                        </div>

                        {/* Cart button */}
                        <button
                            onClick={() => setCartOpen(true)}
                            className="relative flex items-center gap-2 px-5 py-2 rounded-full text-sm transition-all duration-200 hover:opacity-90"
                            style={{
                                background: totalItems > 0 ? "linear-gradient(135deg, #c4865f, #9a5030)" : "rgba(184,124,90,0.1)",
                                color: totalItems > 0 ? "#fff" : "#8b4c34",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            Cart
                            {totalItems > 0 && (
                                <span
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
                                    style={{ background: "#2c1f1a", color: "#fff" }}
                                >
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── CONTENT ── */}
                <section className="max-w-6xl mx-auto px-6 py-10">
                    {activeTab === "products" ? (
                        <ProductsTab
                            cartItems={cartItems}
                            addToCart={addToCart}
                            updateQty={updateQty}
                            setCartOpen={setCartOpen}
                        />
                    ) : (
                        <ServicesTab isAuthenticated={isAuthenticated} />
                    )}
                </section>

                {/* ── CTA STRIP ── */}
                {activeTab === "services" && (
                    <section
                        className="py-16 px-6 text-center"
                        style={{ background: "linear-gradient(135deg, #f0ddd0, #e8c9b0)" }}
                    >
                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#8b4c34] mb-3">
                            Not sure what to choose?
                        </p>
                        <h2
                            className="text-3xl font-normal text-[#2c1208] mb-5"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            Get a <em>personalised skin plan</em>
                        </h2>
                        <Link
                            to="/patient/cart"
                            className="inline-block px-8 py-3 rounded-full text-white text-sm tracking-wide transition hover:opacity-90"
                            style={{ background: "linear-gradient(135deg, #c4865f, #8b4c34)" }}
                        >
                            Book Free Consultation
                        </Link>
                    </section>
                )}
            </div>

            {/* ── CART DRAWER ── */}
            <CartDrawer
                open={cartOpen}
                onClose={() => setCartOpen(false)}
                cartItems={cartItems}
                updateQty={updateQty}
                clearCart={clearCart}
                totalPrice={totalPrice}
                isAuthenticated={isAuthenticated}
            />
        </>
    );
}