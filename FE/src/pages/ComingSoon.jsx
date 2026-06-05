import { Link, useLocation } from "react-router-dom";

export default function ComingSoon() {
    const location = useLocation();

    // Ambil nama halaman dari path — "/admin/bookings" → "Bookings"
    const pageName = location.pathname
        .split("/")
        .filter(Boolean)
        .pop()
        ?.replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Page";

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;500&display=swap');
      `}</style>

            <div
                style={{
                    minHeight: "calc(100vh - 64px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'DM Sans', sans-serif",
                    padding: 28,
                }}
            >
                <div style={{ textAlign: "center", maxWidth: 420 }}>

                    {/* Icon */}
                    <div style={{
                        width: 72, height: 72,
                        borderRadius: "50%",
                        background: "rgba(184,124,90,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 24px",
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                            stroke="#b87c5a" strokeWidth="1.4">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>

                    {/* Heading */}
                    <h1 style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 28, fontWeight: 400,
                        color: "#2c1f1a", marginBottom: 12,
                    }}>
                        {pageName} <em style={{ color: "#b87c5a" }}>coming soon</em>
                    </h1>

                    <p style={{ fontSize: 14, color: "#9a7065", lineHeight: 1.7, marginBottom: 32 }}>
                        This feature is currently under development.<br />
                        Check back soon for updates.
                    </p>

                    {/* Back button */}
                    <Link
                        to={-1}
                        onClick={(e) => { e.preventDefault(); window.history.back(); }}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            padding: "10px 20px", borderRadius: 12,
                            border: "1px solid rgba(184,124,90,0.25)",
                            color: "#5a3e35", fontSize: 13, textDecoration: "none",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(184,124,90,0.06)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Go back
                    </Link>

                </div>
            </div>
        </>
    );
}