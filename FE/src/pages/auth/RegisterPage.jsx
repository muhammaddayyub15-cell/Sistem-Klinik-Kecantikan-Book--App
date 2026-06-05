import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const STEPS = ["Role", "Details", "Account"];

const ROLES = [
  {
    value: "patient",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    label: "Patient",
    desc: "Book treatments, track your progress, shop skincare products.",
  },
  {
    value: "doctor",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <path d="M12 13v4M10 15h4" />
      </svg>
    ),
    label: "Doctor",
    desc: "Manage your schedule, consult patients, create medical records.",
  },
];

const REDIRECT = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
};

const SPECIALIZATIONS = [
  { value: "aesthetic_dermatology", label: "Aesthetic Dermatology" },
  { value: "laser_skin", label: "Laser & Skin Expert" },
  { value: "cosmetic_physician", label: "Cosmetic Physician" },
  { value: "general_skin", label: "General Skincare" },
];

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-[#e8d5c8] bg-[#fdf8f5] text-[#2c1f1a] text-sm placeholder-[#c4a898] outline-none transition-all duration-200 focus:border-[#b87c5a] focus:bg-white focus:shadow-sm";
const labelCls = "block text-xs font-medium text-[#5a3e35] mb-1.5 tracking-wide";
const selectCls = `${inputCls} cursor-pointer`;

const getPasswordStrength = (pw) => {
  if (!pw) return 0;
  if (pw.length < 8) return 1;
  if (pw.length < 10) return 2;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 4;
  return 3;
};

const STRENGTH_LABEL = ["", "Too short", "Weak", "Good", "Strong ✓"];
const STRENGTH_COLORS = ["", "bg-red-400", "bg-orange-400", "bg-yellow-500", "bg-emerald-500"];

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    role: "", name: "", phone: "", date_of_birth: "",
    gender: "", specialization: "", email: "",
    password: "", confirmPassword: "",
  });

  const strength = getPasswordStrength(form.password);

  const setField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (error) setError("");
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.role) { setError("Please select your role."); return false; }
    }
    if (step === 1) {
      if (!form.name.trim()) { setError("Full name is required."); return false; }
      if (!form.phone.trim()) { setError("Phone number is required."); return false; }
      if (!form.date_of_birth) { setError("Date of birth is required."); return false; }
      if (!form.gender) { setError("Gender is required."); return false; }
    }
    if (step === 2) {
      if (!form.email.trim()) { setError("Email is required."); return false; }
      if (!/\S+@\S+\.\S+/.test(form.email)) { setError("Enter a valid email address."); return false; }
      if (form.password.length < 8) { setError("Password must be at least 8 characters."); return false; }
      if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return false; }
    }
    setError("");
    return true;
  };

  const handleNext = () => { if (!validateStep()) return; setStep((s) => s + 1); };
  const handleBack = () => { setError(""); setStep((s) => s - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    try {
      const payload = {
        full_name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword,
        role: form.role,
        phone: form.phone,
        gender: form.gender,
        date_of_birth: form.date_of_birth,
      };

      const userData = await register(payload);
      navigate(REDIRECT[userData.role] ?? "/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      <div className="min-h-screen flex font-sans bg-[#faf8f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* LEFT PANEL */}
        <div
          className="hidden lg:flex w-[42%] flex-col justify-between p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #2c1208 0%, #5a2e12 50%, #8b4c34 100%)" }}
        >
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/5" />
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full border border-white/[0.04]" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full border border-white/[0.05]" />
          <div className="absolute top-[30%] left-[60%] w-48 h-48 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(184,124,90,0.2) 0%, transparent 70%)" }} />

          <div className="flex items-center gap-2.5 relative z-10">
            <span className="text-[#e8c9b0] text-2xl">✦</span>
            <span className="text-[#f5ede4] text-xl font-medium" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Aura Clinic
            </span>
          </div>

          <div className="relative z-10">
            <p className="text-[10px] tracking-[0.12em] uppercase text-[rgba(232,201,176,0.6)] mb-8">
              Registration steps
            </p>
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <div key={s} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                      ${done ? "bg-[#b87c5a] border-0"
                        : active ? "bg-[rgba(184,124,90,0.2)] border border-[#b87c5a]"
                          : "bg-[rgba(255,255,255,0.06)] border border-white/10"}`}
                    >
                      {done ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className={`text-xs font-medium ${active ? "text-[#e8c9b0]" : "text-white/30"}`}>{i + 1}</span>
                      )}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-px h-9 my-1 transition-all duration-500 ${done ? "bg-[#b87c5a]" : "bg-white/[0.08]"}`} />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <p className={`text-sm transition-all duration-300
                      ${active ? "font-medium text-[#e8c9b0]" : done ? "text-[rgba(232,201,176,0.8)]" : "text-white/30"}`}>
                      {s}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative z-10">
            <p className="text-xl italic text-[rgba(232,201,176,0.7)] leading-relaxed"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              "Your skin tells your story.<br />Let us help you write a beautiful one."
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 md:px-12">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2 mb-8">
              <span className="text-[#b87c5a] text-lg">✦</span>
              <span className="text-[#2c1f1a] text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Aura Clinic
              </span>
            </div>

            {/* Mobile step dots */}
            <div className="flex lg:hidden gap-2 mb-6">
              {STEPS.map((_, i) => (
                <div key={i} className="h-1 rounded-full transition-all duration-300"
                  style={{ width: i === step ? 24 : 8, background: i <= step ? "#b87c5a" : "rgba(184,124,90,0.2)" }}
                />
              ))}
            </div>

            {/* Step header */}
            <div className="mb-7">
              <p className="text-[11px] tracking-[0.1em] uppercase text-[#b87c5a] mb-2">
                Step {step + 1} of {STEPS.length}
              </p>
              <h1 className="text-[28px] sm:text-[30px] font-normal text-[#2c1f1a] leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {step === 0 && "I am a…"}
                {step === 1 && <><span>Tell us about</span><br /><em className="text-[#b87c5a]">yourself</em></>}
                {step === 2 && <><span>Create your</span><br /><em className="text-[#b87c5a]">account</em></>}
              </h1>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>

              {/* STEP 0 — Role */}
              {step === 0 && (
                <div className="flex flex-col gap-3.5">
                  <p className="text-sm text-[#7a5a52] mb-1">This helps us personalise your experience.</p>
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setField("role", r.value)}
                      className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border text-left w-full transition-all duration-200 cursor-pointer
                        ${form.role === r.value
                          ? "border-[#b87c5a] bg-[rgba(184,124,90,0.07)]"
                          : "border-[rgba(184,124,90,0.2)] bg-[rgba(253,246,239,0.4)] hover:border-[rgba(184,124,90,0.4)]"}`}
                    >
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200
                        ${form.role === r.value ? "bg-[rgba(184,124,90,0.15)] text-[#b87c5a]" : "bg-[rgba(184,124,90,0.07)] text-[#9a7065]"}`}>
                        {r.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm sm:text-base font-medium mb-1 ${form.role === r.value ? "text-[#2c1f1a]" : "text-[#5a3e35]"}`}>
                          {r.label}
                        </p>
                        <p className="text-xs sm:text-[13px] text-[#9a7065] leading-relaxed">{r.desc}</p>
                      </div>
                      {form.role === r.value && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b87c5a" strokeWidth="2.5" className="flex-shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 1 — Details */}
              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelCls}>Full name</label>
                    <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)}
                      placeholder="e.g. Sari Dewi" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone number</label>
                    <input type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)}
                      placeholder="+62 812 3456 7890" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Date of birth</label>
                      <input type="date" value={form.date_of_birth} onChange={(e) => setField("date_of_birth", e.target.value)}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Gender</label>
                      <select value={form.gender} onChange={(e) => setField("gender", e.target.value)} className={selectCls}>
                        <option value="">Select</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  {form.role === "doctor" && (
                    <div>
                      <label className={labelCls}>Specialization</label>
                      <select value={form.specialization} onChange={(e) => setField("specialization", e.target.value)} className={selectCls}>
                        <option value="">Select specialization</option>
                        {SPECIALIZATIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2 — Account */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelCls}>Email address</label>
                    <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)}
                      placeholder="you@example.com" autoComplete="email" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setField("password", e.target.value)}
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        className={`${inputCls} pr-11`}
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} aria-label={showPass ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b0907e] flex items-center">
                        <EyeIcon open={showPass} />
                      </button>
                    </div>
                    {form.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map((lvl) => (
                            <div key={lvl} className={`flex-1 h-0.5 rounded-full transition-all duration-300
                              ${lvl <= strength ? STRENGTH_COLORS[strength] : "bg-[rgba(184,124,90,0.15)]"}`} />
                          ))}
                        </div>
                        <p className="text-[11px] text-[#9a7065]">{STRENGTH_LABEL[strength]}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Confirm password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) => setField("confirmPassword", e.target.value)}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        className={`${inputCls} pr-11
                          ${form.confirmPassword && form.confirmPassword !== form.password ? "border-red-300"
                            : form.confirmPassword && form.confirmPassword === form.password ? "border-emerald-300"
                              : ""}`}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b0907e] flex items-center">
                        <EyeIcon open={showConfirm} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[#9a7065] leading-relaxed">
                    By creating an account, you agree to our{" "}
                    <a href="/terms" className="text-[#b87c5a] hover:underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="/privacy" className="text-[#b87c5a] hover:underline">Privacy Policy</a>.
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-2.5 mt-7">
                {step > 0 && (
                  <button type="button" onClick={handleBack}
                    className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-[rgba(184,124,90,0.25)] text-[#5a3e35] text-sm cursor-pointer bg-transparent hover:bg-[rgba(184,124,90,0.05)] transition-all duration-200">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                )}
                <button type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: loading ? "rgba(184,124,90,0.5)" : "linear-gradient(135deg, #c4865f, #9a5030)" }}>
                  {loading ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Creating account…
                    </>
                  ) : step < 2 ? <>Continue <span className="text-base">→</span></>
                    : <>Create Account <span className="text-base">→</span></>}
                </button>
              </div>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[rgba(184,124,90,0.15)]" />
              <span className="text-xs text-[#b0907e]">or</span>
              <div className="flex-1 h-px bg-[rgba(184,124,90,0.15)]" />
            </div>

            <p className="text-center text-sm text-[#7a5a52]">
              Already have an account?{" "}
              <Link to="/login" className="text-[#b87c5a] font-medium hover:underline">Sign in →</Link>
            </p>

            <div className="text-center mt-7">
              <Link to="/" className="inline-flex items-center gap-1 text-xs text-[#b0907e] hover:text-[#b87c5a] transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to homepage
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;