"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import PrivacyModal from "./PrivacyModal";
import { useAuth } from "./AuthContext";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/resources",
    label: "Library",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: "/cbt",
    label: "CBT Exams",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/arena",
    label: "Math Arena",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    href: "/study-agent",
    label: "Study Agent",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 01-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { user, logout } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "var(--sidebar-w)",
          height: "100vh",
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          zIndex: 40,
          transition: "background 0.2s, border-color 0.2s",
        }}
        className="hidden-mobile"
      >
        {/* Logo */}
        <div style={{ padding: "1.5rem 1.25rem 1rem" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.6rem",
            marginBottom: "0.75rem",
          }}>
            <span style={{ fontSize: "1.4rem" }}>⚗️</span>
            <span style={{
              fontWeight: 800, fontSize: "1rem",
              color: "var(--wine)", letterSpacing: "-0.02em",
            }}>
              Caesium Vault
            </span>
          </div>
          {/* Status pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            fontSize: "0.7rem", fontWeight: 600,
            color: "var(--accent-green)",
            background: "color-mix(in srgb, var(--accent-green) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent-green) 30%, transparent)",
            padding: "0.2rem 0.65rem", borderRadius: "999px",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--accent-green)",
              flexShrink: 0,
            }} />
            Offline Active
          </div>
        </div>

        {/* School label */}
        <div style={{
          padding: "0 1.25rem 1rem",
          fontSize: "0.7rem", color: "var(--text-muted)",
          fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          Tunwase High School
        </div>

        <div style={{
          height: 1, background: "var(--border)", margin: "0 1.25rem 1rem",
        }} />

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "0 0.75rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.65rem 0.875rem",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: active ? 700 : 500,
                  color: active ? "var(--wine)" : "var(--text-muted)",
                  background: active ? "var(--wine-light)" : "transparent",
                  borderLeft: active ? "3px solid var(--wine)" : "3px solid transparent",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                  }
                }}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Dark mode toggle & Privacy */}
        <div style={{
          padding: "1rem 1.25rem 1.5rem",
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
              {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </span>
            {/* Toggle switch */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              style={{
                width: 44, height: 24,
                borderRadius: 999,
                background: theme === "dark" ? "var(--wine)" : "var(--border)",
                border: "none", cursor: "pointer",
                position: "relative", transition: "background 0.2s",
                padding: 0,
              }}
            >
              <span style={{
                position: "absolute",
                top: 3, left: theme === "dark" ? 23 : 3,
                width: 18, height: 18, borderRadius: "50%",
                background: "#fff",
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }} />
            </button>
          </div>

          {/* Privacy Link */}
          <button
            onClick={() => setShowPrivacy(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              fontWeight: 500,
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--wine)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <span>🛡️</span>
            <span>NDPC Privacy & Data Notice</span>
          </button>


          {/* User account card + Sign out */}
          {user && (
            <div style={{
              marginTop: "0.25rem",
              padding: "0.6rem 0.75rem",
              borderRadius: 10,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontSize: "0.9rem" }}>
                      {user.role === "teacher" ? "🏫" : "🎒"}
                    </span>
                    <span style={{
                      fontWeight: 700, fontSize: "0.78rem", color: "var(--text)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {user.username}
                    </span>
                  </div>
                  <div style={{
                    fontSize: "0.65rem", color: "var(--text-muted)",
                    marginTop: "0.1rem", textTransform: "capitalize",
                  }}>
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  style={{
                    padding: "0.3rem 0.5rem", borderRadius: 7,
                    border: "1px solid var(--border)", background: "transparent",
                    cursor: "pointer", fontSize: "0.65rem",
                    color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--wine)";
                    e.currentTarget.style.borderColor = "var(--wine)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-muted)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "4rem",
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          zIndex: 40,
          padding: "0 0.5rem",
        }}
        className="mobile-only"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.2rem",
                padding: "0.4rem 0.75rem",
                borderRadius: 10,
                textDecoration: "none",
                color: active ? "var(--wine)" : "var(--text-muted)",
                fontSize: "0.65rem",
                fontWeight: active ? 700 : 500,
                background: active ? "var(--wine-light)" : "transparent",
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
        {/* Mobile dark mode toggle */}
        <button
          onClick={toggleTheme}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "0.2rem", padding: "0.4rem 0.75rem", borderRadius: 10,
            border: "none", background: "transparent", cursor: "pointer",
            color: "var(--text-muted)", fontSize: "0.65rem", fontWeight: 500,
          }}
        >
          <span style={{ fontSize: "1rem" }}>{theme === "dark" ? "☀️" : "🌙"}</span>
          Theme
        </button>

        {/* Mobile privacy button */}
        <button
          onClick={() => setShowPrivacy(true)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "0.2rem", padding: "0.4rem 0.75rem", borderRadius: 10,
            border: "none", background: "transparent", cursor: "pointer",
            color: "var(--text-muted)", fontSize: "0.65rem", fontWeight: 500,
          }}
        >
          <span style={{ fontSize: "1rem" }}>🛡️</span>
          Privacy
        </button>
      </nav>

      {/* Privacy Notice Modal */}
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />

      {/* Responsive helpers */}
      <style>{`
        .hidden-mobile { display: flex !important; }
        .mobile-only   { display: none  !important; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none  !important; }
          .mobile-only   { display: flex  !important; }
        }
      `}</style>
    </>
  );
}
