import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ROLE_HOME = {
    patient: "/patient/dashboard",
    doctor: "/doctor/dashboard",
    admin: "/admin/dashboard",
};

export default function NotFoundPage() {
    const { user, isAuthenticated } = useAuth();

    const homeLink = isAuthenticated
        ? (ROLE_HOME[user?.role] ?? "/")
        : "/";

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;500&display=swap');
      `}</style>

            <div style={{
                minHeight: "100vh",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#faf8f5", fontFamily: "'DM Sans', sans-serif",
                padding: 28,
            }}>
                <div style={{ textAlign: "center", maxWidth: 440 }}>

                    {/* 404 number */}
                    <p style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 96, fontWeight: 400, lineHeight: 1,
                        color: "rgba(184,124,90,0.15)", marginBottom: 0,
                        userSelect: "none",
                    }}>
                        404
                    </p>

                    {/* Icon */}
                    <div style={{
                        width: 64, height: 64, borderRadius: "50%",
                        background: "rgba(184,124,90,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "-16px auto 24px",
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                            stroke="#b87c5a" strokeWidth="1.4">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="11" y1="8" x2="11" y2="11" />
                            <line x1="11" y1="14" x2="11.01" y2="14" />
                        </svg>
                    </div>

                    {/* Heading */}
                    <h1 style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 28, fontWeight: 400,
                        color: "#2c1f1a", marginBottom: 12,
                    }}>
                        Page <em style={{ color: "#b87c5a" }}>not found</em>
                    </h1>

                    <p style={{
                        fontSize: 14, color: "#9a7065",
                        lineHeight: 1.7, marginBottom: 36,
                    }}>
                        The page you're looking for doesn't exist or<br />
                        may have been moved to a different location.
                    </p>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                        <Link
                            to={homeLink}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 8,
                                padding: "10px 22px", borderRadius: 12,
                                background: "linear-gradient(135deg, #c4865f, #9a5030)",
                                color: "#fff", fontSize: 13, fontWeight: 500,
                                textDecoration: "none",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            Go to Dashboard
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 8,
                                padding: "10px 22px", borderRadius: 12,
                                border: "1px solid rgba(184,124,90,0.25)",
                                background: "transparent", color: "#5a3e35",
                                fontSize: 13, cursor: "pointer",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(184,124,90,0.06)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Go back
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}