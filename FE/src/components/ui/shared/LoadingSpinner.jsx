const SIZE_MAP = {
  sm: { ring: 16, dots: 5, pulse: 28, stroke: 1.5, gap: 4  },
  md: { ring: 28, dots: 7, pulse: 40, stroke: 2,   gap: 6  },
  lg: { ring: 44, dots: 9, pulse: 60, stroke: 2.5, gap: 9  },
};

// ── Ring variant ─────────────────────────────────────────────
function RingSpinner({ px, stroke }) {
  const r = (px - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <>
      <style>{`
        @keyframes spinnerRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        aria-hidden="true"
        style={{ animation: "spinnerRotate 0.9s linear infinite", flexShrink: 0 }}
      >
        {/* Track */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke="rgba(184,124,90,0.18)"
          strokeWidth={stroke}
        />
        {/* Arc */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke="#b87c5a"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * 0.72}
          transform={`rotate(-90 ${px / 2} ${px / 2})`}
        />
      </svg>
    </>
  );
}

// ── Dots variant ─────────────────────────────────────────────
function DotsSpinner({ dotSize, gap }) {
  return (
    <>
      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0);   opacity: 0.3; }
          40%            { transform: translateY(-${dotSize * 0.8}px); opacity: 1; }
        }
      `}</style>
      <div
        style={{ display: "inline-flex", alignItems: "center", gap: gap, flexShrink: 0 }}
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              background: "#b87c5a",
              display: "inline-block",
              animation: `dotBounce 1.1s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// ── Pulse variant ────────────────────────────────────────────
function PulseSpinner({ px }) {
  return (
    <>
      <style>{`
        @keyframes ornamentPulse {
          0%, 100% { opacity: 1;   transform: scale(1)    rotate(0deg); }
          25%       { opacity: 0.6; transform: scale(0.88) rotate(45deg); }
          75%       { opacity: 0.8; transform: scale(1.05) rotate(-10deg); }
        }
      `}</style>
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          fontSize: px,
          color: "#b87c5a",
          lineHeight: 1,
          animation: "ornamentPulse 2s ease-in-out infinite",
          flexShrink: 0,
          fontFamily: "serif",
        }}
      >
        ✦
      </span>
    </>
  );
}

// ── LoadingSpinner (main export) ─────────────────────────────
export default function LoadingSpinner({
  size = "md",
  variant = "ring",
  label,
  overlay = false,
}) {
  const sz = SIZE_MAP[size] || SIZE_MAP.md;

  const spinner =
    variant === "dots" ? (
      <DotsSpinner dotSize={sz.dots} gap={sz.gap} />
    ) : variant === "pulse" ? (
      <PulseSpinner px={sz.pulse} />
    ) : (
      <RingSpinner px={sz.ring} stroke={sz.stroke} />
    );

  const labelSize = size === "sm" ? "11px" : size === "lg" ? "14px" : "12px";

  const inner = (
    <div
      role="status"
      aria-label={label || "Loading…"}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: sz.gap,
      }}
    >
      {spinner}
      {label && (
        <span
          style={{
            fontSize: labelSize,
            color: "#9a6e62",
            fontFamily: "var(--font-sans, sans-serif)",
            letterSpacing: "0.01em",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(250,248,245,0.75)",
          backdropFilter: "blur(2px)",
          borderRadius: "inherit",
          zIndex: 10,
        }}
      >
        {inner}
      </div>
    );
  }

  return inner;
}