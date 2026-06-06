import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { createOrder } from "../api/orderApi";
import { initiatePayment } from "../api/paymentApi";
import { useAuth } from "./AuthContext";

// ─── Context ───────────────────────────────────────────────────────────────
const CartContext = createContext(null);

// ─── Storage key ──────────────────────────────────────────────────────────
//        Cart disimpan di localStorage agar tidak hilang saat user refresh halaman.
//        pendingBookingId TIDAK disimpan ke localStorage — sengaja session-only
//        agar tidak stale jika user buka halaman cart di lain waktu tanpa booking baru.
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

  // pendingBookingId: booking_id yang akan dilink ke order saat checkout.
  // Di-set oleh BookingPage setelah booking berhasil, dibaca CartPage saat checkout.
  // Null jika user beli produk tanpa booking (langsung dari /patient/products).
  const [pendingBookingId, setPendingBookingId] = useState(null);

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
        //        Validasi max stock dilakukan di backend saat checkout.
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
  // Alur lengkap:
  //   1. POST /orders → buat order + kurangi stok
  //   2. POST /payments/initiate → buat payment record + request Snap token ke Midtrans
  //   3. Return { order, paymentUrl } → CartPage redirect ke Midtrans
  //
  // [NOTE] Dua langkah ini dipisah endpoint karena PaymentService membutuhkan
  //        order_id yang baru dibuat. Keduanya dipanggil otomatis di sini
  //        agar CartPage tidak perlu tahu detail alur payment.
  //
  // [NOTE] booking_id diambil dari pendingBookingId yang di-set BookingPage.
  //        Setelah checkout berhasil, pendingBookingId di-reset ke null.
  //        Redirect ke payment_url dilakukan di CartPage, bukan di sini,
  //        agar context tidak coupling ke router.
  //
  // Return: { order, paymentUrl } atau null jika gagal.
  const checkout = useCallback(async () => {
    if (cartItems.length === 0) {
      setCheckoutError("Cart kosong. Tambahkan produk terlebih dahulu.");
      return null;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // ── Step 1: Buat order ───────────────────────────────────────────
      const orderPayload = {
        ...(pendingBookingId && { booking_id: pendingBookingId }),
        items: cartItems.map((item) => ({
          product_id: item.id,
          qty: item.qty,
        })),
      };

      const orderRes = await createOrder(orderPayload);
      const order    = orderRes.data?.data ?? orderRes.data;

      // ── Step 2: Inisiasi payment untuk dapat payment_url ─────────────
      // order_id dari response order yang baru dibuat
      const orderId   = order?.order_id ?? order?.id;
      const payRes    = await initiatePayment(orderId);
      const payData   = payRes.data?.data ?? payRes.data;
      const paymentUrl = payData?.payment_url ?? null;

      // Bersihkan cart dan pendingBookingId setelah semua berhasil
      clearCart();
      setPendingBookingId(null);

      // CartPage yang bertanggung jawab redirect ke Midtrans
      return { order, paymentUrl };

    } catch (err) {
      setCheckoutError(
        err?.response?.data?.message ??
        err.normalizedMessage ??
        "Checkout gagal. Silakan coba lagi."
      );
      return null;
    } finally {
      setIsCheckingOut(false);
    }
  }, [cartItems, clearCart, pendingBookingId]);

  // ── Derived values (memoized) ─────────────────────────────────────────
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
    pendingBookingId,

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
    setPendingBookingId,
    clearCheckoutError: () => setCheckoutError(null),
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// ─── Custom hook ──────────────────────────────────────────────────────────
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error(
      "useCart must be used within <CartProvider>. Wrap the relevant route/page with <CartProvider> di App.jsx atau route/index.jsx."
    );
  }
  return ctx;
};