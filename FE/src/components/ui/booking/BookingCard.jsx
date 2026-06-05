/**
 * BookingCard.jsx
 * ─────────────────────────────────────────────
 * Displays a single booking entry with:
 *  - Status badge (pending / confirmed / done / cancelled)
 *  - Doctor, service, date/time, notes
 *  - Optional action callbacks: onCancel, onViewDetail
 *
 * Props:
 *   booking      {object}   — booking data (see shape below)
 *   onCancel     {function} — called with booking.id; shown only when status === 'pending'
 *   onViewDetail {function} — called with booking.id
 *   compact      {boolean}  — condensed single-row layout (for admin/doctor views)
 */

// ── Status config ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: "◇",
    color: "#d97706",
    bg: "rgba(217,119,6,0.1)",
    border: "rgba(217,119,6,0.2)",
    gradient: "linear-gradient(135deg, rgba(253,246,239,1), rgba(254,243,199,0.6))",
  },
  confirmed: {
    label: "Confirmed",
    icon: "◉",
    color: "#2563eb",
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.15)",
    gradient: "linear-gradient(135deg, rgba(250,248,245,1), rgba(219,234,254,0.5))",
  },
  done: {
    label: "Done",
    icon: "✦",
    color: "#16a34a",
    bg: "rgba(22,163,74,0.08)",
    border: "rgba(22,163,74,0.18)",
    gradient: "linear-gradient(135deg, rgba(250,248,245,1), rgba(220,252,231,0.5))",
  },
  cancelled: {
    label: "Cancelled",
    icon: "✕",
    color: "#9a6e62",
    bg: "rgba(154,110,98,0.08)",
    border: "rgba(154,110,98,0.15)",
    gradient: "linear-gradient(135deg, rgba(250,248,245,1), rgba(245,235,232,0.6))",
  },
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};
const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

// ── StatusBadge (local, self-contained) ────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      <span style={{ fontSize: 9 }}>{s.icon}</span>
      {s.label}
    </span>
  );
}

// ── BookingCard ─────────────────────────────────────────────────────────────
export default function BookingCard({ booking, onCancel, onViewDetail, compact = false }) {
  const {
    id,
    status = "pending",
    booked_at,
    doctor_name,
    doctor_specialization,
    service_name,
    patient_name,   // visible in doctor/admin view
    notes,
  } = booking;

  const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const isCancellable = status === "pending";
  const isDone = status === "done";
  const isCancelled = status === "cancelled";

  // ── Compact (single-row table-like) layout ────────────────────────────
  if (compact) {
    return (
      <div
        className="flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: "#fff",
          border: `1px solid ${s.border}`,
          opacity: isCancelled ? 0.65 : 1,
        }}
      >
        {/* Date block */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center"
          style={{ background: s.bg }}
        >
          <span className="text-lg font-semibold leading-none" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: s.color }}>
            {new Date(booked_at).getDate()}
          </span>
          <span className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: s.color }}>
            {new Date(booked_at).toLocaleDateString("en-GB", { month: "short" })}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium truncate" style={{ color: "#2c1f1a" }}>
              {service_name}
            </span>
            <StatusBadge status={status} />
          </div>
          <div className="text-xs truncate" style={{ color: "#9a6e62" }}>
            {patient_name ? `${patient_name} · ` : ""}{doctor_name} · {formatTime(booked_at)}
          </div>
        </div>

        {/* Action */}
        <button
          onClick={() => onViewDetail?.(id)}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
          style={{ background: "rgba(184,124,90,0.1)", color: "#8b4c34" }}
        >
          Detail →
        </button>
      </div>
    );
  }

  // ── Full card layout ──────────────────────────────────────────────────
  return (
    <div
      className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: s.gradient,
        border: `1px solid ${s.border}`,
        opacity: isCancelled ? 0.7 : 1,
        boxShadow: isDone
          ? "0 4px 24px rgba(22,163,74,0.08)"
          : "0 4px 20px rgba(150,80,40,0.06)",
      }}
    >
      {/* Top accent stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: s.color, opacity: 0.5 }}
      />

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-5">
          {/* Date pill */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(184,124,90,0.12)" }}
          >
            <span className="text-sm" style={{ color: "#b87c5a" }}>◈</span>
            <span className="text-xs font-medium" style={{ color: "#2c1f1a" }}>
              {formatDate(booked_at)}
            </span>
            <span className="text-xs" style={{ color: "#9a6e62" }}>
              {formatTime(booked_at)}
            </span>
          </div>

          <StatusBadge status={status} />
        </div>

        {/* Service name */}
        <h3
          className="text-xl font-normal mb-1 leading-snug"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
        >
          {service_name}
        </h3>

        {/* Doctor */}
        <div className="flex items-center gap-1.5 mb-5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #e8c9b0, #d4a882)",
              color: "#5a2e12",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            {doctor_name?.split(" ").slice(-1)[0]?.[0] || "D"}
          </div>
          <span className="text-sm" style={{ color: "#5a3e35" }}>{doctor_name}</span>
          {doctor_specialization && (
            <>
              <span style={{ color: "#c8a090", fontSize: 10 }}>·</span>
              <span className="text-xs" style={{ color: "#9a6e62" }}>{doctor_specialization}</span>
            </>
          )}
        </div>

        {/* Patient name (admin/doctor view) */}
        {patient_name && (
          <div
            className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(184,124,90,0.1)" }}
          >
            <span style={{ color: "#b87c5a", fontSize: 12 }}>◉</span>
            <span className="text-xs" style={{ color: "#5a3e35" }}>Patient:</span>
            <span className="text-xs font-medium" style={{ color: "#2c1f1a" }}>{patient_name}</span>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <p
            className="text-xs leading-relaxed mb-5 italic"
            style={{ color: "#7a5a52" }}
          >
            "{notes}"
          </p>
        )}

        {/* Booking ID */}
        <div className="flex items-center gap-1 mb-5">
          <span className="text-[10px] tracking-widest uppercase" style={{ color: "#b0907e" }}>
            #{String(id).padStart(6, "0")}
          </span>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(184,124,90,0.12)", marginBottom: 16 }} />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetail?.(id)}
            className="flex-1 py-2 rounded-full text-xs tracking-wide transition-all hover:opacity-80"
            style={{
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(184,124,90,0.2)",
              color: "#5a3e35",
            }}
          >
            View Detail →
          </button>

          {isCancellable && (
            <button
              onClick={() => onCancel?.(id)}
              className="px-4 py-2 rounded-full text-xs tracking-wide transition-all hover:opacity-80"
              style={{
                background: "rgba(192,57,43,0.08)",
                border: "1px solid rgba(192,57,43,0.15)",
                color: "#c0392b",
              }}
            >
              Cancel
            </button>
          )}

          {isDone && (
            <div
              className="px-3 py-2 rounded-full text-xs flex items-center gap-1"
              style={{ background: "rgba(22,163,74,0.08)", color: "#16a34a" }}
            >
              <span style={{ fontSize: 10 }}>✦</span> Completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}