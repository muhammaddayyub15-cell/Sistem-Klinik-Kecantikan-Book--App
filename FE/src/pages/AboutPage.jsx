import { Link } from "react-router-dom";

// ── Constants ──────────────────────────────────────────────────────────────

const VALUES = [
  {
    icon: "✦",
    title: "Science-Led Care",
    desc: "Every treatment and product recommendation is backed by clinical research and dermatological evidence.",
  },
  {
    icon: "◈",
    title: "Personalised Approach",
    desc: "No two skin types are alike. We craft individual treatment plans tailored to your unique skin story.",
  },
  {
    icon: "◇",
    title: "Certified Excellence",
    desc: "All procedures are performed by board-certified aesthetic doctors in a licensed medical facility.",
  },
  {
    icon: "◉",
    title: "Long-Term Results",
    desc: "We focus on sustainable skin health, not quick fixes — building routines and treatments that last.",
  },
];

const TEAM = [
  {
    initials: "AP",
    name: "dr. Anisa Putri, SpKK",
    role: "Founder & Lead Dermatologist",
    bio: "8 years in aesthetic dermatology. Trained at RSUPN Cipto Mangunkusumo. Specialises in laser therapy and skin rejuvenation.",
  },
  {
    initials: "RS",
    name: "dr. Ratna Sari",
    role: "Laser & Skin Expert",
    bio: "6 years of experience with advanced laser modalities. Certified in IPL, fractional CO₂, and Pico laser treatments.",
  },
  {
    initials: "MD",
    name: "dr. Maya Dewi",
    role: "Cosmetic Physician",
    bio: "10 years as a cosmetic physician. Expert in injectable aesthetics — Botox, filler, and bio-remodelling treatments.",
  },
  {
    initials: "FH",
    name: "dr. Farah Hana",
    role: "Skin Nutrition Specialist",
    bio: "Integrates nutritional science with dermatology for holistic skin health. Certified in nutricosmetics.",
  },
];

const MILESTONES = [
  { year: "2016", event: "Aura Clinic founded in South Jakarta with a team of 3 doctors." },
  { year: "2018", event: "Expanded to our current flagship clinic. Added laser therapy wing." },
  { year: "2020", event: "Launched Aura Skincare product line — formulated in-house." },
  { year: "2022", event: "Reached 3,000+ patients treated. Opened second consultation room." },
  { year: "2024", event: "Introduced digital booking system and teleconsultation services." },
  { year: "2025", event: "5,000+ happy patients. Recognised as Top Aesthetic Clinic in Jakarta." },
];

const STATS = [
  { value: "5,000+", label: "Patients Treated" },
  { value: "12+",    label: "Expert Doctors"   },
  { value: "98%",    label: "Satisfaction Rate" },
  { value: "8 yrs",  label: "Est. 2016"         },
];

// ── Shared class strings (mirrors RegisterPage pattern) ───────────────────

const cardCls =
  "p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1 border border-[rgba(184,124,90,0.12)]";

const sectionLabelCls =
  "text-xs tracking-[0.12em] uppercase text-[#b87c5a] mb-3";

const sectionHeadingCls =
  "text-4xl lg:text-5xl font-normal text-[#2c1f1a]";

// ── Sub-components ────────────────────────────────────────────────────────

/** Reusable section header used in Values, Team, Timeline */
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

export default function AboutPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
      `}</style>

      <div
        className="min-h-screen font-sans bg-[#faf8f5] text-[#2c1f1a]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >

        {/* ── HERO ── */}
        <section
          className="pt-24 pb-20 px-6 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #fdf6ef 0%, #f7ede2 60%, #f0ddd0 100%)" }}
        >
          {/* Decorative blobs — mirrors left-panel circles in RegisterPage */}
          <div
            className="absolute top-12 right-0 w-80 h-80 rounded-full opacity-20"
            style={{ background: "#e8c9b0", transform: "translate(30%, 0)" }}
          />
          <div
            className="absolute bottom-0 left-8 text-8xl opacity-5 select-none"
            style={{ color: "#b87c5a", fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            ✦
          </div>

          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center relative">

            {/* Left copy */}
            <div>
              <p className={`${sectionLabelCls} mb-5`}>✦ Our Story</p>
              <h1
                className="text-5xl lg:text-6xl font-normal leading-tight mb-7"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Skin Health is
                <br />
                <em className="text-[#b87c5a]">a Journey</em>
              </h1>
              <p className="text-sm leading-relaxed max-w-md mb-5 text-[#6b4c40]">
                Founded in 2016 by dr. Anisa Putri, Aura Clinic was born from a simple belief:
                everyone deserves access to expert-led, personalised skin care — not just those
                who can afford luxury.
              </p>
              <p className="text-sm leading-relaxed max-w-md text-[#6b4c40]">
                We combine the rigour of clinical dermatology with a warm, welcoming environment.
                From your first consultation to your final treatment, every step is guided by
                science and care.
              </p>

              <div className="mt-8">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs tracking-wide border border-[rgba(90,62,53,0.25)] text-[#5a3e35] transition-all duration-200 hover:opacity-80"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back to Home
                </Link>
              </div>
            </div>

            {/* Right stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="p-7 rounded-2xl bg-white border border-[rgba(184,124,90,0.12)]"
                >
                  <div
                    className="text-3xl font-semibold mb-1 text-[#2c1f1a]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs text-[#9a6e62]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="py-24 px-6 max-w-6xl mx-auto">
          <SectionHeader label="What Drives Us" heading="Our Values" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className={`${cardCls} ${i % 2 === 0 ? "bg-white" : "bg-[#fdf6ef]"}`}
              >
                <div className="text-3xl mb-5 text-[#b87c5a]">{v.icon}</div>
                <h3 className="text-sm font-medium mb-2 text-[#2c1f1a]">{v.title}</h3>
                <p className="text-xs leading-relaxed text-[#7a5a52]">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TEAM ── */}
        <section className="py-24 px-6 bg-[#fdf6ef]">
          <div className="max-w-6xl mx-auto">
            <SectionHeader label="The Experts" heading="Meet Our Doctors" />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {TEAM.map((t) => (
                <div key={t.name} className={`${cardCls} bg-white`}>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-semibold mb-5 text-[#5a2e12]"
                    style={{
                      background: "linear-gradient(135deg, #e8c9b0, #d4a882)",
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >
                    {t.initials}
                  </div>
                  <h3 className="text-sm font-medium mb-0.5 text-[#2c1f1a]">{t.name}</h3>
                  <p className="text-xs mb-3 text-[#b87c5a]">{t.role}</p>
                  <p className="text-xs leading-relaxed text-[#7a5a52]">{t.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section className="py-24 px-6 max-w-4xl mx-auto">
          <SectionHeader label="Our Journey" heading="A Decade of Care" />

          <div className="relative">
            {/* Vertical spine */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-[rgba(184,124,90,0.2)]"
            />

            <div className="flex flex-col gap-10">
              {MILESTONES.map((m, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <div
                    key={m.year}
                    className={`relative flex items-center gap-8 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
                  >
                    {/* Content card */}
                    <div className={`flex-1 ${isLeft ? "text-right" : "text-left"}`}>
                      <div className="inline-block p-5 rounded-2xl bg-white border border-[rgba(184,124,90,0.12)]">
                        <p className="text-xs font-medium mb-1 text-[#b87c5a]">{m.year}</p>
                        <p className="text-sm leading-relaxed text-[#5a3e35]">{m.event}</p>
                      </div>
                    </div>

                    {/* Center dot */}
                    <div
                      className="flex-shrink-0 w-3 h-3 rounded-full z-10 bg-[#b87c5a]"
                      style={{ boxShadow: "0 0 0 4px rgba(184,124,90,0.15)" }}
                    />

                    {/* Empty opposite side */}
                    <div className="flex-1" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-6">
          <div
            className="max-w-4xl mx-auto rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #f0ddd0, #e8c9b0)" }}
          >
            {/* Decorative mark */}
            <div
              className="absolute top-4 right-8 text-6xl opacity-10 select-none"
              style={{ color: "#7a3e22", fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              ✦
            </div>

            <p className="text-xs tracking-[0.12em] uppercase text-[#8b4c34] mb-4">
              Join Our Community
            </p>
            <h2
              className="text-4xl lg:text-5xl font-normal text-[#2c1208] mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Start Your Skin
              <br />
              <em>Journey Today</em>
            </h2>
            <p className="text-sm leading-relaxed text-[#6b4030] mb-10 max-w-md mx-auto">
              Book your first consultation for free. Our doctors will listen, analyse, and guide
              you toward the skin you deserve.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 rounded-full text-white text-sm tracking-wide transition-all duration-300 hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #c4865f, #8b4c34)" }}
              >
                Book Free Consultation
              </Link>
              <a
                href="#contact"
                className="px-8 py-4 rounded-full text-sm tracking-wide transition-all duration-300 text-[#5a2e12] border border-[rgba(90,46,18,0.3)] hover:bg-[rgba(90,46,18,0.05)]"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

