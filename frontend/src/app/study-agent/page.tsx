"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../components/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AgentStatus {
  online: boolean;
  models: string[];
  activeModel: string;
  message?: string;
}

const SUBJECTS = [
  { id: "General", label: "General Study", emoji: "💡" },
  { id: "Mathematics", label: "Mathematics", emoji: "📐" },
  { id: "Basic Science", label: "Science", emoji: "🔬" },
  { id: "English", label: "English & Lit", emoji: "📖" },
  { id: "Physics & Chemistry", label: "Physics & Chem", emoji: "⚛️" },
  { id: "Biology", label: "Biology", emoji: "🧬" },
];

const STARTER_PROMPTS = [
  { title: "Pythagoras Theorem", prompt: "Explain Pythagoras' Theorem with a step-by-step example problem.", subject: "Mathematics" },
  { title: "Algebraic Equations", prompt: "How do I solve equations like 3x + 7 = 22? Show working.", subject: "Mathematics" },
  { title: "Plant vs Animal Cells", prompt: "What are the main differences between plant and animal cells?", subject: "Biology" },
  { title: "Parts of Speech", prompt: "Explain the 8 parts of speech in English with examples.", subject: "English" },
  { title: "Newton's Laws", prompt: "Explain Newton's Three Laws of Motion with real-world examples.", subject: "Physics & Chemistry" },
];

export default function StudyAgentPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `👋 **Welcome to the Caesium Vault Study Agent!**\n\nI am your offline AI tutor for Tunwase High School. I can help explain concepts, break down complex math problems step-by-step, review exam topics, and help you understand your textbooks.\n\nChoose a subject above or ask me any question below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("General");
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getBackendBase = () => {
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.hostname}:3001`;
    }
    return "http://localhost:3001";
  };

  const checkStatus = async () => {
    try {
      const res = await fetch(`${getBackendBase()}/api/study-agent/status`);
      const data = await res.json();
      setAgentStatus(data);
    } catch {
      setAgentStatus({ online: false, models: [], activeModel: "None", message: "Cannot reach backend server" });
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${getBackendBase()}/api/study-agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.slice(-6).map((m) => ({ role: m.role, text: m.content })),
          subject: selectedSubject,
          classLevel: user?.role === "teacher" ? "Teacher Resource" : "JSS1-SS3",
        }),
      });

      const data = await res.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      if (data.ollamaOnline !== undefined) {
        setAgentStatus((prev) => ({
          online: data.ollamaOnline,
          models: prev?.models || [],
          activeModel: data.model || prev?.activeModel || "llama3.2",
        }));
      }
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ Could not connect to the backend Study Agent service. Please ensure the server is running.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 4rem)" }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
            Study <span style={{ color: "var(--wine)" }}>Agent</span>
          </h1>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Offline AI Academic Tutor · Tunwase High School
          </p>
        </div>

        {/* Status Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={() => setShowSetupModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "0.35rem 0.8rem",
              borderRadius: 999,
              cursor: "pointer",
              border: `1px solid ${
                agentStatus?.online
                  ? "color-mix(in srgb, var(--accent-green) 35%, transparent)"
                  : "color-mix(in srgb, #D97706 35%, transparent)"
              }`,
              background: agentStatus?.online
                ? "color-mix(in srgb, var(--accent-green) 12%, transparent)"
                : "color-mix(in srgb, #D97706 12%, transparent)",
              color: agentStatus?.online ? "var(--accent-green)" : "#D97706",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: agentStatus?.online ? "var(--accent-green)" : "#D97706",
              }}
            />
            {agentStatus?.online
              ? `AI Online (${agentStatus.activeModel})`
              : "AI Offline · Launch Setup"}
          </button>
        </div>
      </div>

      {/* Subject Pills */}
      <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "0.6rem", marginBottom: "0.5rem" }}>
        {SUBJECTS.map((sub) => {
          const isSelected = selectedSubject === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.35rem 0.75rem",
                borderRadius: 999,
                fontSize: "0.78rem",
                fontWeight: isSelected ? 700 : 500,
                border: isSelected ? "1.5px solid var(--wine)" : "1px solid var(--border)",
                background: isSelected ? "var(--wine-light)" : "var(--surface)",
                color: isSelected ? "var(--wine)" : "var(--text-muted)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              <span>{sub.emoji}</span>
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Stream */}
      <div
        style={{
          flex: 1,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "1.25rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start",
                maxWidth: "100%",
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: "0.85rem 1.1rem",
                  borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: isUser ? "var(--wine)" : "var(--surface-2)",
                  color: isUser ? "#ffffff" : "var(--text)",
                  border: isUser ? "none" : "1px solid var(--border)",
                  fontSize: "0.92rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                {!isUser && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--wine)" }}>
                    <span>🤖</span> Caesium Study Agent
                  </div>
                )}
                <div>{m.content}</div>
                <div
                  style={{
                    fontSize: "0.68rem",
                    color: isUser ? "rgba(255,255,255,0.7)" : "var(--text-muted)",
                    textAlign: "right",
                    marginTop: "0.4rem",
                  }}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.85rem", padding: "0.5rem" }}>
            <span style={{ animation: "pulse 1s infinite" }}>💭</span>
            <span>Study Agent is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      {messages.length <= 2 && (
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", padding: "0.6rem 0" }}>
          {STARTER_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedSubject(p.subject);
                handleSend(p.prompt);
              }}
              style={{
                flexShrink: 0,
                fontSize: "0.76rem",
                padding: "0.4rem 0.8rem",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                color: "var(--text)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              💡 {p.title}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          display: "flex",
          gap: "0.5rem",
          marginTop: "0.75rem",
          paddingBottom: "0.5rem",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${selectedSubject}... (e.g. "Explain photosynthesis" or "Solve 2x + 5 = 15")`}
          disabled={loading}
          style={{
            flex: 1,
            padding: "0.8rem 1rem",
            borderRadius: 12,
            border: "1.5px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
            fontSize: "0.92rem",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            padding: "0.8rem 1.4rem",
            borderRadius: 12,
            border: "none",
            background: !input.trim() || loading ? "var(--border)" : "var(--wine)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: !input.trim() || loading ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          Send 🚀
        </button>
      </form>

      {/* Setup Instructions Modal */}
      {showSetupModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setShowSetupModal(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "2rem",
              maxWidth: 520,
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🦙</span>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Ollama AI Setup Guide</h3>
              </div>
              <button
                onClick={() => setShowSetupModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              Caesium Vault uses <strong>Ollama</strong> to provide 100% offline, local AI assistance without needing an internet connection.
            </p>

            <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: "1rem", border: "1px solid var(--border)", margin: "1rem 0" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
                Commands to launch on the Host Laptop:
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "0.82rem", background: "rgba(0,0,0,0.1)", padding: "0.5rem 0.75rem", borderRadius: 8, color: "var(--wine)", marginBottom: "0.5rem" }}>
                ollama run llama3.2
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Lightweight alternatives: <code>ollama run qwen2.5:0.5b</code> or <code>ollama run deepseek-r1:1.5b</code>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                onClick={() => {
                  checkStatus();
                  setShowSetupModal(false);
                }}
                style={{
                  padding: "0.6rem 1.2rem",
                  borderRadius: 10,
                  border: "none",
                  background: "var(--wine)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Check Status & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
