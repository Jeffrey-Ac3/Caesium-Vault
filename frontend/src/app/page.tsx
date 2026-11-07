"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface NetworkInfo {
  primaryIp: string;
}

const NAV_CARDS = [
  {
    href: "/resources",
    label: "Library & Archives",
    description: "Browse textbooks, WAEC past questions, PhET simulations, and offline Wikipedia archives.",
    cta: "Enter Library",
    color: "#2563EB",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: "/cbt",
    label: "CBT Exams",
    description: "Take official school assessments in a secure, WAEC-style timed environment with instant results.",
    cta: "Start Exam",
    color: "var(--wine)",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/arena",
    label: "Math Arena",
    description: "Compete live with other classes in real-time mathematics problem solving. Top class wins!",
    cta: "Join Arena",
    color: "#D97706",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const STATS = [
  { label: "ZIM Archives", value: "3" },
  { label: "Exam Papers", value: "10+" },
  { label: "Subjects", value: "12+" },
];

export default function Home() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [copied, setCopied] = useState(false);

  const getBackendBase = () => {
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.hostname}:3001`;
    }
    return "http://localhost:3001";
  };

  useEffect(() => {
    fetch(`${getBackendBase()}/api/network-info`)
      .then((r) => r.json())
      .then((d) => setNetworkInfo(d))
      .catch(() => {});
  }, []);

  const hostIp =
    networkInfo?.primaryIp ||
    (typeof window !== "undefined" ? window.location.hostname : "localhost");
  const vaultUrl = `http://${hostIp}:3000`;

  const copyAddress = () => {
    navigator.clipboard.writeText(vaultUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em",
            textTransform: "uppercase", color: "var(--accent-green)",
            background: "color-mix(in srgb, var(--accent-green) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent-green) 30%, transparent)",
            padding: "0.3rem 0.75rem", borderRadius: "999px",
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "var(--accent-green)",
              boxShadow: "0 0 0 3px color-mix(in srgb, var(--accent-green) 25%, transparent)",
            }} />
            Offline Server Active
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Tunwase High School
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(2.4rem, 5vw, 3.6rem)", fontWeight: 800,
          letterSpacing: "-0.03em", margin: "0 0 0.75rem",
          lineHeight: 1.1, color: "var(--text)",
        }}>
          Welcome to{" "}
          <span style={{ color: "var(--wine)" }}>Caesium Vault</span>
        </h1>
        <p style={{
          fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: 560,
          lineHeight: 1.7, margin: 0,
        }}>
          Your offline gateway to knowledge — no internet required. Access archives,
          take exams, and compete in the Math Arena from any device on the school network.
        </p>
      </div>

      {/* Stats row */}
      <div style={{
        display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem",
      }}>
        {STATS.map((s) => (
          <div key={s.label} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "0.875rem 1.25rem", minWidth: 110,
          }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--wine)", lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.25rem",
        marginBottom: "2rem",
      }}>
        {NAV_CARDS.map((card) => (
          <Link key={card.href} href={card.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "1.75rem",
              transition: "box-shadow 0.18s, transform 0.18s, border-color 0.18s",
              cursor: "pointer", height: "100%",
            }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = `0 8px 32px -8px color-mix(in srgb, ${card.color} 25%, transparent)`;
                el.style.transform = "translateY(-3px)";
                el.style.borderColor = `color-mix(in srgb, ${card.color} 40%, transparent)`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = "none";
                el.style.transform = "none";
                el.style.borderColor = "var(--border)";
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: `color-mix(in srgb, ${card.color} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${card.color} 25%, transparent)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: card.color, marginBottom: "1.25rem",
              }}>
                {card.icon}
              </div>

              <h3 style={{
                fontSize: "1.2rem", fontWeight: 700, color: "var(--text)",
                margin: "0 0 0.5rem", letterSpacing: "-0.01em",
              }}>
                {card.label}
              </h3>
              <p style={{
                fontSize: "0.9rem", color: "var(--text-muted)",
                lineHeight: 1.6, margin: "0 0 1.5rem",
              }}>
                {card.description}
              </p>

              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                fontSize: "0.88rem", fontWeight: 600, color: card.color,
              }}>
                {card.cta}
                <span style={{ fontSize: "1.1em" }}>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* LAN Access Card */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "1.25rem 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "1rem", flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "color-mix(in srgb, var(--accent-blue) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent-blue) 25%, transparent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem",
          }}>
            📶
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
              Wi-Fi Access URL
            </div>
            <div style={{
              fontFamily: "monospace", fontSize: "1rem", fontWeight: 700,
              color: "var(--accent-blue)", margin: "2px 0",
              userSelect: "all",
            }}>
              {vaultUrl}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Share this with any phone or laptop on the same Wi-Fi
            </div>
          </div>
        </div>

        <button
          onClick={copyAddress}
          style={{
            padding: "0.6rem 1.25rem", borderRadius: 10,
            background: copied ? "var(--accent-green)" : "var(--wine)",
            color: "#fff", border: "none", cursor: "pointer",
            fontSize: "0.85rem", fontWeight: 600,
            transition: "background 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          {copied ? "✓ Copied!" : "📋 Copy URL"}
        </button>
      </div>
    </div>
  );
}
