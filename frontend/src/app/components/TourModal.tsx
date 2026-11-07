"use client";

import { useEffect, useState } from "react";

const STEPS = [
  {
    title: "Welcome to Caesium Vault! 🎓",
    body: "Caesium Vault is your school's offline knowledge hub. Everything here works without internet — powered by the server running right here in school.",
    emoji: "⚗️",
  },
  {
    title: "Library & Archives 📚",
    body: "The Library holds textbooks, WAEC past questions, PhET science simulations, MathOverflow archives, and more. Browse, preview, and download anything anytime.",
    emoji: "📚",
  },
  {
    title: "CBT Exams ✅",
    body: "Take official school assessments in a WAEC-style timed environment. Your scores are recorded on the leaderboard — compete with your classmates!",
    emoji: "✅",
  },
  {
    title: "Math Arena ⚡",
    body: "Challenge other classes in live, real-time mathematics competitions. May the best class win! (Coming soon — watch this space.)",
    emoji: "⚡",
  },
];

export default function TourModal() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<"ask" | number>("ask");

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const seen = localStorage.getItem("caesium_tour_seen");
        if (!seen) setShow(true);
      } catch {
        // Ignore storage errors
      }
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem("caesium_tour_seen", "true");
    } catch {
      // Ignore storage errors
    }
    setShow(false);
  };

  const startTour = () => setStep(0);

  const next = () => {
    if (typeof step === "number") {
      if (step < STEPS.length - 1) {
        setStep(step + 1);
      } else {
        dismiss();
      }
    }
  };

  const back = () => {
    if (typeof step === "number" && step > 0) setStep(step - 1);
  };

  if (!show) return null;

  return (
    /* Backdrop */
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      {/* Card */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "2rem",
          maxWidth: 480,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {step === "ask" ? (
          /* ── Welcome prompt ── */
          <>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>⚗️</div>
              <h2 style={{
                fontSize: "1.4rem", fontWeight: 800, color: "var(--text)",
                margin: "0 0 0.5rem", letterSpacing: "-0.02em",
              }}>
                Welcome to Caesium Vault
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                Looks like it&apos;s your first time here! Would you like a quick tour?
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={startTour}
                style={{
                  padding: "0.7rem 1.5rem", borderRadius: 10,
                  background: "var(--wine)", color: "#fff",
                  border: "none", cursor: "pointer",
                  fontWeight: 700, fontSize: "0.9rem",
                }}
              >
                Yes, show me around 👀
              </button>
              <button
                onClick={dismiss}
                style={{
                  padding: "0.7rem 1.5rem", borderRadius: 10,
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  cursor: "pointer", fontWeight: 500, fontSize: "0.9rem",
                }}
              >
                Skip for now
              </button>
            </div>
          </>
        ) : (
          /* ── Tour step ── */
          <>
            {/* Step badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              fontSize: "0.72rem", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.06em",
              color: "var(--wine)",
              background: "var(--wine-light)",
              border: "1px solid color-mix(in srgb, var(--wine) 30%, transparent)",
              padding: "0.25rem 0.75rem", borderRadius: "999px",
              marginBottom: "1.25rem",
            }}>
              Step {(step as number) + 1} of {STEPS.length}
            </div>

            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                {STEPS[step as number].emoji}
              </div>
              <h2 style={{
                fontSize: "1.25rem", fontWeight: 800, color: "var(--text)",
                margin: "0 0 0.75rem", letterSpacing: "-0.02em",
              }}>
                {STEPS[step as number].title}
              </h2>
              <p style={{
                color: "var(--text-muted)", fontSize: "0.92rem",
                lineHeight: 1.65, margin: 0,
              }}>
                {STEPS[step as number].body}
              </p>
            </div>

            {/* Progress dots */}
            <div style={{
              display: "flex", justifyContent: "center", gap: "0.4rem",
              marginBottom: "1.5rem",
            }}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === step ? 20 : 8, height: 8,
                    borderRadius: 999,
                    background: i === step ? "var(--wine)" : "var(--border)",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={back}
                disabled={(step as number) === 0}
                style={{
                  padding: "0.6rem 1.25rem", borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "transparent", color: "var(--text-muted)",
                  cursor: (step as number) === 0 ? "not-allowed" : "pointer",
                  opacity: (step as number) === 0 ? 0.4 : 1,
                  fontWeight: 500, fontSize: "0.88rem",
                }}
              >
                ← Back
              </button>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={dismiss}
                  style={{
                    padding: "0.6rem 1rem", borderRadius: 10,
                    border: "none", background: "transparent",
                    color: "var(--text-muted)", cursor: "pointer",
                    fontSize: "0.82rem",
                  }}
                >
                  Skip tour
                </button>
                <button
                  onClick={next}
                  style={{
                    padding: "0.6rem 1.4rem", borderRadius: 10,
                    background: "var(--wine)", color: "#fff",
                    border: "none", cursor: "pointer",
                    fontWeight: 700, fontSize: "0.9rem",
                  }}
                >
                  {(step as number) === STEPS.length - 1 ? "Finish 🎉" : "Next →"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
