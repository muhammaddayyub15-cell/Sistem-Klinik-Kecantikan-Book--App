import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";

const fmt = (n) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(n);

function EmptyCart() {
    return (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
                style={{ background: "rgba(184,124,90,0.08)", color: "#c4a882" }}
            >
                ◇
            </div>
            <div className="text-center">
                <p
                    className="text-2xl font-normal text-[#2c1f1a] mb-2"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                    Your cart is <em className="italic text-[#b87c5a]">empty</em>
                </p>
                <p className="text-sm text-[#9a6e62]">Add some clinic-grade products to get started.</p>
            </div>
            <Link
                to="/patient/products"
                className="px-8 py-3 rounded-full text-white text-sm tracking-wide transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)" }}
            >
                Browse Products →
            </Link>
        </div>
    );
}

function QtyControl({ qty, onDecrement, onIncrement }) {
    return (
        <div
            className="flex items-center rounded-full overflow-hidden"
            style={{ border: "1px solid rgba(184,124,90,0.2)" }}
        >
            <button
                onClick={onDecrement}
                className="w-8 h-8 flex items-center justify-center text-[#8b4c34] transition hover:bg-[rgba(184,124,90,0.1)] text-base"
                aria-label="Kurang qty"
            >
                −
            </button>
            <span className="w-8 text-center text-sm font-medium text-[#2c1f1a]">{qty}</span>
            <button
                onClick={onIncrement}
                className="w-8 h-8 flex items-center justify-center text-[#8b4c34] transition hover:bg-[rgba(184,124,90,0.1)] text-base"
                aria-label="Tambah qty"
            >
                +
            </button>
        </div>
    );
}

export default function CartPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    console.log("user keys:", Object.keys(user)); // perlu hapus keperluan testing
    console.log("user full:", JSON.stringify(user));  // perlu hapus keperluan testing
    const {
        cartItems,
        updateQty,
        removeFromCart,
        totalPrice,
        totalItems,
        isCheckingOut,
        checkoutError,
        checkout,
        clearCheckoutError,
    } = useCart();

    const [checkoutDone, setCheckoutDone] = useState(false);

    const handleCheckout = async () => {
        clearCheckoutError?.();
        const result = await checkout();
        if (result) {
            setCheckoutDone(true);
            setTimeout(() => navigate("/patient/orders"), 1500);
        }
    };

    const shipping = totalPrice >= 500000 ? 0 : 25000;
    const grandTotal = totalPrice + shipping;

    if (checkoutDone) {
        return (
            <>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');`}</style>
                <div
                    className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#faf8f5]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl text-white"
                        style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)" }}
                    >
                        ✓
                    </div>
                    <p
                        className="text-2xl font-normal text-[#2c1f1a]"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                        Order <em className="italic text-[#b87c5a]">placed!</em>
                    </p>
                    <p className="text-sm text-[#9a6e62]">Redirecting to your orders…</p>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');`}</style>

            <div
                className="min-h-screen bg-[#faf8f5] text-[#2c1f1a]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >

                {/* ── Header ── */}
                <section
                    className="pt-20 pb-12 px-6 text-center"
                    style={{ background: "linear-gradient(135deg, #fdf6ef 0%, #f7ede2 100%)" }}
                >
                    <div className="max-w-2xl mx-auto">
                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#b87c5a] mb-3">
                            ✦ Your Selection
                        </p>
                        <h1
                            className="text-5xl font-normal text-[#2c1f1a] mb-4"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            My <em className="italic text-[#b87c5a]">Cart</em>
                        </h1>
                        {totalItems > 0 && (
                            <p className="text-sm text-[#6b4c40]">
                                {totalItems} item{totalItems !== 1 ? "s" : ""} ready for checkout
                            </p>
                        )}
                        <div className="mt-6">
                            <Link
                                to="/patient/products"
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs tracking-wide text-[#5a3e35] border border-[rgba(90,62,53,0.25)] transition hover:opacity-70"
                            >
                                ← Continue Shopping
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Body ── */}
                {cartItems.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-8">

                        {/* ── Cart Items ── */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            <p className="text-xs uppercase tracking-[0.1em] text-[#b87c5a] mb-2">
                                Items ({totalItems})
                            </p>

                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-2xl bg-white flex items-center gap-5 px-6 py-5"
                                    style={{
                                        border: "1px solid rgba(184,124,90,0.12)",
                                        boxShadow: "0 2px 12px rgba(150,80,40,0.04)",
                                    }}
                                >
                                    {/* Icon placeholder */}
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                                        style={{ background: "linear-gradient(135deg, #fdf6ef, #f0ddd0)", color: "#b87c5a" }}
                                    >
                                        ◈
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#2c1f1a] truncate">{item.name}</p>
                                        <p className="text-xs text-[#9a6e62] mt-0.5">{fmt(item.price)} / item</p>
                                    </div>

                                    {/* Qty control */}
                                    <QtyControl
                                        qty={item.qty}
                                        onDecrement={() => updateQty(item.id, item.qty - 1)}
                                        onIncrement={() => updateQty(item.id, item.qty + 1)}
                                    />

                                    {/* Subtotal */}
                                    <p className="text-sm font-medium text-[#2c1f1a] w-28 text-right shrink-0">
                                        {fmt(item.price * item.qty)}
                                    </p>

                                    {/* Remove */}
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-[#c0a090] hover:text-[#9a3030] transition text-lg shrink-0 ml-1"
                                        aria-label={`Hapus ${item.name}`}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}

                            {/* Free shipping notice */}
                            {shipping > 0 && (
                                <div
                                    className="rounded-xl px-5 py-3 text-xs text-[#7a5a52]"
                                    style={{ background: "rgba(184,124,90,0.06)", border: "1px dashed rgba(184,124,90,0.2)" }}
                                >
                                    Add <span className="font-medium text-[#8b4c34]">{fmt(500000 - totalPrice)}</span> more for free shipping ✦
                                </div>
                            )}
                            {shipping === 0 && (
                                <div
                                    className="rounded-xl px-5 py-3 text-xs text-[#3a7a3a]"
                                    style={{ background: "rgba(134,180,134,0.08)", border: "1px dashed rgba(134,180,134,0.3)" }}
                                >
                                    ✓ Free shipping applied on your order
                                </div>
                            )}
                        </div>

                        {/* ── Order Summary ── */}
                        <div className="lg:col-span-1">
                            <div
                                className="rounded-2xl bg-white px-6 py-6 sticky top-24"
                                style={{
                                    border: "1px solid rgba(184,124,90,0.12)",
                                    boxShadow: "0 2px 16px rgba(150,80,40,0.05)",
                                }}
                            >
                                <p
                                    className="text-lg font-normal text-[#2c1f1a] mb-5"
                                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                                >
                                    Order <em className="italic text-[#b87c5a]">Summary</em>
                                </p>

                                {/* Line items */}
                                <div className="flex flex-col gap-3 text-sm mb-5">
                                    <div className="flex justify-between text-[#6b4c40]">
                                        <span>Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                                        <span>{fmt(totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-[#6b4c40]">
                                        <span>Shipping</span>
                                        <span className={shipping === 0 ? "text-[#3a7a3a] font-medium" : ""}>
                                            {shipping === 0 ? "Free" : fmt(shipping)}
                                        </span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div style={{ borderTop: "1px solid rgba(184,124,90,0.1)" }} className="mb-4" />

                                {/* Total */}
                                <div className="flex justify-between items-baseline mb-6">
                                    <span className="text-sm font-medium text-[#2c1f1a]">Total</span>
                                    <span className="text-xl font-medium text-[#b87c5a]">{fmt(grandTotal)}</span>
                                </div>

                                {/* Error */}
                                {checkoutError && (
                                    <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs mb-4">
                                        {checkoutError}
                                    </div>
                                )}

                                {/* Checkout button */}
                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className="w-full py-3.5 rounded-full text-white text-sm tracking-wide transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                                    style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)" }}
                                >
                                    {isCheckingOut ? "Processing…" : "Place Order →"}
                                </button>

                                <p className="text-[11px] text-center text-[#b0907e] mt-3">
                                    Secure checkout · Clinic-verified products
                                </p>

                                {/* Divider */}
                                <div style={{ borderTop: "1px solid rgba(184,124,90,0.08)" }} className="mt-5 pt-5">
                                    <Link
                                        to="/patient/orders"
                                        className="flex items-center justify-center gap-2 text-xs text-[#9a6e62] hover:text-[#b87c5a] transition"
                                    >
                                        View past orders →
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </>
    );
}