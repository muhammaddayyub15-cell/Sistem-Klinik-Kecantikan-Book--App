/**
 * BookingList.jsx
 * ─────────────────────────────────────────────
 * Renders a list of BookingCard components with:
 *  - Loading skeleton state
 *  - Empty state
 *  - Status tab filter (All / Pending / Confirmed / Done / Cancelled)
 *  - Compact toggle (pass compact prop)
 *  - Staggered entrance animation
 *
 * Props:
 *   bookings     {array}    — array of booking objects
 *   isLoading    {boolean}  — show skeleton loader
 *   onCancel     {function} — forwarded to each BookingCard
 *   onViewDetail {function} — forwarded to each BookingCard
 *   compact      {boolean}  — use compact card layout
 *   showFilter   {boolean}  — show status tab filter (default true)
 *   emptyMessage {string}   — custom empty state message
 */

import { useState } from "react";
import BookingCard from "./BookingCard";

// ── Status tabs ─────────────────────────────────────────────────────────────
const TABS = [
  { key: "all",       label: "All",       icon: "◈" },
  { key: "pending",   label: "Pending",   icon: "◇" },
  { key: "confirmed", label: "Confirmed", icon: "◉" },
  { key: "done",      label: "Done",      icon: "✦" },
  { key: "cancelled", label: "Cancelled", icon: "✕" },
];

// ── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard({ compact }) {
  if (compact) {
    return (
      <div
        className="flex items-center gap-4 px-5 py-4 rounded-xl"
        style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.1)" }}
      >
        <div className="w-12 h-12 rounded-xl skeleton" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3.5 w-2/3 rounded-full skeleton" />
          <div className="h-2.5 w-1/2 rounded-full skeleton" />
        </div>
        <div className="w-16 h-7 rounded-lg skeleton" />
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden p-6"
      style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.1)" }}
    >
      <div className="flex justify-between items-start mb-5">
        <div className="h-7 w-36 rounded-full skeleton" />
        <div className="h-6 w-20 rounded-full skeleton" />
      </div>
      <div className="h-6 w-3/4 rounded-lg skeleton mb-2" />
      <div className="h-4 w-1/2 rounded-lg skeleton mb-5" />
      <div className="h-px w-full skeleton mb-4" />
      <div className="flex gap-2">
        <div className="flex-1 h-9 rounded-full skeleton" />
        <div className="w-20 h-9 rounded-full skeleton" />
      </div>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ activeTab, message }) {
  const messages = {
    all:       "No bookings yet. Schedule your first session.",
    pending:   "No pending bookings at the moment.",
    confirmed: "No confirmed bookings.",
    done:      "No completed sessions yet.",
    cancelled: "No cancelled bookings.",
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-5"
        style={{ background: "rgba(184,124,90,0.08)", color: "#c8a090" }}
      >
        ◈
      </div>
      <p
        className="text-base mb-1"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
      >
        Nothing here
      </p>
      <p className="text-sm max-w-xs" style={{ color: "#9a6e62" }}>
        {message || messages[activeTab] || messages.all}
      </p>
    </div>
  );
}

// ── BookingList ──────────────────────────────────────────────────────────────
export default function BookingList({
  bookings = [],
  isLoading = false,
  onCancel,
  onViewDetail,
  compact = false,
  showFilter = true,
  emptyMessage,
}) {
  const [activeTab, setActiveTab] = useState("all");

  // Count per status for tab badges
  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const filtered =
    activeTab === "all" ? bookings : bookings.filter((b) => b.status === activeTab);

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');

        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
        .skeleton {
          background: linear-gradient(90deg, rgba(232,201,176,0.25) 0%, rgba(212,168,130,0.2) 50%, rgba(232,201,176,0.25) 100%);
          animation: skeleton-pulse 1.6s ease-in-out infinite;
        }

        @keyframes card-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-animate {
          animation: card-in 0.4s ease-out both;
        }
      `}</style>

      {/* ── Status Tabs ── */}
      {showFilter && (
        <div
          className="flex items-center gap-1 p-1 rounded-2xl mb-6 overflow-x-auto"
          style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.1)" }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tab.key === "all" ? bookings.length : (counts[tab.key] || 0);
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs tracking-wide whitespace-nowrap transition-all duration-200 flex-shrink-0"
                style={{
                  background: isActive ? "linear-gradient(135deg, #c4865f, #a0613e)" : "transparent",
                  color: isActive ? "#fff" : "#7a5a52",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                <span style={{ fontSize: 9, opacity: isActive ? 1 : 0.6 }}>{tab.icon}</span>
                {tab.label}
                {count > 0 && (
                  <span
                    className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] leading-none"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.25)" : "rgba(184,124,90,0.12)",
                      color: isActive ? "#fff" : "#8b4c34",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        // Skeleton grid
        <div className={compact ? "flex flex-col gap-3" : "grid md:grid-cols-2 lg:grid-cols-3 gap-5"}>
          {Array.from({ length: compact ? 5 : 6 }).map((_, i) => (
            <SkeletonCard key={i} compact={compact} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState activeTab={activeTab} message={emptyMessage} />
      ) : (
        // Card grid with staggered animation
        <div className={compact ? "flex flex-col gap-3" : "grid md:grid-cols-2 lg:grid-cols-3 gap-5"}>
          {filtered.map((booking, index) => (
            <div
              key={booking.id}
              className="card-animate"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <BookingCard
                booking={booking}
                onCancel={onCancel}
                onViewDetail={onViewDetail}
                compact={compact}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Footer count ── */}
      {!isLoading && filtered.length > 0 && (
        <p className="text-center text-xs mt-8" style={{ color: "#b0907e" }}>
          Showing {filtered.length} {activeTab === "all" ? "" : activeTab + " "}
          booking{filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}