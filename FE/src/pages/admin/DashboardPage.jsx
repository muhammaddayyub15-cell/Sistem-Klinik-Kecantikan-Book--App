import { useState } from "react";

// ── Static data (replace with hooks/API) ─────────────────────────────────────

const STATS = [
  { icon: "✦", label: "Total Bookings",   value: "1,284", delta: "+12%", up: true  },
  { icon: "◈", label: "Active Doctors",   value: "12",    delta: "+1",   up: true  },
  { icon: "◇", label: "Products Listed",  value: "48",    delta: "-2",   up: false },
  { icon: "◉", label: "Revenue (Month)",  value: "Rp 48.2jt", delta: "+8%", up: true },
];

const MONTHLY_REVENUE = [
  { month: "Jan", value: 32 },
  { month: "Feb", value: 28 },
  { month: "Mar", value: 41 },
  { month: "Apr", value: 35 },
  { month: "May", value: 48 },
  { month: "Jun", value: 52 },
  { month: "Jul", value: 44 },
  { month: "Aug", value: 58 },
  { month: "Sep", value: 50 },
  { month: "Oct", value: 62 },
  { month: "Nov", value: 55 },
  { month: "Dec", value: 48 },
];

const BOOKING_BY_SERVICE = [
  { name: "Facial Treatment",    count: 512, pct: 40 },
  { name: "Skin Consultation",   count: 320, pct: 25 },
  { name: "Laser Therapy",       count: 256, pct: 20 },
  { name: "Aesthetic Injection", count: 192, pct: 15 },
];

const RECENT_ACTIVITY = [
  { icon: "✦", type: "New Booking",   desc: "Putri Amelia booked Laser Therapy",         time: "2 min ago",  color: "#b87c5a" },
  { icon: "◈", type: "Order Placed",  desc: "Order ORD-089 placed — Rp 285.000",         time: "14 min ago", color: "#6a9a6a" },
  { icon: "◉", type: "Record Added",  desc: "dr. Anisa added record for Sari Widyastuti", time: "31 min ago", color: "#6a86aa" },
  { icon: "◇", type: "Stock Update",  desc: "Vitamin C Serum restocked — qty +50",        time: "1 hr ago",   color: "#aa8a6a" },
  { icon: "✦", type: "New Booking",   desc: "Mega Lestari booked Skin Consultation",      time: "2 hr ago",   color: "#b87c5a" },
  { icon: "◈", type: "Payment Done",  desc: "ORD-087 payment confirmed via Midtrans",     time: "3 hr ago",   color: "#6a9a6a" },
];

const TOP_DOCTORS = [
  { name: "dr. Anisa Putri",  sessions: 48, rating: 4.9, initials: "AP" },
  { name: "dr. Maya Dewi",    sessions: 41, rating: 4.8, initials: "MD" },
  { name: "dr. Ratna Sari",   sessions: 37, rating: 4.9, initials: "RS" },
];

const MAX_REV = Math.max(...MONTHLY_REVENUE.map((m) => m.value));

export default function AdminDashboardPage() {
  const [hoveredBar, setHoveredBar] = useState(null);

  return (
    <div className="min-h-screen" style={{ background: "#faf8f5", color: "#2c1f1a" }}>
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Admin Panel</p>
            <h1
              className="text-4xl lg:text-5xl font-normal leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
            >
              Clinic <span className="italic" style={{ color: "#b87c5a" }}>Overview</span>
            </h1>
          </div>
          <div
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-xs"
            style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34", border: "1px solid rgba(184,124,90,0.15)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#6a9a6a" }} />
            Live · {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="p-6 rounded-2xl transition-all hover:-translate-y-0.5 duration-200"
              style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xl" style={{ color: "#b87c5a" }}>{s.icon}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: s.up ? "rgba(106,154,106,0.12)" : "rgba(200,80,80,0.08)",
                    color:      s.up ? "#3a7a3a"                 : "#9a3030",
                  }}
                >
                  {s.up ? "▲" : "▼"} {s.delta}
                </span>
              </div>
              <p
                className="text-2xl font-normal"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
              >
                {s.value}
              </p>
              <p className="text-xs mt-1" style={{ color: "#9a6e62" }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">

          {/* ── Revenue Chart (2 col) ── */}
          <div
            className="lg:col-span-2 rounded-2xl p-7"
            style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Analytics</p>
                <h2
                  className="text-xl font-normal"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
                >
                  Monthly Revenue
                </h2>
              </div>
              <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34" }}>
                2025
              </span>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-1 h-36 relative">
              {/* Y-axis hint lines */}
              {[0.25, 0.5, 0.75, 1].map((f) => (
                <div
                  key={f}
                  className="absolute left-0 right-0"
                  style={{
                    bottom: `${f * 100}%`,
                    borderTop: "1px dashed rgba(184,124,90,0.1)",
                  }}
                />
              ))}
              {MONTHLY_REVENUE.map((m, i) => {
                const pct   = (m.value / MAX_REV) * 100;
                const isHov = hoveredBar === i;
                const isCur = m.month === ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][new Date().getMonth()];
                return (
                  <div
                    key={m.month}
                    className="flex-1 flex flex-col items-center gap-1 group cursor-default"
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {isHov && (
                      <div
                        className="absolute text-xs px-2 py-1 rounded-lg pointer-events-none"
                        style={{
                          bottom: `calc(${pct}% + 30px)`,
                          background: "#2c1f1a",
                          color: "#faf8f5",
                          transform: "translateX(-50%)",
                          left: "50%",
                          whiteSpace: "nowrap",
                          zIndex: 10,
                        }}
                      >
                        Rp {m.value}jt
                      </div>
                    )}
                    <div
                      className="w-full rounded-t-lg transition-all duration-200"
                      style={{
                        height: `${Math.max(pct, 3)}%`,
                        background: isCur
                          ? "linear-gradient(180deg, #c4865f, #a0613e)"
                          : isHov
                          ? "rgba(184,124,90,0.5)"
                          : "rgba(184,124,90,0.2)",
                        minHeight: "4px",
                      }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: isCur ? "#b87c5a" : "#c0a090", fontWeight: isCur ? 600 : 400 }}
                    >
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Bookings by Service ── */}
          <div
            className="rounded-2xl p-7"
            style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}
          >
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Breakdown</p>
            <h2
              className="text-xl font-normal mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
            >
              By Service
            </h2>
            <div className="flex flex-col gap-4">
              {BOOKING_BY_SERVICE.map((s, i) => (
                <div key={s.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs truncate pr-2" style={{ color: "#5a3e35" }}>{s.name}</span>
                    <span className="text-xs font-semibold shrink-0" style={{ color: "#b87c5a" }}>{s.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "rgba(184,124,90,0.12)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${s.pct}%`,
                        background: i === 0
                          ? "linear-gradient(90deg, #c4865f, #a0613e)"
                          : `rgba(184,124,90,${0.7 - i * 0.15})`,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: "#c0a090" }}>{s.count} bookings</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Recent Activity (2 col) ── */}
          <div
            className="lg:col-span-2 rounded-2xl p-7"
            style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}
          >
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Live Feed</p>
            <h2
              className="text-xl font-normal mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
            >
              Recent Activity
            </h2>
            <div className="flex flex-col">
              {RECENT_ACTIVITY.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 py-3"
                  style={{ borderBottom: i < RECENT_ACTIVITY.length - 1 ? "1px solid rgba(184,124,90,0.07)" : "none" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5"
                    style={{ background: `${a.color}18`, color: a.color }}
                  >
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: a.color }}>{a.type}</p>
                    <p className="text-sm mt-0.5 truncate" style={{ color: "#3a2520" }}>{a.desc}</p>
                  </div>
                  <span className="text-xs shrink-0 mt-0.5" style={{ color: "#c0a090" }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Top Doctors ── */}
          <div
            className="rounded-2xl p-7"
            style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}
          >
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Performance</p>
            <h2
              className="text-xl font-normal mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
            >
              Top Doctors
            </h2>
            <div className="flex flex-col gap-4">
              {TOP_DOCTORS.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span
                    className="text-sm font-semibold w-5 shrink-0"
                    style={{ color: i === 0 ? "#b87c5a" : "#c0a090", fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {i + 1}
                  </span>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #e8c9b0, #d4a882)",
                      color: "#5a2e12",
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >
                    {d.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#2c1f1a" }}>{d.name}</p>
                    <p className="text-xs" style={{ color: "#9a6e62" }}>{d.sessions} sessions</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <span style={{ color: "#b87c5a", fontSize: 11 }}>★</span>
                    <span className="text-xs font-semibold" style={{ color: "#5a3e35" }}>{d.rating}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <a
                href="/admin/doctors"
                className="py-2.5 rounded-xl text-xs text-center transition hover:opacity-80"
                style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34" }}
              >
                Manage Doctors
              </a>
              <a
                href="/admin/services"
                className="py-2.5 rounded-xl text-xs text-center transition hover:opacity-80"
                style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34" }}
              >
                Manage Services
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');
      `}</style>
    </div>
  );
}