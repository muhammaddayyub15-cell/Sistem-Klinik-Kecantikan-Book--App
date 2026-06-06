import { useNavigate } from "react-router-dom";

// ComingSoon — placeholder page untuk fitur yang belum dibangun.
//
// Dipakai oleh:
//   - Route /coming-soon              → redirect dari UserSection (Profile, Settings)
//   - Route /doctor/records/new       → fitur belum dibangun
//   - Route /doctor/schedule          → fitur belum dibangun
//   - Route /admin/patients, orders, reports, dll
//
// Props:
//   title?: string — nama fitur yang ditampilkan di heading.
//                    Default "This Page" jika tidak dipass.

export default function ComingSoon({ title = "This Page" }) {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50%       { opacity: 1;    transform: scale(1.3); }
        }

        .cs-icon    { animation: float   3s ease-in-out infinite; }
        .cs-fade-1  { animation: fadeUp  0.5s 0s    ease forwards; opacity: 0; }
        .cs-fade-2  { animation: fadeUp  0.5s 0.12s ease forwards; opacity: 0; }
        .cs-fade-3  { animation: fadeUp  0.5s 0.24s ease forwards; opacity: 0; }
        .cs-dot-1   { animation: dotPulse 1.6s 0s    ease-in-out infinite; }
        .cs-dot-2   { animation: dotPulse 1.6s 0.25s ease-in-out infinite; }
        .cs-dot-3   { animation: dotPulse 1.6s 0.5s  ease-in-out infinite; }
      `}</style>

      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "#faf8f5", fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="text-center max-w-sm w-full">

          {/* ── Floating icon ── */}
          <div
            className="cs-icon w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center text-3xl"
            style={{ background: "linear-gradient(135deg, #f0ddd0, #e8c9b0)", color: "#b87c5a" }}
          >
            ✦
          </div>

          {/* ── Badge ── */}
          <div className="cs-fade-1 mb-3">
            <span
              className="inline-block px-3 py-1 rounded-full text-[10px] tracking-[0.12em] uppercase font-medium"
              style={{ background: "rgba(184,124,90,0.1)", color: "#8b4c34" }}
            >
              Coming Soon
            </span>
          </div>

          {/* ── Heading ── */}
          <h1
            className="cs-fade-2 text-4xl font-normal text-[#2c1f1a] mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {title === "This Page" ? (
              <>
                We're working on{" "}
                <em className="italic" style={{ color: "#b87c5a" }}>something</em>
              </>
            ) : (
              <>
                <em className="italic" style={{ color: "#b87c5a" }}>{title}</em>
                <br />is on its way
              </>
            )}
          </h1>

          {/* ── Description ── */}
          <p
            className="cs-fade-3 text-sm leading-relaxed mb-10"
            style={{ color: "#9a6e62" }}
          >
            This feature is currently under development.
            <br />
            We're building something great — check back soon.
          </p>

          {/* ── Animated dots ── */}
          <div className="flex items-center justify-center gap-2.5 mb-10">
            <div className="cs-dot-1 w-1.5 h-1.5 rounded-full" style={{ background: "#b87c5a" }} />
            <div className="cs-dot-2 w-1.5 h-1.5 rounded-full" style={{ background: "#b87c5a" }} />
            <div className="cs-dot-3 w-1.5 h-1.5 rounded-full" style={{ background: "#b87c5a" }} />
          </div>

          {/* ── Back button ── */}
          <button
            onClick={() => navigate(-1)}
            className="cs-fade-3 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border transition-all duration-200 hover:bg-[rgba(184,124,90,0.06)] active:scale-95"
            style={{ borderColor: "rgba(184,124,90,0.3)", color: "#5a3e35" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>

        </div>
      </div>
    </>
  );
}