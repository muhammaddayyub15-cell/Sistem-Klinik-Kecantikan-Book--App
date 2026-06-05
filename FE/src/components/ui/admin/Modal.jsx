import { useEffect } from "react";

const MAX_WIDTHS = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "md",
}) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center px-4"
        style={{ background: "rgba(44, 31, 26, 0.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        {/* ── Panel ── */}
        <div
          className={`relative w-full ${MAX_WIDTHS[maxWidth]} rounded-3xl overflow-hidden animate-modalIn`}
          style={{
            background: "#faf8f5",
            border: "1px solid rgba(184, 124, 90, 0.18)",
            boxShadow: "0 24px 80px rgba(90, 46, 18, 0.18)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div
            className="px-8 pt-8 pb-6 flex items-start justify-between"
            style={{ borderBottom: "1px solid rgba(184, 124, 90, 0.12)" }}
          >
            <div>
              {/* Ornament + title row */}
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: "#b87c5a", fontSize: 14 }}>✦</span>
                <h2
                  className="text-xl font-normal"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    color: "#2c1f1a",
                  }}
                >
                  {title}
                </h2>
              </div>
              {subtitle && (
                <p className="text-sm ml-5" style={{ color: "#9a6e62" }}>
                  {subtitle}
                </p>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-80"
              style={{
                background: "rgba(184, 124, 90, 0.1)",
                color: "#8b4c34",
                fontSize: 14,
              }}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* ── Body ── */}
          <div className="px-8 py-6 overflow-y-auto" style={{ maxHeight: "75vh" }}>
            {children}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .animate-modalIn { animation: modalIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>
    </>
  );
}