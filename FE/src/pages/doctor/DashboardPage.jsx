import { useAuth } from "../../contexts/AuthContext";

// ── Constants ─────────────────────────────────────────────────────────────────

const TODAY_SCHEDULE = [
  { id: 1, time: "09:00", patient: "Sari Widyastuti",  service: "Facial Treatment",    status: "done",      duration: "60 min" },
  { id: 2, time: "10:30", patient: "Dian Rahayu",      service: "Skin Consultation",   status: "done",      duration: "30 min" },
  { id: 3, time: "13:00", patient: "Putri Amelia",     service: "Laser Therapy",       status: "confirmed", duration: "45 min" },
  { id: 4, time: "14:30", patient: "Reni Kusumawati",  service: "Aesthetic Injection", status: "confirmed", duration: "30 min" },
  { id: 5, time: "16:00", patient: "Mega Lestari",     service: "Facial Treatment",    status: "pending",   duration: "60 min" },
];

const UPCOMING_DAYS = [
  { date: "Tue, 3 Jun", count: 4 },
  { date: "Wed, 4 Jun", count: 6 },
  { date: "Thu, 5 Jun", count: 3 },
  { date: "Fri, 6 Jun", count: 5 },
];

const WEEKLY_STATS = [
  { day: "Mon", sessions: 5 },
  { day: "Tue", sessions: 7 },
  { day: "Wed", sessions: 4 },
  { day: "Thu", sessions: 8 },
  { day: "Fri", sessions: 6 },
  { day: "Sat", sessions: 3 },
  { day: "Sun", sessions: 0 },
];

const STATUS_STYLES = {
  done:      { bg: "rgba(134,180,134,0.12)", color: "#3a7a3a", label: "Done"      },
  confirmed: { bg: "rgba(184,124,90,0.12)",  color: "#8b4c34", label: "Confirmed" },
  pending:   { bg: "rgba(200,180,80,0.12)",  color: "#7a6010", label: "Pending"   },
  cancelled: { bg: "rgba(200,80,80,0.1)",    color: "#9a3030", label: "Cancelled" },
};

const STAT_CARDS = (todayCount, doneCount, pendingCount) => [
  { icon: "✦", label: "Today's Sessions", value: todayCount, sub: `${doneCount} completed`  },
  { icon: "◈", label: "Remaining",        value: pendingCount, sub: "appointments left"      },
  { icon: "◉", label: "This Week",        value: "33",         sub: "total sessions"         },
  { icon: "◇", label: "Patient Rating",   value: "4.9",        sub: "from 128 reviews"       },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MAX_SESSIONS = Math.max(...WEEKLY_STATS.map((d) => d.sessions));

// ── Helpers ───────────────────────────────────────────────────────────────────

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getTodayDayName = () => DAY_NAMES[new Date().getDay()];

const getFirstNextIndex = (schedule) =>
  schedule.findIndex((s) => s.status !== "done");

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub }) {
  return (
    <div
      className="p-6 rounded-2xl"
      style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}
    >
      <span className="text-xl" style={{ color: "#b87c5a" }}>{icon}</span>
      <p
        className="text-3xl font-normal mt-3"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
      >
        {value}
      </p>
      <p className="text-xs mt-0.5" style={{ color: "#9a6e62" }}>{label}</p>
      <p className="text-xs mt-1" style={{ color: "#c0a090" }}>{sub}</p>
    </div>
  );
}

function ScheduleRow({ item, isNext }) {
  const st = STATUS_STYLES[item.status];

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl transition-all"
      style={{
        background: isNext ? "rgba(184,124,90,0.06)" : "#faf8f5",
        border:     isNext ? "1px solid rgba(184,124,90,0.2)" : "1px solid transparent",
      }}
    >
      {/* Time */}
      <div className="w-14 shrink-0 text-right">
        <p className="text-sm font-semibold" style={{ color: "#b87c5a" }}>{item.time}</p>
        <p className="text-xs mt-0.5" style={{ color: "#c0a090" }}>{item.duration}</p>
      </div>

      {/* Divider */}
      <div className="w-px self-stretch" style={{ background: "rgba(184,124,90,0.15)" }} />

      {/* Patient info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "#2c1f1a" }}>{item.patient}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: "#9a6e62" }}>{item.service}</p>
      </div>

      {isNext && (
        <span
          className="text-xs px-2 py-0.5 rounded-full shrink-0"
          style={{ background: "rgba(184,124,90,0.15)", color: "#8b4c34" }}
        >
          Up next
        </span>
      )}

      <span
        className="text-xs px-2.5 py-0.5 rounded-full shrink-0"
        style={{ background: st.bg, color: st.color }}
      >
        {st.label}
      </span>

      {item.status !== "done" && (
        <a
          href="/doctor/records"
          title="Open record"
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs transition hover:opacity-70"
          style={{ background: "rgba(184,124,90,0.1)", color: "#b87c5a" }}
        >
          →
        </a>
      )}
    </div>
  );
}

function WeeklyChart() {
  const todayDay = getTodayDayName();

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}
    >
      <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>This Week</p>
      <h3
        className="text-lg font-normal mb-5"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
      >
        Sessions
      </h3>
      <div className="flex items-end gap-1.5 h-24">
        {WEEKLY_STATS.map((d) => {
          const pct     = MAX_SESSIONS > 0 ? (d.sessions / MAX_SESSIONS) * 100 : 0;
          const isToday = d.day === todayDay;
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs" style={{ color: "#c0a090" }}>{d.sessions || ""}</span>
              <div
                className="w-full rounded-t-lg transition-all"
                style={{
                  height:    `${Math.max(pct, 4)}%`,
                  minHeight: "4px",
                  background: isToday
                    ? "linear-gradient(180deg, #c4865f, #a0613e)"
                    : "rgba(184,124,90,0.2)",
                }}
              />
              <span
                className="text-xs"
                style={{ color: isToday ? "#b87c5a" : "#c0a090", fontWeight: isToday ? 600 : 400 }}
              >
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UpcomingDays() {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}
    >
      <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Coming Up</p>
      <h3
        className="text-lg font-normal mb-4"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
      >
        Next Days
      </h3>
      <div className="flex flex-col gap-2.5">
        {UPCOMING_DAYS.map((u) => (
          <div key={u.date} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "#5a3e35" }}>{u.date}</span>
            <div className="flex items-center gap-2">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width:      `${u.count * 8}px`,
                  maxWidth:   "64px",
                  background: "rgba(184,124,90,0.3)",
                }}
              />
              <span className="text-xs font-medium" style={{ color: "#b87c5a" }}>{u.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function DoctorDashboardPage() {
  const { user } = useAuth();

  const firstName    = user?.name?.split(" ")[0] ?? "Doctor";
  const greeting     = getGreeting();
  const doneCount    = TODAY_SCHEDULE.filter((s) => s.status === "done").length;
  const pendingCount = TODAY_SCHEDULE.filter((s) => s.status !== "done").length;
  const nextIndex    = getFirstNextIndex(TODAY_SCHEDULE);
  const statCards    = STAT_CARDS(TODAY_SCHEDULE.length, doneCount, pendingCount);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');
      `}</style>

      <div className="min-h-screen" style={{ background: "#faf8f5", color: "#2c1f1a" }}>
        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>
                {greeting}
              </p>
              <h1
                className="text-4xl lg:text-5xl font-normal leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
              >
                Dr. <span className="italic" style={{ color: "#b87c5a" }}>{firstName}</span>
              </h1>
              <p className="text-sm mt-1" style={{ color: "#9a6e62" }}>
                Here's your practice overview for today.
              </p>
            </div>
            <a
              href="/doctor/records"
              className="self-start md:self-auto text-sm px-5 py-2.5 rounded-full transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #c4865f, #a0613e)", color: "#fff" }}
            >
              ✦ Patient Records
            </a>
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── Today's Schedule ── */}
            <div
              className="lg:col-span-2 rounded-2xl p-7"
              style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Today</p>
                  <h2
                    className="text-xl font-normal"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}
                  >
                    Schedule
                  </h2>
                </div>
                <span
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34" }}
                >
                  {TODAY_SCHEDULE.length} appointments
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {TODAY_SCHEDULE.map((item, i) => (
                  <ScheduleRow key={item.id} item={item} isNext={i === nextIndex} />
                ))}
              </div>
            </div>

            {/* ── Right Column ── */}
            <div className="flex flex-col gap-5">
              <WeeklyChart />
              <UpcomingDays />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default DoctorDashboardPage;
