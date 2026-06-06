import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBooking } from "../../contexts/BookingContext";

// ── Constants ─────────────────────────────────────────────────────────────────

const FILTERS = ["All", "Pending", "Confirmed", "Done", "Cancelled"];

const STATUS_STYLES = {
  confirmed:   { bg: "rgba(134,180,134,0.12)", color: "#3a7a3a", label: "Confirmed"   },
  pending:     { bg: "rgba(184,124,90,0.12)",  color: "#8b4c34", label: "Pending"     },
  in_progress: { bg: "rgba(90,120,180,0.1)",   color: "#2c4a8a", label: "In Progress" },
  completed:   { bg: "rgba(90,120,180,0.1)",   color: "#2c4a8a", label: "Done"        },
  cancelled:   { bg: "rgba(200,80,80,0.1)",    color: "#9a3030", label: "Cancelled"   },
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
  return d.toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

// ── ContactAdminSheet ─────────────────────────────────────────────────────────
// [NOTE] Menggantikan cancel dialog — patient tidak bisa cancel sendiri.
//        Tampilkan bottom sheet dengan instruksi hubungi admin.
//        bookingRef: order_number atau booking_id untuk disertakan saat kontak admin.
function ContactAdminSheet({ booking, onClose }) {
  if (!booking) return null;
  const ref = booking.booking_id ?? booking.id;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      style={{ background: "rgba(44,31,26,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
            style={{ background: "rgba(184,124,90,0.1)", color: "#b87c5a" }}
          >
            ✦
          </div>
          <h3
            className="text-xl font-normal text-[#2c1f1a] mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Need to Cancel?
          </h3>
          <p className="text-sm text-[#9a6e62]">
            To cancel your appointment, please contact our admin team directly.
            We'll process your request as soon as possible.
          </p>
        </div>

        {/* Booking reference */}
        <div
          className="rounded-xl px-4 py-3 mb-6 text-center"
          style={{ background: "rgba(184,124,90,0.06)", border: "1px solid rgba(184,124,90,0.15)" }}
        >
          <p className="text-[11px] uppercase tracking-widest text-[#b87c5a] mb-1">Booking Reference</p>
          <p className="text-sm font-medium text-[#2c1f1a]">#{ref}</p>
          <p className="text-xs text-[#9a6e62] mt-0.5">
            {booking.service?.service_name ?? "—"} · {formatDate(booking.booked_date)}
          </p>
        </div>

        {/* Contact options */}
        <div className="flex flex-col gap-2 mb-4">
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #25d366, #1aaa50)" }}
          >
            {/* WhatsApp icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.524 5.845L.057 23.07a.75.75 0 0 0 .924.924l5.224-1.467A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.502-5.24-1.38l-.374-.214-3.883 1.09 1.09-3.884-.214-.374A9.944 9.944 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
            </svg>
            Chat via WhatsApp
          </a>
          <a
            href="mailto:admin@auraclinic.id"
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition hover:bg-[rgba(184,124,90,0.04)]"
            style={{ borderColor: "rgba(184,124,90,0.25)", color: "#5a3e35" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Email Admin
          </a>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-xs text-[#9a6e62] hover:text-[#5a3e35] transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MyBookingsPage() {
  const { bookings, fetchBookings, isLoading, error } = useBooking();
  // [NOTE] updateBookingStatus dihapus dari destructure — patient tidak bisa
  //        cancel langsung. Cancel harus lewat admin (ContactAdminSheet).
  const [activeFilter, setActiveFilter]     = useState("All");
  const [contactBooking, setContactBooking] = useState(null); // booking yang ingin di-cancel

  useEffect(() => { fetchBookings(); }, []);

  // Filter bookings by status
  // [NOTE] Filter "Done" memetakan ke status "completed" dari BE
  const filtered = activeFilter === "All"
    ? bookings
    : bookings.filter(b => {
        if (activeFilter === "Done") return b.status === "completed";
        return b.status === activeFilter.toLowerCase();
      });

  // canRequestCancel: tampilkan tombol "Contact Admin to Cancel" hanya untuk
  // booking yang masih aktif (pending / confirmed / in_progress)
  const canRequestCancel = (b) =>
    ["pending", "confirmed", "in_progress"].includes(b.status);

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
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="px-4 py-1.5 rounded-full text-xs tracking-wide transition-all duration-200 border"
                  style={{
                    background:   activeFilter === f ? "#b87c5a" : "transparent",
                    color:        activeFilter === f ? "#fff" : "#5a3e35",
                    borderColor:  activeFilter === f ? "#b87c5a" : "rgba(184,124,90,0.25)",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
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
                {activeFilter === "All"
                  ? "No bookings yet."
                  : `No ${activeFilter.toLowerCase()} bookings.`}
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
                        {/* [NOTE] doctor.user relasi — jika "—" kemungkinan relasi tidak di-load di BE */}
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
                        {/* [NOTE] Relasi doctorSchedule (bukan schedule) sesuai Booking model */}
                        {(b.doctorSchedule ?? b.schedule)?.start_time && (
                          <span className="flex items-center gap-1.5 text-[#9a6e62]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </svg>
                            {(b.doctorSchedule ?? b.schedule).start_time} –{" "}
                            {(b.doctorSchedule ?? b.schedule).end_time}
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
                    {canRequestCancel(b) && (
                      <div className="flex items-center gap-2 shrink-0">
                        {/* [FIX] Bukan cancel langsung — buka ContactAdminSheet */}
                        <button
                          onClick={() => setContactBooking(b)}
                          className="px-4 py-1.5 rounded-full text-xs border transition-all duration-200"
                          style={{
                            borderColor: "rgba(184,124,90,0.3)",
                            color:       "#8b4c34",
                            background:  "rgba(184,124,90,0.06)",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Contact Admin Sheet ── */}
        {contactBooking && (
          <ContactAdminSheet
            booking={contactBooking}
            onClose={() => setContactBooking(null)}
          />
        )}
      </div>
    </>
  );
}