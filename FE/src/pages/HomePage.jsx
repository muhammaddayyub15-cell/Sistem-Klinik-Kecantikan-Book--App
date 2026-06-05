import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// ── Constants ──────────────────────────────────────────────────────────────

const NAV_LINKS = ["Services", "Doctors", "Products", "About", "Contact"];

const NAV_TARGETS = {
  Services: { type: "hash",  href: "#services" },
  Doctors:  { type: "hash",  href: "#doctors"  },
  Products: { type: "route", to: "/products"   },
  About:    { type: "route", to: "/about"      },
  Contact:  { type: "hash",  href: "#contact"  },
};

const SERVICES = [
  {
    icon: "✦",
    title: "Facial Treatment",
    desc: "Deep cleansing, brightening & rejuvenating facial therapies tailored to your skin type.",
    tag: "Most Popular",
  },
  {
    icon: "◈",
    title: "Laser Therapy",
    desc: "Advanced laser solutions for pigmentation, acne scars, and skin resurfacing.",
    tag: "Premium",
  },
  {
    icon: "◇",
    title: "Aesthetic Injection",
    desc: "Botox, filler, and skin booster treatments by certified aesthetic doctors.",
    tag: "Expert Care",
  },
  {
    icon: "◉",
    title: "Skin Consultation",
    desc: "One-on-one analysis with our dermatologists to craft your personal skin routine.",
    tag: "Free First Visit",
  },
];

const DOCTORS = [
  { name: "dr. Anisa Putri", spec: "Aesthetic Dermatologist", exp: "8 yrs",  initials: "AP" },
  { name: "dr. Ratna Sari",  spec: "Laser & Skin Expert",     exp: "6 yrs",  initials: "RS" },
  { name: "dr. Maya Dewi",   spec: "Cosmetic Physician",       exp: "10 yrs", initials: "MD" },
];

const TESTIMONIALS = [
  {
    name: "Sari W.",
    text: "After 3 sessions of laser therapy, my skin has never looked better. The team is incredibly professional.",
    rating: 5,
  },
  {
    name: "Dian R.",
    text: "I love how they personalized my treatment plan. Results were visible within just two weeks!",
    rating: 5,
  },
  {
    name: "Putri A.",
    text: "The facial treatment here is unmatched. Skin feels so soft and glowing every single time.",
    rating: 5,
  },
];

const STATS = [
  { value: "5,000+", label: "Happy Patients"   },
  { value: "12+",    label: "Expert Doctors"   },
  { value: "98%",    label: "Satisfaction Rate" },
  { value: "8 yrs",  label: "Est. Experience"  },
];

const SKIN_METRICS = ["Hydration", "Texture", "Radiance", "Clarity"];

// ── Shared class strings ───────────────────────────────────────────────────

const sectionLabelCls =
  "text-xs tracking-[0.12em] uppercase text-[#b87c5a] mb-3";

const sectionHeadingCls =
  "text-4xl lg:text-5xl font-normal text-[#2c1f1a]";

const cardCls =
  "rounded-2xl transition-all duration-300 hover:-translate-y-1 border border-[rgba(184,124,90,0.12)]";

// ── Sub-components ────────────────────────────────────────────────────────

/** Renders a <Link> for SPA routes or an <a> for hash anchors */
const NavLink = ({ label, className, onClick }) => {
  const target = NAV_TARGETS[label];
  const shared = {
    className,
    style: { color: "#5a3e35" },
    onClick,
  };
  return target.type === "route"
    ? <Link to={target.to} {...shared}>{label}</Link>
    : <a href={target.href} {...shared}>{label}</a>;
};

/** Reusable centered section header */
function SectionHeader({ label, heading }) {
  return (
    <div className="text-center mb-16">
      <p className={sectionLabelCls}>{label}</p>
      <h2
        className={sectionHeadingCls}
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {heading}
      </h2>
    </div>
  );
}

// ── Page component ────────────────────────────────────────────────────────

export default function HomePage() {
  const [menuOpen,          setMenuOpen]          = useState(false);
  const [scrolled,          setScrolled]          = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length),
      4000,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .animate-fadeIn { animation: fadeIn 0.9s ease-out both; }
      `}</style>

      <div
        className="min-h-screen font-sans bg-[#faf8f5] text-[#2c1f1a]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >

        {/* ── NAVBAR ── */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
          style={{
            background:    scrolled ? "rgba(250,248,245,0.95)" : "transparent",
            backdropFilter: scrolled ? "blur(12px)" : "none",
            borderBottom:  scrolled ? "1px solid rgba(180,140,110,0.15)" : "none",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

            {/* Brand */}
            <div className="flex items-center gap-2">
              <span className="text-2xl text-[#b87c5a]">✦</span>
              <span
                className="text-xl font-semibold tracking-wide text-[#2c1f1a]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Aura Clinic
              </span>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l}
                  label={l}
                  className="text-sm tracking-wide transition-colors duration-200 hover:opacity-60"
                />
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm px-4 py-2 rounded-full text-[#5a3e35] transition-all duration-200 hover:bg-stone-100"
              >
                Sign in
              </Link>
              <Link
                to="/login"
                className="text-sm px-5 py-2 rounded-full text-white transition-all duration-200 hover:opacity-90 bg-[#b87c5a]"
              >
                Book Now
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button className="md:hidden" onClick={() => setMenuOpen((o) => !o)}>
              <span className="text-[#5a3e35] text-[22px]">{menuOpen ? "✕" : "☰"}</span>
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div
              className="md:hidden px-6 pb-5 pt-2 flex flex-col gap-4"
              style={{ background: "rgba(250,248,245,0.98)" }}
            >
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l}
                  label={l}
                  className="text-sm"
                  onClick={() => setMenuOpen(false)}
                />
              ))}
              <Link
                to="/login"
                className="text-sm px-5 py-2 rounded-full text-white text-center bg-[#b87c5a]"
                onClick={() => setMenuOpen(false)}
              >
                Book Now
              </Link>
            </div>
          )}
        </nav>

        {/* ── HERO ── */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex items-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #fdf6ef 0%, #f7ede2 50%, #f0e0d0 100%)" }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute top-20 right-0 w-96 h-96 rounded-full opacity-30"
            style={{ background: "#e8c9b0", transform: "translate(30%, -10%)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-20"
            style={{ background: "#d4a882", transform: "translate(-30%, 30%)" }}
          />
          <div className="absolute top-1/3 right-16 text-6xl opacity-10 select-none hidden lg:block text-[#b87c5a]">✦</div>
          <div className="absolute bottom-1/3 left-1/4 text-4xl opacity-10 select-none hidden lg:block text-[#b87c5a]">◈</div>

          <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center w-full">

            {/* Left copy */}
            <div className="animate-fadeIn">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs tracking-[0.12em] uppercase mb-6 text-[#8b4c34]"
                style={{ background: "rgba(184,124,90,0.12)", border: "1px solid rgba(184,124,90,0.2)" }}
              >
                <span>✦</span> Certified Aesthetic Clinic
              </div>

              <h1
                className="text-5xl lg:text-7xl font-normal leading-tight mb-6 text-[#2c1f1a]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Radiant Skin
                <br />
                <em className="text-[#b87c5a]">Begins Here</em>
              </h1>

              <p className="text-base leading-relaxed mb-10 max-w-md text-[#6b4c40]">
                Discover personalised skincare treatments crafted by expert doctors. Your journey
                to glowing, healthy skin starts with a single consultation.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white text-sm tracking-wide transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #c4865f, #a0613e)" }}
                >
                  Book a Consultation <span>→</span>
                </Link>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm tracking-wide text-[#5a3e35] border border-[rgba(90,62,53,0.25)] transition-all duration-300 hover:bg-stone-50"
                >
                  Explore Services
                </a>
              </div>

              {/* Inline stats */}
              <div
                className="flex gap-8 mt-14 pt-8"
                style={{ borderTop: "1px solid rgba(184,124,90,0.15)" }}
              >
                {STATS.slice(0, 3).map((s) => (
                  <div key={s.label}>
                    <div
                      className="text-2xl font-semibold text-[#2c1f1a]"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {s.value}
                    </div>
                    <div className="text-xs mt-0.5 text-[#9a6e62]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — skin analysis card */}
            <div className="hidden lg:flex justify-center items-center relative">
              <div
                className="relative w-80 h-96 rounded-3xl overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, #e8c9b0, #d4a882)",
                  boxShadow: "0 30px 80px rgba(150,80,40,0.2)",
                }}
              >
                <div className="absolute inset-0 flex flex-col justify-between p-8">
                  <div className="flex justify-between items-start">
                    <span className="text-4xl opacity-30 text-[#7a3e22]">✦</span>
                    <div
                      className="px-3 py-1 rounded-full text-xs text-[#5a2e12]"
                      style={{ background: "rgba(255,255,255,0.3)", backdropFilter: "blur(8px)" }}
                    >
                      Skin Analysis
                    </div>
                  </div>

                  <div>
                    <div
                      className="w-16 h-16 rounded-full mb-4 flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.3)" }}
                    >
                      <span className="text-2xl">◉</span>
                    </div>
                    <p
                      className="text-lg font-medium mb-1 text-[#2c1208]"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      Your Skin Story
                    </p>
                    <p className="text-sm opacity-70 text-[#5a2e12]">Personalised from day one</p>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      {SKIN_METRICS.map((item) => (
                        <div
                          key={item}
                          className="rounded-xl px-3 py-2"
                          style={{ background: "rgba(255,255,255,0.25)" }}
                        >
                          <div className="text-xs text-[#4a2010]">{item}</div>
                          <div className="mt-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${65 + Math.random() * 30}%`, background: "rgba(90,30,5,0.4)" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating availability pill */}
              <div
                className="absolute -bottom-4 -left-8 px-5 py-3 rounded-2xl bg-white border border-[rgba(184,124,90,0.1)]"
                style={{ boxShadow: "0 8px 30px rgba(150,80,40,0.12)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-[#fdf0e8] text-[#b87c5a]">
                    ✦
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#2c1f1a]">Next available</div>
                    <div className="text-xs text-[#9a6e62]">Today, 14:00</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <div className="w-px h-8 bg-[rgba(184,124,90,0.3)]" />
            <span className="text-xs tracking-[0.12em] text-[#b87c5a]">SCROLL</span>
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section id="services" className="py-24 max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className={sectionLabelCls}>What We Offer</p>
              <h2
                className={sectionHeadingCls}
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Our Treatments
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#6b4c40]">
              Every treatment is customised to address your unique skin needs — guided by science,
              delivered with care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((s, i) => (
              <div
                key={s.title}
                className={`group ${cardCls} p-7 cursor-pointer ${i % 2 === 0 ? "bg-white" : "bg-[#fdf6ef]"}`}
              >
                <div className="text-3xl mb-5 text-[#b87c5a]">{s.icon}</div>
                <div
                  className="inline-block px-2.5 py-0.5 rounded-full text-xs mb-3 text-[#8b4c34]"
                  style={{ background: "rgba(184,124,90,0.1)" }}
                >
                  {s.tag}
                </div>
                <h3 className="text-base font-medium mb-2 text-[#2c1f1a]">{s.title}</h3>
                <p className="text-sm leading-relaxed text-[#7a5a52]">{s.desc}</p>
                <div className="mt-5 text-xs tracking-wide flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-[#b87c5a]">
                  Learn more <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BANNER STRIP ── */}
        <section
          className="py-16"
          style={{ background: "linear-gradient(135deg, #c4865f, #a0613e)" }}
        >
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <h2
              className="text-3xl lg:text-4xl font-normal text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Your glow is just one<br />
              <em>booking away.</em>
            </h2>
            <div className="flex items-center gap-8">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div
                    className="text-2xl font-semibold text-white"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs mt-0.5 text-white/70">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DOCTORS ── */}
        <section id="doctors" className="py-24 bg-[#fdf6ef]">
          <div className="max-w-6xl mx-auto px-6">
            <SectionHeader label="Meet The Team" heading="Expert Doctors" />

            <div className="grid md:grid-cols-3 gap-7">
              {DOCTORS.map((d) => (
                <div key={d.name} className={`${cardCls} p-8 bg-white text-center`}>
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-xl font-semibold text-[#5a2e12]"
                    style={{
                      background: "linear-gradient(135deg, #e8c9b0, #d4a882)",
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >
                    {d.initials}
                  </div>
                  <h3 className="text-base font-medium mb-1 text-[#2c1f1a]">{d.name}</h3>
                  <p className="text-sm mb-1 text-[#b87c5a]">{d.spec}</p>
                  <p className="text-xs text-[#9a6e62]">{d.exp} experience</p>
                  <Link
                    to="/login"
                    className="mt-5 inline-block px-5 py-2 rounded-full text-xs text-[#8b4c34] transition-all duration-200 hover:opacity-80"
                    style={{ background: "rgba(184,124,90,0.1)" }}
                  >
                    Book Session
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-24 max-w-6xl mx-auto px-6">
          <SectionHeader label="Client Stories" heading="Real Results" />

          <div className="max-w-2xl mx-auto text-center">
            <div className={`${cardCls} p-10 rounded-3xl bg-white`}>
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#b87c5a] text-base">★</span>
                ))}
              </div>
              <p
                className="text-lg leading-relaxed italic mb-8 text-[#4a2e24]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                "{TESTIMONIALS[activeTestimonial].text}"
              </p>
              <p className="text-sm font-medium text-[#b87c5a]">
                — {TESTIMONIALS[activeTestimonial].name}
              </p>
            </div>

            {/* Indicator dots */}
            <div className="flex justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: i === activeTestimonial
                      ? "#b87c5a"
                      : "rgba(184,124,90,0.25)",
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-6">
          <div
            className="max-w-4xl mx-auto rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #f0ddd0, #e8c9b0)" }}
          >
            <div
              className="absolute top-4 right-8 text-6xl opacity-10 select-none text-[#7a3e22]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              ✦
            </div>
            <p className="text-xs tracking-[0.12em] uppercase text-[#8b4c34] mb-4">
              Get Started Today
            </p>
            <h2
              className="text-4xl lg:text-5xl font-normal text-[#2c1208] mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Ready to Transform<br />
              <em>Your Skin?</em>
            </h2>
            <p className="text-sm leading-relaxed text-[#6b4030] mb-10 max-w-md mx-auto">
              Book your free first consultation today. Our doctors will analyse your skin and
              create a personalised treatment plan just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="px-8 py-4 rounded-full text-white text-sm tracking-wide transition-all duration-300 hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #c4865f, #8b4c34)" }}
              >
                Book Free Consultation
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-full text-sm tracking-wide text-[#5a2e12] border border-[rgba(90,46,18,0.3)] transition-all duration-300 hover:bg-white/30"
              >
                Sign In to Account
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer
          id="contact"
          className="py-12 px-6 border-t border-[rgba(184,124,90,0.12)]"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg text-[#b87c5a]">✦</span>
                <span
                  className="text-lg font-semibold text-[#2c1f1a]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Aura Clinic
                </span>
              </div>
              <p className="text-sm max-w-xs text-[#9a6e62]">
                Certified aesthetic clinic dedicated to your skin health and confidence.
              </p>
            </div>

            <div className="flex gap-16">
              <div>
                <p className="text-xs font-medium tracking-[0.12em] uppercase text-[#5a3e35] mb-4">
                  Clinic
                </p>
                {["Services", "Doctors", "Products", "Pricing"].map((l) => (
                  <a
                    key={l}
                    href="#"
                    className="block text-sm mb-2 text-[#9a6e62] hover:opacity-60 transition-opacity"
                  >
                    {l}
                  </a>
                ))}
              </div>
              <div>
                <p className="text-xs font-medium tracking-[0.12em] uppercase text-[#5a3e35] mb-4">
                  Account
                </p>
                {["Login", "Register", "My Bookings", "Orders"].map((l) => (
                  <a
                    key={l}
                    href="#"
                    className="block text-sm mb-2 text-[#9a6e62] hover:opacity-60 transition-opacity"
                  >
                    {l}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div
            className="max-w-6xl mx-auto mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-4"
            style={{ borderTop: "1px solid rgba(184,124,90,0.1)" }}
          >
            <p className="text-xs text-[#b0907e]">© 2025 Aura Clinic. All rights reserved.</p>
            <p className="text-xs text-[#b0907e]">Made with care for your skin ✦</p>
          </div>
        </footer>

      </div>
    </>
  );
}
