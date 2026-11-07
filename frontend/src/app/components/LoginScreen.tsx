"use client";

import { useState } from "react";
import { useAuth, UserRole } from "./AuthContext";

function getBackendBase() {
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return "http://localhost:3001";
}

export default function LoginScreen() {
  const { login } = useAuth();
  const [mode, setMode] = useState<"choose" | "login" | "register">("choose");
  const [role, setRole] = useState<UserRole>("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setUsername(""); setPassword(""); setConfirm(""); setError(""); setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) return setError("Username and password are required.");
    if (password !== confirm) return setError("Passwords do not match.");
    if (password.length < 4) return setError("Password must be at least 4 characters.");
    setLoading(true);
    try {
      const res = await fetch(`${getBackendBase()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password, role }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Registration failed.");
      login(data.user.username, data.user.role as UserRole);
    } catch {
      setError("Could not connect to server. Make sure the app is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) return setError("Username and password are required.");
    setLoading(true);
    try {
      const res = await fetch(`${getBackendBase()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Login failed.");
      login(data.user.username, data.user.role as UserRole);
    } catch {
      setError("Could not connect to server. Make sure the app is running.");
    } finally {
      setLoading(false);
    }
  };

  const roleCard = (r: UserRole, emoji: string, title: string, desc: string) => (
    <button
      type="button"
      onClick={() => setRole(r)}
      style={{
        flex: 1, padding: "1.25rem 1rem", borderRadius: 16, border: "2px solid",
        borderColor: role === r ? "var(--wine)" : "var(--border)",
        background: role === r ? "var(--wine-light)" : "var(--surface-2)",
        cursor: "pointer", textAlign: "left", transition: "all 0.15s",
      }}
    >
      <div style={{ fontSize: "1.75rem", marginBottom: "0.4rem" }}>{emoji}</div>
      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: role === r ? "var(--wine)" : "var(--text)" }}>{title}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", lineHeight: 1.5 }}>{desc}</div>
    </button>
  );

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: "1.5rem",
    }}>
      {/* Logo & School Name */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>⚗️</div>
        <h1 style={{
          margin: 0, fontSize: "2rem", fontWeight: 800,
          letterSpacing: "-0.04em", color: "var(--wine)"
        }}>
          Caesium Vault
        </h1>
        <p style={{ margin: "0.4rem 0 0", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Tunwase High School · Offline Knowledge Hub
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 420,
        background: "var(--surface)", borderRadius: 20,
        border: "1px solid var(--border)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}>

        {/* Choose mode */}
        {mode === "choose" && (
          <div style={{ padding: "2rem" }}>
            <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.2rem", fontWeight: 700 }}>Welcome!</h2>
            <p style={{ margin: "0 0 1.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
              Sign in to your account or create a new one to get started.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                onClick={() => { reset(); setMode("login"); }}
                style={{
                  padding: "0.85rem 1rem", borderRadius: 12, border: "none",
                  background: "var(--wine)", color: "#fff", fontWeight: 700,
                  fontSize: "0.95rem", cursor: "pointer",
                }}
              >
                Sign In to Existing Account
              </button>
              <button
                onClick={() => { reset(); setMode("register"); }}
                style={{
                  padding: "0.85rem 1rem", borderRadius: 12,
                  border: "1.5px solid var(--border)",
                  background: "var(--surface-2)", color: "var(--text)", fontWeight: 600,
                  fontSize: "0.95rem", cursor: "pointer",
                }}
              >
                Create New Account
              </button>
            </div>
          </div>
        )}

        {/* Register */}
        {mode === "register" && (
          <form onSubmit={handleRegister} style={{ padding: "2rem" }}>
            <button
              type="button"
              onClick={() => { reset(); setMode("choose"); }}
              style={{ background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)", fontSize: "0.8rem", padding: 0, marginBottom: "1rem",
                display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              ← Back
            </button>
            <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.1rem", fontWeight: 700 }}>Create Account</h2>
            <p style={{ margin: "0 0 1.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Choose your role, then pick a username and password.
            </p>

            {/* Role picker */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {roleCard("student", "🎒", "Student", "Access library, take exams & join Arena competitions.")}
              {roleCard("teacher", "🏫", "Teacher", "Monitor Arena matches, manage exams & track progress.")}
            </div>

            <label style={{ display: "block", marginBottom: "0.9rem" }}>
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Username</span>
              <input
                type="text" required autoComplete="off"
                value={username} onChange={e => setUsername(e.target.value)}
                placeholder={role === "teacher" ? "e.g. Mr_Adeyemi" : "e.g. jeffreyfeyisetan"}
                style={{
                  width: "100%", padding: "0.65rem 0.9rem", borderRadius: 10,
                  border: "1.5px solid var(--border)", background: "var(--surface-2)",
                  color: "var(--text)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "0.9rem" }}>
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</span>
              <input
                type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="At least 4 characters"
                style={{
                  width: "100%", padding: "0.65rem 0.9rem", borderRadius: 10,
                  border: "1.5px solid var(--border)", background: "var(--surface-2)",
                  color: "var(--text)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "1.25rem" }}>
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Confirm Password</span>
              <input
                type="password" required
                value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Same password again"
                style={{
                  width: "100%", padding: "0.65rem 0.9rem", borderRadius: 10,
                  border: "1.5px solid var(--border)", background: "var(--surface-2)",
                  color: "var(--text)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
                }}
              />
            </label>

            {error && (
              <div style={{ marginBottom: "1rem", padding: "0.65rem 0.9rem", borderRadius: 10,
                background: "#FEE2E2", border: "1px solid #FECACA", color: "#DC2626", fontSize: "0.8rem" }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "0.85rem", borderRadius: 12, border: "none",
                background: loading ? "var(--border)" : "var(--wine)", color: "#fff",
                fontWeight: 700, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating Account..." : `Create ${role === "teacher" ? "Teacher" : "Student"} Account →`}
            </button>

            <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Already have an account?{" "}
              <button type="button" onClick={() => { reset(); setMode("login"); }}
                style={{ background: "none", border: "none", color: "var(--wine)", cursor: "pointer", fontWeight: 600, padding: 0 }}>
                Sign in
              </button>
            </p>
          </form>
        )}

        {/* Login */}
        {mode === "login" && (
          <form onSubmit={handleLogin} style={{ padding: "2rem" }}>
            <button
              type="button"
              onClick={() => { reset(); setMode("choose"); }}
              style={{ background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)", fontSize: "0.8rem", padding: 0, marginBottom: "1rem",
                display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              ← Back
            </button>
            <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.1rem", fontWeight: 700 }}>Sign In</h2>
            <p style={{ margin: "0 0 1.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Enter your username and password to continue.
            </p>

            <label style={{ display: "block", marginBottom: "0.9rem" }}>
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Username</span>
              <input
                type="text" required autoComplete="off"
                value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Your username"
                style={{
                  width: "100%", padding: "0.65rem 0.9rem", borderRadius: 10,
                  border: "1.5px solid var(--border)", background: "var(--surface-2)",
                  color: "var(--text)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "1.25rem" }}>
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</span>
              <input
                type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                style={{
                  width: "100%", padding: "0.65rem 0.9rem", borderRadius: 10,
                  border: "1.5px solid var(--border)", background: "var(--surface-2)",
                  color: "var(--text)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
                }}
              />
            </label>

            {error && (
              <div style={{ marginBottom: "1rem", padding: "0.65rem 0.9rem", borderRadius: 10,
                background: "#FEE2E2", border: "1px solid #FECACA", color: "#DC2626", fontSize: "0.8rem" }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "0.85rem", borderRadius: 12, border: "none",
                background: loading ? "var(--border)" : "var(--wine)", color: "#fff",
                fontWeight: 700, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>

            <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              New here?{" "}
              <button type="button" onClick={() => { reset(); setMode("register"); }}
                style={{ background: "none", border: "none", color: "var(--wine)", cursor: "pointer", fontWeight: 600, padding: 0 }}>
                Create account
              </button>
            </p>
          </form>
        )}
      </div>

      {/* Footer */}
      <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
        Fully offline · LAN-powered · No internet required
      </p>
    </div>
  );
}
