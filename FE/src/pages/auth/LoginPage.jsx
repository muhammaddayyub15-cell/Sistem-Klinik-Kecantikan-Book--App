import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const REDIRECT = {
  patient: "/patient/dashboard",
  doctor:  "/doctor/dashboard",
  admin:   "/admin/dashboard",
};

const TRUST_BADGES = [
  { icon: "✦", text: "5,000+ Patients" },
  { icon: "◈", text: "Certified Doctors" },
  { icon: "◇", text: "Secure & Private" },
];

const inputCls = (focused, name) =>
  `w-full px-4 py-3 rounded-xl border text-[#2c1f1a] text-sm placeholder-[#c4a898] outline-none transition-all duration-200 ${
    focused === name
      ? "border-[#b87c5a] bg-white shadow-sm"
      : "border-[rgba(184,124,90,0.2)] bg-[rgba(253,246,239,0.6)]"
  }`;

const labelCls = "block text-xs font-medium text-[#5a3e35] mb-1.5 tracking-wide";

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


export function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [form,     setForm]     = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [focused,  setFocused]  = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const userData = await login(form.email, form.password);
      const from = location.state?.from?.pathname;
      navigate(from ?? REDIRECT[userData.role] ?? "/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message ?? "Invalid email or password.");
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

      <div className="min-h-screen flex bg-[#faf8f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* LEFT PANEL */}
        <div
          className="hidden lg:flex w-[45%] flex-col justify-between p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #f0ddd0 0%, #e4c0a4 45%, #cfa07e 100%)" }}
        >
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/15" />
          <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-[rgba(90,30,5,0.08)]" />
          <div
            className="absolute top-[40%] left-[60%] text-[120px] leading-none select-none text-[rgba(90,30,5,0.06)]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            ✦
          </div>

          {/* Logo */}
          <div className="flex items-center gap-2.5 relative z-10">
            <span className="text-[#7a3e22] text-[22px]">✦</span>
            <span className="text-[#3a1a0a] text-xl font-medium" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Aura Clinic
            </span>
          </div>

          {/* Quote */}
          <div className="relative z-10">
            <h2 className="text-[36px] font-normal leading-[1.3] text-[#2c1208] mb-5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Welcome back to your
              <br />
              <em>skin journey.</em>
            </h2>
            <p className="text-sm text-[#7a4c36] leading-relaxed max-w-[320px]">
              Manage your bookings, track your treatments, and connect with your doctor — all in one place.
            </p>
            <div className="flex gap-1.5 mt-7">
              {[1, 0.5, 0.25].map((o, i) => (
                <div key={i} className="h-2 rounded-[20px]"
                  style={{ width: i === 0 ? 24 : 8, background: `rgba(90,30,5,${o * 0.5})` }} />
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex gap-4 relative z-10">
            {TRUST_BADGES.map((b) => (
              <div key={b.text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] bg-white/25 backdrop-blur-sm">
                <span className="text-[10px] text-[#7a3e22]">{b.icon}</span>
                <span className="text-[11px] text-[#3a1a0a] font-medium">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 md:px-12">
          <div className="w-full max-w-[400px]">

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2 mb-9">
              <span className="text-[#b87c5a] text-lg">✦</span>
              <span className="text-[#2c1f1a] text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Aura Clinic
              </span>
            </div>

            {/* Heading */}
            <div className="mb-9">
              <p className="text-[11px] tracking-[0.1em] uppercase text-[#b87c5a] mb-2">Welcome back</p>
              <h1 className="text-[32px] font-normal text-[#2c1f1a] leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Sign in to your
                <br />
                <em className="text-[#b87c5a]">account</em>
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Email */}
              <div>
                <label className={labelCls}>Email address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputCls(focused, "email")}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-[#5a3e35] tracking-wide">Password</label>
                  <Link to="/forgot-password" className="text-xs text-[#b87c5a] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused("")}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={`${inputCls(focused, "password")} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b0907e] flex items-center"
                  >
                    <EyeIcon open={showPass} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white text-sm font-medium tracking-wide transition-all duration-200 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: loading ? "rgba(184,124,90,0.5)" : "linear-gradient(135deg, #c4865f, #9a5030)" }}
              >
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>Sign In <span className="text-base">→</span></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[rgba(184,124,90,0.15)]" />
              <span className="text-xs text-[#b0907e]">or</span>
              <div className="flex-1 h-px bg-[rgba(184,124,90,0.15)]" />
            </div>

            <p className="text-center text-sm text-[#7a5a52]">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#b87c5a] font-medium hover:underline">Create one →</Link>
            </p>

            <div className="text-center mt-8">
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

export default LoginPage;