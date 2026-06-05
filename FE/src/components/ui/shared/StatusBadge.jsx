const STATUS_MAP = {
  // ── Booking ────────────────────────────────────────────────
  pending: {
    label: "Pending",
    icon: "◇",
    color: "#92570a",
    bg: "rgba(217,119,6,0.1)",
    border: "rgba(217,119,6,0.22)",
    dot: "#d97706",
    pulse: true,
  },
  confirmed: {
    label: "Confirmed",
    icon: "◉",
    color: "#1549a8",
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.18)",
    dot: "#3b82f6",
    pulse: false,
  },
  done: {
    label: "Done",
    icon: "✦",
    color: "#145e2d",
    bg: "rgba(22,163,74,0.09)",
    border: "rgba(22,163,74,0.2)",
    dot: "#16a34a",
    pulse: false,
  },
  cancelled: {
    label: "Cancelled",
    icon: "✕",
    color: "#7a5a52",
    bg: "rgba(154,110,98,0.09)",
    border: "rgba(154,110,98,0.18)",
    dot: "#9a6e62",
    pulse: false,
  },

  // ── Order ──────────────────────────────────────────────────
  processing: {
    label: "Processing",
    icon: "◈",
    color: "#92570a",
    bg: "rgba(217,119,6,0.1)",
    border: "rgba(217,119,6,0.22)",
    dot: "#d97706",
    pulse: true,
  },
  shipped: {
    label: "Shipped",
    icon: "◉",
    color: "#1549a8",
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.18)",
    dot: "#3b82f6",
    pulse: false,
  },
  delivered: {
    label: "Delivered",
    icon: "✦",
    color: "#145e2d",
    bg: "rgba(22,163,74,0.09)",
    border: "rgba(22,163,74,0.2)",
    dot: "#16a34a",
    pulse: false,
  },
  refunded: {
    label: "Refunded",
    icon: "◇",
    color: "#7a3e35",
    bg: "rgba(192,57,43,0.08)",
    border: "rgba(192,57,43,0.18)",
    dot: "#c0392b",
    pulse: false,
  },

  // ── Stock ──────────────────────────────────────────────────
  in_stock: {
    label: "In Stock",
    icon: "✦",
    color: "#145e2d",
    bg: "rgba(22,163,74,0.09)",
    border: "rgba(22,163,74,0.2)",
    dot: "#16a34a",
    pulse: false,
  },
  low_stock: {
    label: "Low Stock",
    icon: "◇",
    color: "#92570a",
    bg: "rgba(217,119,6,0.1)",
    border: "rgba(217,119,6,0.22)",
    dot: "#d97706",
    pulse: true,
  },
  out_of_stock: {
    label: "Out of Stock",
    icon: "✕",
    color: "#7a3e35",
    bg: "rgba(192,57,43,0.08)",
    border: "rgba(192,57,43,0.18)",
    dot: "#c0392b",
    pulse: false,
  },

  // ── User ───────────────────────────────────────────────────
  active: {
    label: "Active",
    icon: "◉",
    color: "#145e2d",
    bg: "rgba(22,163,74,0.09)",
    border: "rgba(22,163,74,0.2)",
    dot: "#16a34a",
    pulse: true,
  },
  inactive: {
    label: "Inactive",
    icon: "◇",
    color: "#7a5a52",
    bg: "rgba(154,110,98,0.09)",
    border: "rgba(154,110,98,0.18)",
    dot: "#9a6e62",
    pulse: false,
  },
};

const SIZE = {
  sm: { px: "2px 8px",  font: "10px", iconSize: "8px",  gap: "4px"  },
  md: { px: "3px 10px", font: "11px", iconSize: "9px",  gap: "5px"  },
  lg: { px: "5px 13px", font: "13px", iconSize: "10px", gap: "6px"  },
};

export default function StatusBadge({ status, size = "md", dot = false }) {
  const s = STATUS_MAP[status];
  if (!s) return null;

  const sz = SIZE[size] || SIZE.md;
  const showPulse = dot && s.pulse;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: sz.gap,
        padding: sz.px,
        borderRadius: "20px",
        fontSize: sz.font,
        fontWeight: 500,
        fontFamily: "var(--font-sans, sans-serif)",
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      {dot ? (
        <span
          style={{
            width: sz.iconSize,
            height: sz.iconSize,
            borderRadius: "50%",
            background: s.dot,
            display: "inline-block",
            flexShrink: 0,
            ...(showPulse && {
              animation: "statusPulse 1.8s ease-in-out infinite",
            }),
          }}
        />
      ) : (
        <span style={{ fontSize: sz.iconSize, lineHeight: 1 }}>{s.icon}</span>
      )}
      {s.label}

      {/* Keyframes injected once via a style tag inside the component */}
      {showPulse && (
        <style>{`
          @keyframes statusPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.5; transform: scale(0.85); }
          }
        `}</style>
      )}
    </span>
  );
}

export { STATUS_MAP };