import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useBooking } from "../../contexts/BookingContext";

// ── Static data ───────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  confirmed: { bg: "rgba(134,180,134,0.12)", color: "#3a7a3a", label: "Confirmed" },
  pending: { bg: "rgba(184,124,90,0.12)", color: "#8b4c34", label: "Pending" },
  cancelled: { bg: "rgba(200,80,80,0.1)", color: "#9a3030", label: "Cancelled" },
  done: { bg: "rgba(90,120,180,0.1)", color: "#2c4a8a", label: "Done" },
  delivered: { bg: "rgba(134,180,134,0.12)", color: "#3a7a3a", label: "Delivered" },
};

const QUICK_ACTIONS = [
  { icon: "◈", label: "Book Treatment", to: "/patient/booking", desc: "Schedule a new session" },
  { icon: "◇", label: "My Bookings", to: "/patient/my-bookings", desc: "View & manage bookings" },
  { icon: "✦", label: "Shop Products", to: "/patient/products", desc: "Browse skincare range" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-[11px] tracking-[0.1em] uppercase text-[#b87c5a] mb-1">{eyebrow}</p>
        <h2
          className="text-xl font-normal text-[#2c1f1a]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function BadgeLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-xs px-4 py-1.5 rounded-full bg-[rgba(184,124,90,0.1)] text-[#8b4c34] transition-all hover:opacity-80"
    >
      {children}
    </Link>
  );
}

function StatusBadge({ status }) {
  const st = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full shrink-0"
      style={{ background: st.bg, color: st.color }}
    >
      {st.label}
    </span>
  );
}

function ItemIcon({ icon }) {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 bg-[rgba(184,124,90,0.12)] text-[#b87c5a]">
      {icon}
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <span className="text-3xl opacity-20 text-[#b87c5a]">{icon}</span>
      <p className="text-sm text-[#c0a090]">{text}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function PatientDashboardPage() {
  const { user } = useAuth();
  const { bookings, fetchBookings, isLoading } = useBooking();

  const firstName = user?.full_name?.split(" ")[0] ?? "there";
  const greeting = getGreeting();

  useEffect(() => {
    fetchBookings();
  }, []);

  // ── Derived stats dari bookings API ──────────────────────────────────────
  const upcomingBookings = bookings
    .filter(b => ["pending", "confirmed"].includes(b.status))
    .slice(0, 3);

  const sessionsDone = bookings.filter(b => b.status === "done").length;

  const nextBooking = bookings
    .filter(b => ["pending", "confirmed"].includes(b.status))
    .sort((a, b) => new Date(a.booked_date) - new Date(b.booked_date))[0];

  const nextVisitLabel = nextBooking
    ? (() => {
      const diff = Math.ceil((new Date(nextBooking.booked_date) - new Date()) / 86400000);
      return diff <= 0 ? "Today" : `${diff}d`;
    })()
    : "—";

  const SKIN_STATS = [
    { label: "Sessions", value: isLoading ? "…" : String(sessionsDone) },
    { label: "Orders", value: "—" },
    { label: "Next Visit", value: isLoading ? "…" : nextVisitLabel },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
      `}</style>

      <div className="min-h-screen bg-[#faf8f5] text-[#2c1f1a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* ── Greeting ── */}
          <div className="mb-10">
            <p className="text-[11px] tracking-[0.1em] uppercase text-[#b87c5a] mb-1">
              {greeting}
            </p>
            <h1
              className="text-4xl lg:text-5xl font-normal leading-tight text-[#2c1f1a]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Welcome back,{" "}
              <em className="italic text-[#b87c5a]">{firstName}</em>
            </h1>
            <p className="text-sm mt-2 text-[#9a6e62]">
              Here's what's happening with your skin journey.
            </p>
          </div>

          {/* ── Skin Journey Banner ── */}
          <div
            className="relative rounded-3xl p-8 mb-8 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #f0ddd0, #e8c9b0)" }}
          >
            <div
              className="absolute top-4 right-8 text-7xl opacity-10 select-none text-[#7a3e22]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              ✦
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[11px] tracking-[0.1em] uppercase text-[#8b4c34] mb-2">
                  Your Skin Journey
                </p>
                <p
                  className="text-lg font-medium text-[#2c1208]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {isLoading ? "Loading…" : `${sessionsDone} session${sessionsDone !== 1 ? "s" : ""} completed`}
                </p>
                <p className="text-sm mt-1 text-[#6b4030]">
                  You're doing great — consistency is key to glowing skin.
                </p>
              </div>

              <div className="flex gap-6">
                {SKIN_STATS.map((s) => (
                  <div key={s.label} className="text-center">
                    <div
                      className="text-2xl font-semibold text-[#2c1208]"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {s.value}
                    </div>
                    <div className="text-xs mt-0.5 text-[#7a5040]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="group p-6 rounded-2xl border border-[rgba(184,124,90,0.12)] bg-white transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="text-2xl text-[#b87c5a] mb-3">{a.icon}</div>
                <div className="text-sm font-medium text-[#2c1f1a] mb-0.5">{a.label}</div>
                <div className="text-xs text-[#9a6e62]">{a.desc}</div>
              </Link>
            ))}
          </div>

          {/* ── Cards Grid ── */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Upcoming Bookings */}
            <div className="rounded-2xl p-7 bg-white border border-[rgba(184,124,90,0.12)]">
              <SectionHeader
                eyebrow="Coming Up"
                title="Bookings"
                action={<BadgeLink to="/patient/my-bookings">View all</BadgeLink>}
              />

              {isLoading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-16 rounded-xl bg-[rgba(184,124,90,0.06)] animate-pulse" />
                  ))}
                </div>
              ) : upcomingBookings.length === 0 ? (
                <EmptyState icon="◈" text="No upcoming bookings" />
              ) : (
                <div className="flex flex-col gap-4">
                  {upcomingBookings.map((b) => (
                    <div key={b.booking_id} className="flex items-start gap-4 p-4 rounded-xl bg-[#faf8f5]">
                      <ItemIcon icon="✦" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-[#2c1f1a] truncate">
                            {b.service?.service_name ?? "—"}
                          </p>
                          <StatusBadge status={b.status} />
                        </div>
                        <p className="text-xs mt-0.5 text-[#9a6e62]">
                          dr. {b.doctor?.user?.full_name ?? "—"}
                        </p>
                        <p className="text-xs mt-1 font-medium text-[#b87c5a]">
                          {new Date(b.booked_date).toLocaleDateString("id-ID",
                            { weekday: "short", day: "numeric", month: "short", year: "numeric" })} .
                          {b.start_time ?? b.doctorSchedule?.start_time ?? ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders — masih static, akan diupdate saat Order API tersedia */}
            <div className="rounded-2xl p-7 bg-white border border-[rgba(184,124,90,0.12)]">
              <SectionHeader
                eyebrow="Recent"
                title="Orders"
                action={<BadgeLink to="/patient/order">View all</BadgeLink>}
              />
              <EmptyState icon="◇" text="No orders yet" />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default PatientDashboardPage;