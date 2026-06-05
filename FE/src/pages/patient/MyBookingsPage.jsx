import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBooking } from "../../contexts/BookingContext";

// ── Constants ─────────────────────────────────────────────────────────────────

const FILTERS = ["All", "Pending", "Confirmed", "Done", "Cancelled"];

const STATUS_STYLES = {
    confirmed: { bg: "rgba(134,180,134,0.12)", color: "#3a7a3a", label: "Confirmed" },
    pending: { bg: "rgba(184,124,90,0.12)", color: "#8b4c34", label: "Pending" },
    cancelled: { bg: "rgba(200,80,80,0.1)", color: "#9a3030", label: "Cancelled" },
    done: { bg: "rgba(90,120,180,0.1)", color: "#2c4a8a", label: "Done" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
    const st = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
    return (
        <span
            className="text-xs px-2.5 py-0.5 rounded-full shrink-0 font-medium"
            style={{ background: st.bg, color: st.color }}
        >
            {st.label}
        </span>
    );
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MyBookingsPage() {
    const { bookings, fetchBookings, updateBookingStatus, isLoading, error } = useBooking();
    const [activeFilter, setActiveFilter] = useState("All");
    const [cancelling, setCancelling] = useState(null); // booking_id being cancelled
    const [confirmId, setConfirmId] = useState(null); // booking_id awaiting confirm dialog

    useEffect(() => { fetchBookings(); }, []);

    // Filter bookings by status
    const filtered = activeFilter === "All"
        ? bookings
        : bookings.filter(b => b.status === activeFilter.toLowerCase());

    // Cancel is allowed only for pending/confirmed, and no payment yet
    const canCancel = (b) => ["pending", "confirmed"].includes(b.status);

    const handleCancelConfirm = async () => {
        if (!confirmId) return;
        setCancelling(confirmId);
        setConfirmId(null);
        await updateBookingStatus(confirmId, "cancelled");
        setCancelling(null);
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
      `}</style>

            <div className="min-h-screen bg-[#faf8f5] text-[#2c1f1a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <div className="max-w-4xl mx-auto px-6 py-10">

                    {/* ── Header ── */}
                    <div className="mb-8">
                        <p className="text-[11px] tracking-[0.1em] uppercase text-[#b87c5a] mb-1">Patient Portal</p>
                        <h1
                            className="text-4xl font-normal text-[#2c1f1a]"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            My <em className="italic text-[#b87c5a]">Bookings</em>
                        </h1>
                        <p className="text-sm mt-2 text-[#9a6e62]">
                            Manage and track all your clinic appointments.
                        </p>
                    </div>

                    {/* ── Action bar ── */}
                    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                        {/* Filter pills */}
                        <div className="flex gap-2 flex-wrap">
                            {FILTERS.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className="px-4 py-1.5 rounded-full text-xs tracking-wide transition-all duration-200 border"
                                    style={{
                                        background: activeFilter === f ? "#b87c5a" : "transparent",
                                        color: activeFilter === f ? "#fff" : "#5a3e35",
                                        borderColor: activeFilter === f ? "#b87c5a" : "rgba(184,124,90,0.25)",
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* New booking CTA */}
                        <Link
                            to="/patient/booking"
                            className="flex items-center gap-1.5 px-5 py-2 rounded-full text-white text-xs tracking-wide transition-all duration-200 hover:opacity-90"
                            style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)" }}
                        >
                            + New Booking
                        </Link>
                    </div>

                    {/* ── Error ── */}
                    {error && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-5">
                            {error}
                        </div>
                    )}

                    {/* ── Loading skeleton ── */}
                    {isLoading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-28 rounded-2xl bg-[rgba(184,124,90,0.06)] animate-pulse" />
                            ))}
                        </div>

                        /* ── Empty state ── */
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <span className="text-5xl opacity-20 text-[#b87c5a]">◈</span>
                            <p className="text-sm text-[#c0a090]">
                                {activeFilter === "All" ? "No bookings yet." : `No ${activeFilter.toLowerCase()} bookings.`}
                            </p>
                            <Link
                                to="/patient/booking"
                                className="mt-2 px-6 py-2.5 rounded-full text-white text-xs tracking-wide hover:opacity-90 transition"
                                style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)" }}
                            >
                                Book a Treatment
                            </Link>
                        </div>

                        /* ── Booking list ── */
                    ) : (
                        <div className="flex flex-col gap-4">
                            {filtered.map(b => (
                                <div
                                    key={b.booking_id}
                                    className="rounded-2xl bg-white border border-[rgba(184,124,90,0.12)] p-6 transition-all duration-200 hover:border-[rgba(184,124,90,0.25)]"
                                    style={{ boxShadow: "0 2px 12px rgba(150,80,40,0.04)" }}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                                        {/* Icon */}
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 bg-[rgba(184,124,90,0.1)] text-[#b87c5a]">
                                            ✦
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <p className="text-sm font-medium text-[#2c1f1a]">
                                                    {b.service?.service_name ?? "—"}
                                                </p>
                                                <StatusBadge status={b.status} />
                                            </div>

                                            <p className="text-xs text-[#9a6e62] mb-2">
                                                dr. {b.doctor?.user?.full_name ?? "—"}
                                                {b.doctor?.specialization?.spec_name
                                                    ? ` · ${b.doctor.specialization.spec_name}`
                                                    : ""}
                                            </p>

                                            <div className="flex flex-wrap gap-4 text-xs">
                                                <span className="flex items-center gap-1.5 text-[#b87c5a] font-medium">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" />
                                                        <path d="M16 2v4M8 2v4M3 10h18" />
                                                    </svg>
                                                    {formatDate(b.booked_date)}
                                                </span>
                                                {b.schedule?.start_time && (
                                                    <span className="flex items-center gap-1.5 text-[#9a6e62]">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <path d="M12 6v6l4 2" />
                                                        </svg>
                                                        {b.schedule.start_time} – {b.schedule.end_time}
                                                    </span>
                                                )}
                                                {b.notes && (
                                                    <span className="text-[#c0a090] italic truncate max-w-xs">
                                                        "{b.notes}"
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {canCancel(b) && (
                                                <button
                                                    onClick={() => setConfirmId(b.booking_id)}
                                                    disabled={cancelling === b.booking_id}
                                                    className="px-4 py-1.5 rounded-full text-xs border transition-all duration-200 disabled:opacity-50"
                                                    style={{
                                                        borderColor: "rgba(200,80,80,0.3)",
                                                        color: "#9a3030",
                                                        background: "rgba(200,80,80,0.05)",
                                                    }}
                                                >
                                                    {cancelling === b.booking_id ? "Cancelling…" : "Cancel"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Cancel Confirm Dialog ── */}
                {confirmId && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center px-6"
                        style={{ background: "rgba(44,31,26,0.4)", backdropFilter: "blur(4px)" }}
                    >
                        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl bg-[rgba(200,80,80,0.08)] text-red-400">
                                    ✕
                                </div>
                                <h3
                                    className="text-xl font-normal text-[#2c1f1a] mb-2"
                                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                                >
                                    Cancel Booking?
                                </h3>
                                <p className="text-sm text-[#9a6e62]">
                                    This action cannot be undone. Your appointment slot will be released.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmId(null)}
                                    className="flex-1 py-2.5 rounded-xl text-sm border border-[rgba(184,124,90,0.25)] text-[#5a3e35] hover:bg-[rgba(184,124,90,0.05)] transition"
                                >
                                    Keep It
                                </button>
                                <button
                                    onClick={handleCancelConfirm}
                                    className="flex-1 py-2.5 rounded-xl text-sm text-white transition hover:opacity-90"
                                    style={{ background: "linear-gradient(135deg, #c85050, #8b3030)" }}
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}