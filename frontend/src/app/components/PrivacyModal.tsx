"use client";

import { useState } from "react";

export default function PrivacyModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "2rem",
          maxWidth: 580,
          width: "100%",
          maxHeight: "88vh",
          overflowY: "auto",
          boxShadow: "0 25px 70px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--border)",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.4rem" }}>🛡️</span>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text)", margin: 0 }}>
                Data Protection & Privacy
              </h3>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>
                NDPA 2023 & NDPC Compliance Notice
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "var(--surface-2)",
              color: "var(--text-muted)",
              width: 32,
              height: 32,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            ✕
          </button>
        </div>

        {/* Core Principles */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.6 }}>
          <div
            style={{
              background: "color-mix(in srgb, var(--accent-green) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--accent-green) 30%, transparent)",
              borderRadius: 12,
              padding: "0.85rem 1rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: "1.2rem", marginTop: -2 }}>🇳🇬</span>
            <div>
              <strong style={{ color: "var(--accent-green)", display: "block", fontSize: "0.88rem" }}>
                100% Offline & Local Data Processing
              </strong>
              Caesium Vault operates solely on the school&apos;s local intranet server. No student data, test answers, or personal identifiers ever leave the school premises or get transmitted to any cloud servers.
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.35rem", color: "var(--wine)" }}>
              1. Child Data Protection (NDPA Section 31)
            </h4>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              Student names and classes are collected solely for authenticating exam test sessions and recording academic progress within Tunwase High School. Students can choose to display an anonymized alias on public class leaderboards to safeguard their identity.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.35rem", color: "var(--wine)" }}>
              2. Data Minimization (NDPA Section 24)
            </h4>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              We do not collect phone numbers, emails, home addresses, biometric data, or track device browser fingerprints. Only essential test answers and scores are held in the local SQLite vault database.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.35rem", color: "var(--wine)" }}>
              3. Right to Erasure & School Administration (NDPA Section 34)
            </h4>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              All mock exam submissions and test logs can be deleted upon request or wiped at the end of each academic term by authorized school administrators using the administrative passcode.
            </p>
          </div>

          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "0.75rem 1rem",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            <strong>Regulatory Standard:</strong> Fully aligned with the <em>Nigeria Data Protection Act (NDPA) 2023</em> enforced by the <em>Nigeria Data Protection Commission (NDPC)</em>.
          </div>
        </div>

        {/* Footer Button */}
        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "0.6rem 1.5rem",
              borderRadius: 10,
              background: "var(--wine)",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
