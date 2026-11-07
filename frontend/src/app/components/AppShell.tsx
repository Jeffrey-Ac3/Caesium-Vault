"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import LoginScreen from "./LoginScreen";
import Sidebar from "./Sidebar";
import TourModal from "./TourModal";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [forceReady, setForceReady] = useState(false);

  // Fallback timer: if anything halts client hydration or storage read, force reveal
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceReady(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const isStillLoading = loading && !forceReady;

  // Show clean spinner while verifying local session
  if (isStillLoading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg)",
      }}>
        <div style={{ textAlign: "center", padding: "1.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem", animation: "pulse 1.5s infinite" }}>⚗️</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: "0 0 1rem" }}>
            Connecting to Caesium Vault...
          </p>
          <button
            onClick={() => setForceReady(true)}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "0.4rem 0.8rem",
              color: "var(--text-muted)",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            Continue to App →
          </button>
        </div>
      </div>
    );
  }

  // Not logged in → show full-screen auth gate
  if (!user) {
    return <LoginScreen />;
  }

  // Logged in → show app with sidebar
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="page-content">
        {children}
      </main>
      <TourModal />
    </div>
  );
}
