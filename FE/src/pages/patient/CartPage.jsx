import { Link } from "react-router-dom";

// ── CartPage — Coming Soon ────────────────────────────────────────────────
// [NOTE] Cart & product purchase flow dipindahkan ke fase berikutnya.
//        Fokus saat ini: booking consultation + payment via Midtrans.
//        Halaman ini ditampilkan sebagai placeholder agar route /patient/cart
//        tidak 404 dan user mendapat feedback yang jelas.
export default function CartPage() {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');`}</style>

      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#faf8f5]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="text-center max-w-sm w-full">

          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl"
            style={{ background: "rgba(184,124,90,0.08)", color: "#c4a882" }}
          >
            ◇
          </div>

          {/* Badge */}
          <span
            className="inline-block px-3 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase font-medium mb-4"
            style={{ background: "rgba(184,124,90,0.1)", color: "#8b4c34" }}
          >
            Coming Soon
          </span>

          <h1
            className="text-3xl font-normal text-[#2c1f1a] mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Product <em className="italic text-[#b87c5a]">Shop</em>
          </h1>

          <p className="text-sm text-[#9a6e62] mb-8 leading-relaxed">
            Clinic-grade skincare products will be available here soon.
            For now, you can book your consultation and we'll take care of the rest.
          </p>

          <Link
            to="/patient/booking"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white text-sm tracking-wide transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #c4865f, #9a5030)" }}
          >
            Book a Consultation →
          </Link>

          <div className="mt-4">
            <Link
              to="/patient/dashboard"
              className="text-xs text-[#b0907e] hover:text-[#b87c5a] transition"
            >
              ← Back to Dashboard
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}