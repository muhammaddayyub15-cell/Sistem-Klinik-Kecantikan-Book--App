import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { createOrder } from "../api/orderApi";
import { useAuth } from "./AuthContext";

// ─── Context ───────────────────────────────────────────────────────────────
const CartContext = createContext(null);

// ─── Storage key ──────────────────────────────────────────────────────────
//        Cart disimpan di localStorage agar tidak hilang saat user refresh halaman.
//        Berbeda dengan session auth yang perlu validasi ke server,
//        cart data cukup persisted di client side.
const STORAGE_KEY_CART = "aura_cart";

// ─── Helper: baca cart dari localStorage ─────────────────────────────────
const loadCartFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CART);
    return raw ? JSON.parse(raw) : [];
  } catch {
    //        JSON.parse bisa gagal jika localStorage corrupt.
    //        Fallback ke empty cart daripada crash.
    return [];
  }
};

// ─── Helper: simpan cart ke localStorage ─────────────────────────────────
const saveCartToStorage = (items) => {
  localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(items));
};

// ─── Provider ─────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  // Inisialisasi dari localStorage agar cart persist setelah refresh.
  const [cartItems, setCartItems] = useState(() => loadCartFromStorage());
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const { user } = useAuth();

  // ── Helper: update state + sync ke localStorage ───────────────────────
  const syncCart = useCallback((updater) => {
    setCartItems((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveCartToStorage(next);
      return next;
    });
  }, []);

  // ── addToCart ─────────────────────────────────────────────────────────
  // Tambah produk ke cart. Jika sudah ada, increment qty.
  // @param {{ id: number, name: string, price: number, image_url?: string }} product
  // @param {number} qty - default 1
  const addToCart = useCallback((product, qty = 1) => {
    syncCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        //      Tidak ada validasi max stock di sini.
        //        Validasi stock dilakukan di backend saat checkout.
        //        Jika ingin validasi di frontend, bandingkan dengan product.stock_qty.
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      return [...prev, { ...product, qty }];
    });
  }, [syncCart]);

  // ── removeFromCart ────────────────────────────────────────────────────
  // @param {number} productId
  const removeFromCart = useCallback((productId) => {
    syncCart((prev) => prev.filter((item) => item.id !== productId));
  }, [syncCart]);

  // ── updateQty ─────────────────────────────────────────────────────────
  // Update qty item tertentu. Jika qty <= 0, hapus dari cart.
  // @param {number} productId
  // @param {number} qty
  const updateQty = useCallback((productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    syncCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, qty } : item
      )
    );
  }, [syncCart, removeFromCart]);

  // ── clearCart ─────────────────────────────────────────────────────────
  const clearCart = useCallback(() => {
    syncCart([]);
  }, [syncCart]);

  // ── checkout ──────────────────────────────────────────────────────────
  // Kirim cart sebagai order ke Order Service.
  // @param {{ bookingId?: number|null }} options - opsional, jika order terkait booking
  // Return: { order, paymentUrl } atau null jika gagal.
  //
  //        Setelah checkout berhasil, backend return payment_url Midtrans.
  //        Redirect ke payment_url dilakukan di komponen/page,
  //        bukan di sini, agar context tidak coupling ke router.
  const checkout = useCallback(async ({ bookingId = null } = {}) => {
    console.log('checkout called, user:', user);        // ← tambah ini
    console.log('cartItems:', cartItems);               // ← tambah ini
    if (cartItems.length === 0) {
      setCheckoutError("Cart kosong. Tambahkan produk terlebih dahulu.");
      return null;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const payload = {
        patient_id: user?.patient_id,
        // [NOTE] booking_id opsional — null jika beli produk tanpa booking.
        ...(bookingId && { booking_id: bookingId }),
        items: cartItems.map((item) => ({
          product_id: item.id,
          qty: item.qty,
        })),
      };
      console.log("checkout payload:", payload); // ← tambah ini perlu hapus

      const res = await createOrder(payload);
      const order = res.data?.data ?? res.data;

      // Bersihkan cart setelah order berhasil dibuat.
      clearCart();

      //  payment_url ada di order.payment.payment_url.
      //        Page yang memanggil checkout() bertanggung jawab untuk redirect.
      return {
        order,
        paymentUrl: order?.payment?.payment_url ?? null,
      };
    } catch (err) {
      setCheckoutError(err.normalizedMessage ?? "Checkout gagal. Silakan coba lagi.");
      return null;
    } finally {
      setIsCheckingOut(false);
    }
  }, [cartItems, clearCart, user]);

  // ── Derived values (memoized) ─────────────────────────────────────────
  // Dihitung satu kali saat cartItems berubah, tidak setiap render.
  const cartSummary = useMemo(() => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    return { totalItems, totalPrice };
  }, [cartItems]);

  // ── Nilai yang di-expose ke consumers ────────────────────────────────
  const value = {
    cartItems,
    isCheckingOut,
    checkoutError,

    // Derived
    totalItems: cartSummary.totalItems,
    totalPrice: cartSummary.totalPrice,
    isEmpty: cartItems.length === 0,

    // Actions
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    checkout,
    clearCheckoutError: () => setCheckoutError(null),
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// ─── Custom hook ──────────────────────────────────────────────────────────
// Konsisten dengan pola useAuth di AuthContext dan useBooking di BookingContext.
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error(
      "useCart must be used within <CartProvider>. Wrap the relevant route/page with <CartProvider> di App.jsx atau route/index.jsx."
    );
  }
  return ctx;
};