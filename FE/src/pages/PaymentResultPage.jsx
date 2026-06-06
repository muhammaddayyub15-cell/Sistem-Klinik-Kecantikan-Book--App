import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

// ── PaymentResultPage ──────────────────────────────────────────────────────
// [NOTE] Halaman ini menangkap redirect dari Midtrans setelah proses pembayaran.
//        Midtrans mengirim query params ke finish_url yang dikonfigurasi di backend:
//          - order_id         : order number dari Midtrans (bisa berbeda dengan order_id internal)
//          - status_code      : "200" (success), "201" (pending), "202" (denied)
//          - transaction_status: "settlement"|"capture"|"pending"|"deny"|"cancel"|"expire"
//
//        Route ini HARUS public (tidak wrap di ProtectedRoute) karena Midtrans
//        redirect langsung — token mungkin masih valid tapi tidak guaranteed.
//        Backend verify status via webhook, bukan dari redirect ini.
//
//        Tiga state yang ditangani:
//          SUCCESS  — status_code 200, transaction_status settlement/capture
//          PENDING  — status_code 201, transaction_status pending (e.g. transfer bank)
//          ERROR    — status_code 202 atau tidak ada params (akses langsung ke URL)

const STATES = {
  success: {
    icon: "✦",
    iconBg: "linear-gradient(135deg, #e8c9b0, #d4a882)",
    iconColor: "#5a2e12",
    badge: "Payment Confirmed",
    badgeBg: "rgba(34,197,94,0.1)",
    badgeColor: "#15803d",
    title: "Payment",
    titleEm: "Successful",
    desc: "Your booking is now confirmed. We'll send a reminder before your appointment.",
    cta: { label: "View My Bookings →", to: "/patient/my-bookings" },
    secondary: { label: "Go to Dashboard", to: "/patient/dashboard" },
  },
  pending: {
    icon: "◷",
    iconBg: "rgba(234,179,8,0.12)",
    iconColor: "#854d0e",
    badge: "Payment Pending",
    badgeBg: "rgba(234,179,8,0.1)",
    badgeColor: "#854d0e",
    title: "Almost",
    titleEm: "There",
    desc: "Your payment is being processed. This usually takes a few minutes to a few hours depending on your payment method.",
    cta: { label: "View My Orders →", to: "/patient/order" },
    secondary: { label: "Go to Dashboard", to: "/patient/dashboard" },
  },
  error: {
    icon: "✕",
    iconBg: "rgba(239,68,68,0.1)",
    iconColor: "#b91c1c",
    badge: "Payment Failed",
    badgeBg: "rgba(239,68,68,0.08)",
    badgeColor: "#b91c1c",
    title: "Payment",
    titleEm: "Unsuccessful",
    desc: "Your payment could not be completed. Your booking is still reserved — you can try paying again from My Orders.",
    cta: { label: "Try Again →", to: "/patient/order" },
    secondary: { label: "Go to Dashboard", to: "/patient/dashboard" },
  },
};

// Tentukan state dari query params Midtrans
function resolveState(params) {
  const statusCode        = params.get("status_code");
  const transactionStatus = params.get("transaction_status");

  if (!statusCode && !transactionStatus) return "error"; // akses langsung tanpa params

  if (statusCode === "200" ||
      transactionStatus === "settlement" ||
      transactionStatus === "capture") {
    return "success";
  }

  if (statusCode === "201" || transactionStatus === "pending") {
    return "pending";
  }

  return "error"; // 202, deny, cancel, expire
}

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState(null);

  useEffect(() => {
    // [NOTE] Resolve state setelah mount untuk memastikan searchParams sudah ready.
    //        Midtrans kadang mengirim redirect dengan delay kecil.
    setState(resolveState(searchParams));
  }, [searchParams]);

  // Loading state singkat agar tidak flash salah state
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf8f5" }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#b87c5a] border-t-transparent animate-spin" />
      </div>
    );
  }

  const s = STATES[state];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .fade-up-delay { animation: fadeUp 0.5s 0.15s ease forwards; opacity: 0; }
        .fade-up-delay2 { animation: fadeUp 0.5s 0.3s ease forwards; opacity: 0; }
      `}</style>

      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: "#faf8f5", fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="text-center max-w-sm w-full">

          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl fade-up"
            style={{ background: s.iconBg, color: s.iconColor }}
          >
            {s.icon}
          </div>

          {/* Badge */}
          <span
            className="inline-block px-3 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase font-medium mb-4 fade-up"
            style={{ background: s.badgeBg, color: s.badgeColor }}
          >
            {s.badge}
          </span>

          {/* Title */}
          <h1
            className="text-4xl font-normal text-[#2c1f1a] mb-3 fade-up-delay"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {s.title}{" "}
            <em className="italic" style={{ color: "#b87c5a" }}>{s.titleEm}</em>
          </h1>

          {/* Description */}
          <p className="text-sm text-[#9a6e62] mb-8 leading-relaxed fade-up-delay">
            {s.desc}
          </p>

          {/* Order info dari params (jika ada) */}
          {searchParams.get("order_id") && (
            <div
              className="rounded-xl px-5 py-3.5 mb-6 text-left fade-up-delay"
              style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}
            >
              <p className="text-xs text-[#b0907e] mb-1">Order Reference</p>
              <p className="text-sm font-medium text-[#2c1f1a] font-mono">
                {searchParams.get("order_id")}
              </p>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-3 fade-up-delay2">
            <Link
              to={s.cta.to}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)" }}
            >
              {s.cta.label}
            </Link>
            <Link
              to={s.secondary.to}
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl text-sm font-medium border border-[rgba(184,124,90,0.25)] text-[#5a3e35] hover:bg-[rgba(184,124,90,0.05)] transition-all"
            >
              {s.secondary.label}
            </Link>
          </div>

          {/* Footer note */}
          <p className="text-[11px] text-[#c4a898] mt-6">
            Secure checkout · Powered by Midtrans
          </p>
        </div>
      </div>
    </>
  );
}