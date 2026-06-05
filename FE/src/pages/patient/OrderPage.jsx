import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getOrders } from "../../api/orderApi";
import { getOrdersByPatient } from "../../api/orderApi";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) => "Rp " + Number(n).toLocaleString("id-ID");

const formatDate = (str) => {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
};

// ── Status styles ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  pending: { bg: "rgba(184,124,90,0.12)", color: "#8b4c34", label: "Pending" },
  paid: { bg: "rgba(134,180,134,0.12)", color: "#3a7a3a", label: "Paid" },
  completed: { bg: "rgba(90,120,180,0.1)", color: "#2c4a8a", label: "Completed" },
  cancelled: { bg: "rgba(200,80,80,0.1)", color: "#9a3030", label: "Cancelled" },
};

function StatusBadge({ status }) {
  const st = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span
      className="text-xs px-2.5 py-0.5 rounded-full shrink-0 font-medium"
      style={{ background: st.bg, color: st.color }}
    >
      {st.label}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-2xl bg-[rgba(184,124,90,0.06)] animate-pulse" style={{ height: 120 }} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <span className="text-5xl opacity-20 text-[#b87c5a]">◇</span>
      <p className="text-sm text-[#c0a090]">No orders yet</p>
      <Link
        to="/patient/products"
        className="text-sm px-6 py-2.5 rounded-full text-white transition hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)" }}
      >
        Shop Products →
      </Link>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OrderPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const patientId = user?.patient_id;
    if (!patientId) {
      setLoading(false);
      setError("Patient profile not found.");
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await getOrdersByPatient(patientId);
        const data = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setError("Gagal memuat riwayat order.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.patient_id]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
      `}</style>

      <div className="min-h-screen bg-[#faf8f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="max-w-3xl mx-auto px-6 py-10">

          {/* ── Header ── */}
          <div className="mb-10">
            <p className="text-[11px] tracking-[0.1em] uppercase text-[#b87c5a] mb-1">History</p>
            <h1
              className="text-4xl font-normal text-[#2c1f1a]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              My <em className="italic text-[#b87c5a]">Orders</em>
            </h1>
            <p className="text-sm mt-2 text-[#9a6e62]">
              Track and manage your product orders.
            </p>
          </div>

          {/* ── CTA Shop ── */}
          <div
            className="rounded-2xl p-6 mb-8 flex items-center justify-between gap-4"
            style={{ background: "linear-gradient(135deg, #f0ddd0, #e8c9b0)" }}
          >
            <div>
              <p className="text-sm font-medium text-[#2c1208]">Need more products?</p>
              <p className="text-xs mt-0.5 text-[#6b4030]">Browse our clinic-grade skincare range.</p>
            </div>
            <Link
              to="/patient/products"
              className="shrink-0 px-5 py-2.5 rounded-full text-white text-xs tracking-wide transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)" }}
            >
              Shop Now →
            </Link>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-6">
              {error}
            </div>
          )}

          {/* ── Order List ── */}
          {loading ? <LoadingSkeleton /> : orders.length === 0 ? <EmptyState /> : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  className="rounded-2xl bg-white border border-[rgba(184,124,90,0.12)] overflow-hidden"
                  style={{ boxShadow: "0 2px 12px rgba(150,80,40,0.04)" }}
                >
                  {/* Order header */}
                  <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: "1px solid rgba(184,124,90,0.08)" }}
                  >
                    <div>
                      <p className="text-xs text-[#9a6e62] mb-0.5">Order</p>
                      <p className="text-sm font-medium text-[#2c1f1a]">
                        #{order.order_number ?? order.order_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-[#9a6e62]">{formatDate(order.created_at)}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="px-6 py-4">
                    {(order.order_items ?? order.items ?? []).map((item, idx) => (
                      <div
                        key={item.item_id ?? idx}
                        className="flex items-center justify-between py-2"
                        style={{ borderBottom: "1px solid rgba(184,124,90,0.06)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                            style={{ background: "linear-gradient(135deg, #fdf6ef, #f0ddd0)", color: "#b87c5a" }}
                          >
                            ◈
                          </div>
                          <div>
                            <p className="text-sm text-[#2c1f1a]">
                              {item.product_name_snapshot ?? item.product_name ?? "—"}
                            </p>
                            <p className="text-xs text-[#9a6e62]">Qty: {item.qty}</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-[#2c1f1a]">
                          {fmt((item.unit_price_snapshot ?? item.unit_price ?? 0) * item.qty)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order footer */}
                  <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ borderTop: "1px solid rgba(184,124,90,0.08)" }}
                  >
                    <div>
                      {order.payment?.status && (
                        <p className="text-xs text-[#9a6e62]">
                          Payment: <span className="font-medium text-[#2c1f1a]">{order.payment.status}</span>
                        </p>
                      )}
                      {order.paid_at && (
                        <p className="text-xs text-[#9a6e62] mt-0.5">
                          Paid: {formatDate(order.paid_at)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#9a6e62] mb-0.5">Total</p>
                      <p className="text-base font-semibold text-[#b87c5a]">
                        {fmt(order.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}