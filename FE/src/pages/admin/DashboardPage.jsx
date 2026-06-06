import { useState, useEffect, useCallback } from "react";
import { getDashboardStats, getDashboardActivity } from "../../api/adminApi";

// ── Helpers ───────────────────────────────────────────────────────────────────
// Format angka ke format rupiah singkat (48200000 → "Rp 48.2jt")
function formatRupiah(val) {
    if (!val) return "Rp 0";
    if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}jt`;
    if (val >= 1_000)     return `Rp ${(val / 1_000).toFixed(0)}rb`;
    return `Rp ${val}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

// Skeleton loader — dipakai saat data belum tersedia
function Skeleton({ className = "" }) {
    return (
        <div
            className={`animate-pulse rounded-xl ${className}`}
            style={{ background: "rgba(184,124,90,0.08)" }}
        />
    );
}

// Stat card — summary angka di bagian atas
function StatCard({ icon, label, value, delta, up, loading }) {
    return (
        <div
            className="p-6 rounded-2xl transition-all hover:-translate-y-0.5 duration-200"
            style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}
        >
            <div className="flex items-start justify-between mb-3">
                <span className="text-xl" style={{ color: "#b87c5a" }}>{icon}</span>
                {loading ? <Skeleton className="w-12 h-5" /> : (
                    <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                            background: up ? "rgba(106,154,106,0.12)" : "rgba(200,80,80,0.08)",
                            color:      up ? "#3a7a3a"                 : "#9a3030",
                        }}
                    >
                        {up ? "▲" : "▼"} {delta}
                    </span>
                )}
            </div>
            {loading
                ? <Skeleton className="w-24 h-7 mb-2" />
                : <p className="text-2xl font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}>{value}</p>
            }
            <p className="text-xs mt-1" style={{ color: "#9a6e62" }}>{label}</p>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
    const [stats,        setStats]        = useState(null);
    const [activity,     setActivity]     = useState({ data: [], page: 1, last_page: 1, total: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingAct,   setLoadingAct]   = useState(true);
    const [actPage,      setActPage]      = useState(1);
    const [hoveredBar,   setHoveredBar]   = useState(null);
    const [error,        setError]        = useState(null);

    // ── Fetch stats saat mount ────────────────────────────────────────────
    useEffect(() => {
        const run = async () => {
            setLoadingStats(true);
            try {
                const res  = await getDashboardStats();
                const data = res.data?.data ?? res.data;
                setStats(data);
            } catch {
                setError("Gagal memuat data dashboard.");
            } finally {
                setLoadingStats(false);
            }
        };
        run();
    }, []);

    // ── Fetch activity saat page berubah ──────────────────────────────────
    const fetchActivity = useCallback(async (page) => {
        setLoadingAct(true);
        try {
            const res  = await getDashboardActivity(page);
            const data = res.data?.data ?? res.data;
            setActivity(data);
        } catch {
            setError("Gagal memuat recent activity.");
        } finally {
            setLoadingAct(false);
        }
    }, []);

    useEffect(() => { fetchActivity(actPage); }, [actPage, fetchActivity]);

    // ── Derived values ────────────────────────────────────────────────────
    const summary         = stats?.summary         ?? {};
    const revenue         = stats?.revenue         ?? {};
    const monthlyRevenue  = stats?.monthly_revenue ?? [];
    const byService       = stats?.bookings_by_service ?? [];
    const topDoctors      = stats?.top_doctors     ?? [];
    const maxRev          = Math.max(...monthlyRevenue.map((m) => m.value), 1);

    const STAT_CARDS = [
        { icon: "✦", label: "Total Bookings",  value: summary.total_bookings ?? "—", delta: `${stats?.booking_stats?.pending ?? 0} pending`,  up: true  },
        { icon: "◈", label: "Active Doctors",  value: summary.total_doctors  ?? "—", delta: "active",                                           up: true  },
        { icon: "◇", label: "Products Listed", value: summary.total_products ?? "—", delta: "in catalog",                                       up: true  },
        { icon: "◉", label: "Revenue (Month)", value: formatRupiah(revenue.this_month), delta: `total ${formatRupiah(revenue.total)}`,           up: true  },
    ];

    return (
        <div className="min-h-screen" style={{ background: "#faf8f5", color: "#2c1f1a" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');`}</style>

            <div className="max-w-6xl mx-auto px-6 py-10">

                {/* ── Header ── */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Admin Panel</p>
                        <h1 className="text-4xl lg:text-5xl font-normal leading-tight"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#2c1f1a" }}>
                            Clinic <span className="italic" style={{ color: "#b87c5a" }}>Overview</span>
                        </h1>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-xs"
                        style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34", border: "1px solid rgba(184,124,90,0.15)" }}>
                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#6a9a6a" }} />
                        Live · {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    </div>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {STAT_CARDS.map((s) => (
                        <StatCard key={s.label} {...s} loading={loadingStats} />
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-6">

                    {/* ── Revenue Chart ── */}
                    <div className="lg:col-span-2 rounded-2xl p-7"
                        style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Analytics</p>
                                <h2 className="text-xl font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Monthly Revenue</h2>
                            </div>
                            <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34" }}>
                                {new Date().getFullYear()}
                            </span>
                        </div>

                        {loadingStats ? (
                            <Skeleton className="h-36 w-full" />
                        ) : (
                            <div className="flex items-end gap-1 h-36 relative">
                                {[0.25, 0.5, 0.75, 1].map((f) => (
                                    <div key={f} className="absolute left-0 right-0"
                                        style={{ bottom: `${f * 100}%`, borderTop: "1px dashed rgba(184,124,90,0.1)" }} />
                                ))}
                                {monthlyRevenue.map((m, i) => {
                                    const pct   = (m.value / maxRev) * 100;
                                    const isHov = hoveredBar === i;
                                    const isCur = i === new Date().getMonth();
                                    return (
                                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1 relative cursor-default"
                                            onMouseEnter={() => setHoveredBar(i)}
                                            onMouseLeave={() => setHoveredBar(null)}>
                                            {isHov && (
                                                <div className="absolute text-xs px-2 py-1 rounded-lg pointer-events-none z-10"
                                                    style={{ bottom: `calc(${pct}% + 30px)`, background: "#2c1f1a", color: "#faf8f5", whiteSpace: "nowrap" }}>
                                                    {formatRupiah(m.value)}
                                                </div>
                                            )}
                                            <div className="w-full rounded-t-lg transition-all duration-200"
                                                style={{
                                                    height: `${Math.max(pct, 3)}%`,
                                                    background: isCur
                                                        ? "linear-gradient(180deg, #c4865f, #a0613e)"
                                                        : isHov ? "rgba(184,124,90,0.5)" : "rgba(184,124,90,0.2)",
                                                    minHeight: "4px",
                                                }} />
                                            <span className="text-xs" style={{ color: isCur ? "#b87c5a" : "#c0a090", fontWeight: isCur ? 600 : 400 }}>
                                                {m.month}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ── Bookings by Service ── */}
                    <div className="rounded-2xl p-7" style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}>
                        <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Breakdown</p>
                        <h2 className="text-xl font-normal mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>By Service</h2>

                        {loadingStats ? (
                            <div className="flex flex-col gap-4">
                                {[1,2,3,4].map((k) => <Skeleton key={k} className="h-10 w-full" />)}
                            </div>
                        ) : byService.length === 0 ? (
                            <p className="text-sm text-[#9a6e62]">No booking data yet.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {byService.map((s, i) => (
                                    <div key={s.name}>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-xs truncate pr-2" style={{ color: "#5a3e35" }}>{s.name}</span>
                                            <span className="text-xs font-semibold shrink-0" style={{ color: "#b87c5a" }}>{s.pct}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full" style={{ background: "rgba(184,124,90,0.12)" }}>
                                            <div className="h-full rounded-full"
                                                style={{
                                                    width: `${s.pct}%`,
                                                    background: i === 0
                                                        ? "linear-gradient(90deg, #c4865f, #a0613e)"
                                                        : `rgba(184,124,90,${0.7 - i * 0.12})`,
                                                    transition: "width 0.6s ease",
                                                }} />
                                        </div>
                                        <p className="text-xs mt-1" style={{ color: "#c0a090" }}>{s.count} bookings</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">

                    {/* ── Recent Activity ── */}
                    <div className="lg:col-span-2 rounded-2xl p-7" style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Live Feed</p>
                                <h2 className="text-xl font-normal" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Recent Activity</h2>
                            </div>
                            {/* Total count */}
                            <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34" }}>
                                {activity.total} items
                            </span>
                        </div>

                        {/* Activity list */}
                        <div className="flex flex-col min-h-[220px]">
                            {loadingAct ? (
                                <div className="flex flex-col gap-3">
                                    {[1,2,3,4,5,6].map((k) => <Skeleton key={k} className="h-12 w-full" />)}
                                </div>
                            ) : activity.data.length === 0 ? (
                                <p className="text-sm text-[#9a6e62]">No activity yet.</p>
                            ) : activity.data.map((a, i) => (
                                <div key={i} className="flex items-start gap-4 py-3"
                                    style={{ borderBottom: i < activity.data.length - 1 ? "1px solid rgba(184,124,90,0.07)" : "none" }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5"
                                        style={{ background: `${a.color}18`, color: a.color }}>
                                        {a.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold" style={{ color: a.color }}>{a.title}</p>
                                        <p className="text-sm mt-0.5 truncate" style={{ color: "#3a2520" }}>{a.desc}</p>
                                    </div>
                                    <span className="text-xs shrink-0 mt-0.5" style={{ color: "#c0a090" }}>{a.time}</span>
                                </div>
                            ))}
                        </div>

                        {/* ── Pagination ── */}
                        {activity.last_page > 1 && (
                            <div className="flex items-center justify-between mt-5 pt-4"
                                style={{ borderTop: "1px solid rgba(184,124,90,0.1)" }}>
                                <span className="text-xs" style={{ color: "#9a6e62" }}>
                                    Page {activity.page} of {activity.last_page}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setActPage((p) => Math.max(1, p - 1))}
                                        disabled={actPage === 1}
                                        className="px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-30"
                                        style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34", border: "1px solid rgba(184,124,90,0.15)" }}
                                    >
                                        ← Prev
                                    </button>
                                    <button
                                        onClick={() => setActPage((p) => Math.min(activity.last_page, p + 1))}
                                        disabled={actPage === activity.last_page}
                                        className="px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-30"
                                        style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34", border: "1px solid rgba(184,124,90,0.15)" }}
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Top Doctors ── */}
                    <div className="rounded-2xl p-7" style={{ background: "#fff", border: "1px solid rgba(184,124,90,0.12)" }}>
                        <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b87c5a" }}>Performance</p>
                        <h2 className="text-xl font-normal mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Top Doctors</h2>

                        {loadingStats ? (
                            <div className="flex flex-col gap-4">
                                {[1,2,3].map((k) => <Skeleton key={k} className="h-12 w-full" />)}
                            </div>
                        ) : topDoctors.length === 0 ? (
                            <p className="text-sm text-[#9a6e62]">No doctor data yet.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {topDoctors.map((d, i) => (
                                    <div key={d.name} className="flex items-center gap-3">
                                        <span className="text-sm font-semibold w-5 shrink-0"
                                            style={{ color: i === 0 ? "#b87c5a" : "#c0a090", fontFamily: "'Playfair Display', Georgia, serif" }}>
                                            {i + 1}
                                        </span>
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                                            style={{ background: "linear-gradient(135deg, #e8c9b0, #d4a882)", color: "#5a2e12" }}>
                                            {d.initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate" style={{ color: "#2c1f1a" }}>dr. {d.name}</p>
                                            <p className="text-xs" style={{ color: "#9a6e62" }}>{d.sessions} sessions · {d.specialization}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <a href="/admin/doctors" className="py-2.5 rounded-xl text-xs text-center transition hover:opacity-80"
                                style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34" }}>
                                Manage Doctors
                            </a>
                            <a href="/admin/services" className="py-2.5 rounded-xl text-xs text-center transition hover:opacity-80"
                                style={{ background: "rgba(184,124,90,0.08)", color: "#8b4c34" }}>
                                Manage Services
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}