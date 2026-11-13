"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../components/AuthContext";

/* ─── Types ─── */
interface ArenaQuestion {
  id: number;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  topic: string;
}

interface Participant {
  socketId: string;
  name: string;
  classGroup: string;
  score: number;
  streak: number;
  answeredThisRound?: boolean;
  hasAnswered?: boolean;
}

interface ArenaState {
  status: "lobby" | "in_progress" | "ended";
  participants: Participant[];
  currentQuestion: ArenaQuestion | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  timerRemaining: number;
  timerSeconds: number;
  matchTitle: string;
}

interface RoundResult {
  correct_option: string;
  explanation: string;
}

interface AnswerFeedback {
  isCorrect: boolean;
  pointsEarned: number;
  streak: number;
  chosen?: string;
  correct_option?: string;
  explanation: string;
}

/* ─── Backend URL helper ─── */
const getBackendBase = () =>
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : "http://localhost:3001";

/* ─── Colour constants ─── */
const AMBER = "#D97706";
const AMBER_LIGHT = "color-mix(in srgb, #D97706 12%, transparent)";
const AMBER_BORDER = "color-mix(in srgb, #D97706 30%, transparent)";

/* ══════════════════════════════════════════════════════════════════
   MAIN ARENA PAGE
══════════════════════════════════════════════════════════════════ */
export default function ArenaPage() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  /* Shared state */
  const [arenaState, setArenaState] = useState<ArenaState>({
    status: "lobby",
    participants: [],
    currentQuestion: null,
    currentQuestionIndex: 0,
    totalQuestions: 0,
    timerRemaining: 0,
    timerSeconds: 30,
    matchTitle: "Math Arena",
  });
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [timerDisplay, setTimerDisplay] = useState(0);

  /* Teacher state */
  const [teacherClaimed, setTeacherClaimed] = useState(false);
  const [matchTitle, setMatchTitle] = useState("Math Arena");
  const [questionCount, setQuestionCount] = useState(10);
  const [timerSeconds, setTimerSeconds] = useState(30);

  /* Student state */
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("JSS1");
  const [hasJoined, setHasJoined] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback | null>(null);
  const [mySocketId, setMySocketId] = useState<string>("");

  /* Track last seen question index to clear answer states */
  const lastQuestionIndexRef = useRef<number>(-1);

  /* ── Socket setup ── */
  useEffect(() => {
    const socket = io(getBackendBase(), { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setMySocketId(socket.id ?? "");
    });
    socket.on("disconnect", () => setConnected(false));

    socket.on("arena_state_update", (state: ArenaState) => {
      setArenaState(state);
      setTimerDisplay(state.timerRemaining);

      /* When question advances to a new question index, reset local round UI */
      if (state.currentQuestionIndex !== lastQuestionIndexRef.current) {
        lastQuestionIndexRef.current = state.currentQuestionIndex;
        setSelectedAnswer(null);
        setAnswerFeedback(null);
        setRoundResult(null);
      }
    });

    socket.on("arena_timer_tick", ({ timerRemaining }: { timerRemaining: number }) => {
      setTimerDisplay(timerRemaining);
    });

    socket.on("arena_round_result", (result: RoundResult) => {
      setRoundResult(result);
    });

    socket.on("answer_feedback", (fb: AnswerFeedback) => {
      setAnswerFeedback(fb);
    });

    socket.on("student_joined_success", () => {
      setHasJoined(true);
    });

    socket.on("teacher_control_confirmed", () => {
      setTeacherClaimed(true);
    });

    socket.on("error_message", (msg: string) => {
      alert("⚠️ " + msg);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* ── Teacher actions ── */
  const claimControl = () => {
    socketRef.current?.emit("teacher_claim_control", {
      teacherName: user?.username ?? "Teacher",
    });
  };

  const startMatch = () => {
    socketRef.current?.emit("teacher_start_match", {
      questionCount,
      timerSeconds,
      matchTitle,
    });
  };

  const nextQuestion = () => {
    socketRef.current?.emit("teacher_next_question");
  };

  const endMatch = () => {
    socketRef.current?.emit("teacher_end_match");
  };

  const resetLobby = () => {
    socketRef.current?.emit("teacher_reset_lobby");
    setTeacherClaimed(false);
    setRoundResult(null);
    setSelectedAnswer(null);
    setAnswerFeedback(null);
  };

  /* ── Student actions ── */
  const joinArena = () => {
    if (!studentName.trim()) return;
    socketRef.current?.emit("student_join_arena", {
      name: studentName.trim(),
      classGroup: studentClass,
    });
  };

  /* Allow student to select or change answer at any point before round ends */
  const submitAnswer = useCallback(
    (option: string) => {
      if (roundResult) return; // locked once round finishes
      setSelectedAnswer(option);
      socketRef.current?.emit("student_submit_answer", { choice: option, answer: option });
    },
    [roundResult]
  );

  /* ── Sorted leaderboard ── */
  const sortedParticipants = [...arenaState.participants].sort(
    (a, b) => b.score - a.score
  );

  /* ══ RENDER ══ */
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{
          fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800,
          letterSpacing: "-0.03em", margin: "0 0 0.4rem",
          color: "var(--text)",
        }}>
          Math <span style={{ color: AMBER }}>Arena</span>
        </h1>
        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", margin: 0 }}>
          Real-time inter-class mathematics competition
        </p>
        {/* Connection badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          marginTop: "0.5rem", fontSize: "0.7rem", fontWeight: 600,
          color: connected ? "var(--accent-green)" : "#ef4444",
          background: connected
            ? "color-mix(in srgb, var(--accent-green) 12%, transparent)"
            : "color-mix(in srgb, #ef4444 12%, transparent)",
          border: `1px solid ${connected
            ? "color-mix(in srgb, var(--accent-green) 30%, transparent)"
            : "color-mix(in srgb, #ef4444 30%, transparent)"}`,
          padding: "0.2rem 0.65rem", borderRadius: 999,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: connected ? "var(--accent-green)" : "#ef4444",
          }} />
          {connected ? "Live" : "Connecting…"}
        </div>
      </div>

      {/* ── Teacher View ── */}
      {user?.role === "teacher" && (
        <TeacherPanel
          state={arenaState}
          roundResult={roundResult}
          teacherClaimed={teacherClaimed}
          matchTitle={matchTitle} setMatchTitle={setMatchTitle}
          questionCount={questionCount} setQuestionCount={setQuestionCount}
          timerSeconds={timerSeconds} setTimerSeconds={setTimerSeconds}
          timerDisplay={timerDisplay}
          sortedParticipants={sortedParticipants}
          onClaim={claimControl}
          onStart={startMatch}
          onNext={nextQuestion}
          onEnd={endMatch}
          onReset={resetLobby}
        />
      )}

      {/* ── Student View ── */}
      {user?.role === "student" && (
        <StudentPanel
          state={arenaState}
          hasJoined={hasJoined}
          studentName={studentName} setStudentName={setStudentName}
          studentClass={studentClass} setStudentClass={setStudentClass}
          selectedAnswer={selectedAnswer}
          answerFeedback={answerFeedback}
          roundResult={roundResult}
          timerDisplay={timerDisplay}
          sortedParticipants={sortedParticipants}
          mySocketId={mySocketId}
          onJoin={joinArena}
          onAnswer={submitAnswer}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TEACHER PANEL
══════════════════════════════════════════════════════════════════ */
interface TeacherPanelProps {
  state: ArenaState;
  roundResult: RoundResult | null;
  teacherClaimed: boolean;
  matchTitle: string; setMatchTitle: (v: string) => void;
  questionCount: number; setQuestionCount: (v: number) => void;
  timerSeconds: number; setTimerSeconds: (v: number) => void;
  timerDisplay: number;
  sortedParticipants: Participant[];
  onClaim: () => void; onStart: () => void;
  onNext: () => void; onEnd: () => void; onReset: () => void;
}

function TeacherPanel({
  state, roundResult, teacherClaimed,
  matchTitle, setMatchTitle, questionCount, setQuestionCount,
  timerSeconds, setTimerSeconds, timerDisplay,
  sortedParticipants, onClaim, onStart, onNext, onEnd, onReset,
}: TeacherPanelProps) {
  const card: React.CSSProperties = {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 16, padding: "1.5rem", marginBottom: "1.25rem",
  };

  /* Lobby */
  if (state.status === "lobby") {
    return (
      <div>
        {!teacherClaimed ? (
          <div style={{ ...card, textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🏫</div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 0.5rem", color: "var(--text)" }}>
              Claim Host Control
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
              You&apos;ll be the match controller. Students join while you set up.
            </p>
            <button onClick={onClaim} style={amberBtn}>
              🎮 Claim Host Control
            </button>
          </div>
        ) : (
          <div>
            {/* Setup form */}
            <div style={card}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem", color: "var(--text)" }}>
                ⚙️ Match Setup
              </h2>
              <label style={labelStyle}>Match Title</label>
              <input
                value={matchTitle}
                onChange={(e) => setMatchTitle(e.target.value)}
                style={inputStyle}
                placeholder="e.g. JSS2 Inter-Class Challenge"
              />
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={labelStyle}>Questions Count</label>
                  <select value={questionCount} onChange={(e) => setQuestionCount(+e.target.value)} style={inputStyle}>
                    {[5, 10, 15, 20, 25, 30].map(n => <option key={n} value={n}>{n} questions</option>)}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={labelStyle}>Time per Question</label>
                  <select value={timerSeconds} onChange={(e) => setTimerSeconds(+e.target.value)} style={inputStyle}>
                    {[15, 20, 30, 45, 60].map(s => <option key={s} value={s}>{s} seconds</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={onStart}
                disabled={state.participants.length === 0}
                style={{ ...amberBtn, marginTop: "1.25rem", width: "100%",
                  opacity: state.participants.length === 0 ? 0.5 : 1 }}
              >
                ▶ Start Match
                {state.participants.length === 0 && " (waiting for students to join…)"}
              </button>
            </div>

            {/* Waiting room */}
            <div style={card}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.75rem", color: "var(--text)" }}>
                🕐 Waiting Room — {state.participants.length} joined
              </h3>
              {state.participants.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  No students yet. Tell students to open the IP address on their device to join.
                </p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {state.participants.map((p, idx) => (
                    <div
                      key={p.socketId ? `${p.socketId}-${idx}` : `teacher-participant-${idx}`}
                      style={{
                        padding: "0.35rem 0.75rem", borderRadius: 20,
                        background: AMBER_LIGHT, border: `1px solid ${AMBER_BORDER}`,
                        fontSize: "0.8rem", fontWeight: 600, color: AMBER,
                      }}
                    >
                      🎒 {p.name} <span style={{ fontWeight: 400, opacity: 0.8 }}>({p.classGroup})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* In Progress */
  if (state.status === "in_progress") {
    const q = state.currentQuestion;
    const pct = state.timerSeconds > 0 ? (timerDisplay / state.timerSeconds) * 100 : 0;
    return (
      <div>
        {/* Controls bar */}
        <div style={{
          ...card, display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem",
        }}>
          <div>
            <span style={{ fontWeight: 700, color: "var(--text)" }}>{state.matchTitle}</span>
            <span style={{ color: "var(--text-muted)", marginLeft: "0.75rem", fontSize: "0.85rem" }}>
              Q {state.currentQuestionIndex + 1} / {state.totalQuestions}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={onNext} style={ghostBtn}>Next Question →</button>
            <button onClick={onEnd} style={{ ...ghostBtn, color: "#ef4444", borderColor: "#ef4444" }}>
              End Match
            </button>
          </div>
        </div>

        {/* Timer */}
        <TimerBar pct={pct} remaining={timerDisplay} />

        {/* Current question (teacher view) */}
        {q && (
          <div style={card}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: AMBER, marginBottom: "0.5rem", textTransform: "uppercase" }}>
              {q.topic}
            </div>
            <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text)", marginBottom: "1rem" }}>
              {q.text}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              {(["A","B","C","D"] as const).map(opt => {
                const key = `option_${opt.toLowerCase()}` as keyof ArenaQuestion;
                const isCorrect = roundResult && opt === roundResult.correct_option;
                return (
                  <div key={opt} style={{
                    padding: "0.6rem 0.9rem", borderRadius: 10,
                    border: `1px solid ${isCorrect ? "var(--accent-green)" : "var(--border)"}`,
                    background: isCorrect ? "color-mix(in srgb, var(--accent-green) 15%, transparent)" : "var(--surface-2)",
                    fontSize: "0.88rem", color: "var(--text)", display: "flex", gap: "0.5rem",
                  }}>
                    <span style={{ fontWeight: 700, color: isCorrect ? "var(--accent-green)" : AMBER }}>{opt}.</span>
                    {q[key] as string}
                  </div>
                );
              })}
            </div>
            {roundResult && (
              <div style={{
                marginTop: "0.75rem", padding: "0.6rem 0.9rem", borderRadius: 10,
                background: "color-mix(in srgb, var(--accent-green) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--accent-green) 30%, transparent)",
                fontSize: "0.82rem", color: "var(--text-muted)",
              }}>
                ✅ Correct: <strong>{roundResult.correct_option}</strong> — {roundResult.explanation}
              </div>
            )}
          </div>
        )}

        {/* Live leaderboard */}
        <Leaderboard participants={sortedParticipants} />
      </div>
    );
  }

  /* Ended */
  return (
    <div>
      <Podium participants={sortedParticipants} />
      <FullLeaderboard participants={sortedParticipants} />
      <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
        <button onClick={onReset} style={amberBtn}>🔄 Reset to Lobby</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STUDENT PANEL
══════════════════════════════════════════════════════════════════ */
interface StudentPanelProps {
  state: ArenaState;
  hasJoined: boolean;
  studentName: string; setStudentName: (v: string) => void;
  studentClass: string; setStudentClass: (v: string) => void;
  selectedAnswer: string | null;
  answerFeedback: AnswerFeedback | null;
  roundResult: RoundResult | null;
  timerDisplay: number;
  sortedParticipants: Participant[];
  mySocketId: string;
  onJoin: () => void;
  onAnswer: (opt: string) => void;
}

function StudentPanel({
  state, hasJoined,
  studentName, setStudentName, studentClass, setStudentClass,
  selectedAnswer, answerFeedback, roundResult, timerDisplay,
  sortedParticipants, mySocketId, onJoin, onAnswer,
}: StudentPanelProps) {
  const card: React.CSSProperties = {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 16, padding: "1.5rem", marginBottom: "1.25rem",
  };

  const CLASS_OPTIONS = ["JSS1","JSS2","JSS3","SS1","SS2","SS3"];

  /* ── Join screen ── */
  if (!hasJoined) {
    return (
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <div style={{ ...card, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>⚡</div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 1rem", color: "var(--text)" }}>
            Join the Arena
          </h2>
          <label style={labelStyle}>Your Name</label>
          <input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onJoin()}
            style={inputStyle}
            placeholder="e.g. Amara"
          />
          <label style={{ ...labelStyle, marginTop: "0.75rem" }}>Your Class</label>
          <select value={studentClass} onChange={(e) => setStudentClass(e.target.value)} style={inputStyle}>
            {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={onJoin}
            disabled={!studentName.trim()}
            style={{ ...amberBtn, marginTop: "1.25rem", width: "100%", opacity: studentName.trim() ? 1 : 0.5 }}
          >
            🎮 Join Arena
          </button>
          {state.status === "lobby" && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: "0.75rem" }}>
              Waiting for the teacher to start the match…
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ── Lobby waiting ── */
  if (state.status === "lobby") {
    return (
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <div style={{ ...card, textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🕐</div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.5rem" }}>
            You&apos;re in the lobby!
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1rem" }}>
            Waiting for the teacher to start the match…
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem" }}>
            {state.participants.map((p, idx) => (
              <div
                key={p.socketId ? `${p.socketId}-${idx}` : `student-lobby-${idx}`}
                style={{
                  padding: "0.35rem 0.75rem", borderRadius: 20,
                  background: p.socketId === mySocketId ? AMBER_LIGHT : "var(--surface-2)",
                  border: `1px solid ${p.socketId === mySocketId ? AMBER_BORDER : "var(--border)"}`,
                  fontSize: "0.78rem", fontWeight: p.socketId === mySocketId ? 700 : 500,
                  color: p.socketId === mySocketId ? AMBER : "var(--text-muted)",
                }}
              >
                {p.name} <span style={{ opacity: 0.7 }}>({p.classGroup})</span>
                {p.socketId === mySocketId && " 👈"}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── In Progress ── */
  if (state.status === "in_progress") {
    const q = state.currentQuestion;
    const pct = state.timerSeconds > 0 ? (timerDisplay / state.timerSeconds) * 100 : 0;
    const me = state.participants.find(p => p.socketId === mySocketId);

    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "1.25rem", alignItems: "start" }}>
        {/* Main game area */}
        <div>
          {/* Score + streak bar */}
          <div style={{
            ...card, display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "0.75rem 1.25rem", marginBottom: "1rem",
          }}>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>YOUR SCORE</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: AMBER }}>{me?.score ?? 0}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>QUESTION</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
                {state.currentQuestionIndex + 1} / {state.totalQuestions}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>STREAK</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--wine)" }}>
                {me?.streak ? `🔥 ${me.streak}` : "—"}
              </div>
            </div>
          </div>

          {/* Timer */}
          <TimerBar pct={pct} remaining={timerDisplay} />

          {/* Question card */}
          {q && (
            <div style={card}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: AMBER, marginBottom: "0.5rem", textTransform: "uppercase" }}>
                {q.topic}
              </div>
              <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                {q.text}
              </p>

              {/* Answer options */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {(["A","B","C","D"] as const).map(opt => {
                  const key = `option_${opt.toLowerCase()}` as keyof ArenaQuestion;
                  const isSelected = selectedAnswer === opt;
                  const isCorrect = roundResult && opt === roundResult.correct_option;
                  const isWrong = roundResult && isSelected && opt !== roundResult.correct_option;

                  let bg = "var(--surface-2)";
                  let border = "var(--border)";
                  let color = "var(--text)";
                  if (isCorrect) {
                    bg = "color-mix(in srgb, var(--accent-green) 15%, transparent)";
                    border = "var(--accent-green)";
                    color = "var(--accent-green)";
                  } else if (isWrong) {
                    bg = "color-mix(in srgb, #ef4444 12%, transparent)";
                    border = "#ef4444";
                    color = "#ef4444";
                  } else if (isSelected) {
                    bg = AMBER_LIGHT;
                    border = AMBER;
                    color = AMBER;
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => onAnswer(opt)}
                      disabled={!!roundResult}
                      style={{
                        display: "flex", gap: "0.75rem", alignItems: "center",
                        padding: "0.75rem 1rem", borderRadius: 12,
                        border: `1.5px solid ${border}`, background: bg, color,
                        cursor: roundResult ? "not-allowed" : "pointer",
                        fontSize: "0.9rem", fontWeight: isSelected ? 700 : 500,
                        textAlign: "left", transition: "all 0.15s",
                      }}
                    >
                      <span style={{
                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: "0.8rem",
                        background: isSelected || isCorrect ? border : "var(--border)",
                        color: isSelected || isCorrect ? "#fff" : "var(--text-muted)",
                      }}>
                        {opt}
                      </span>
                      {q[key] as string}
                    </button>
                  );
                })}
              </div>

              {/* Active selection banner (shows student they can change answer before time expires) */}
              {selectedAnswer && !roundResult && (
                <div style={{
                  marginTop: "0.85rem", padding: "0.55rem 0.85rem", borderRadius: 10,
                  background: AMBER_LIGHT, border: `1px solid ${AMBER_BORDER}`,
                  fontSize: "0.82rem", color: AMBER, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.4rem"
                }}>
                  <span>✓ Selected: <strong>Option {selectedAnswer}</strong></span>
                  <span style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                    Tap another option to change before time runs out
                  </span>
                </div>
              )}

              {/* Feedback after round result */}
              {roundResult && (
                <div style={{
                  marginTop: "1rem", padding: "0.85rem 1rem", borderRadius: 12,
                  background: answerFeedback?.isCorrect
                    ? "color-mix(in srgb, var(--accent-green) 12%, transparent)"
                    : "color-mix(in srgb, #ef4444 10%, transparent)",
                  border: `1px solid ${answerFeedback?.isCorrect ? "var(--accent-green)" : "#ef4444"}`,
                  fontSize: "0.88rem",
                }}>
                  <div style={{
                    fontWeight: 700,
                    color: answerFeedback?.isCorrect ? "var(--accent-green)" : "#ef4444",
                    marginBottom: "0.25rem"
                  }}>
                    {answerFeedback?.isCorrect ? "✅ Correct!" : "❌ Incorrect"}
                    {answerFeedback?.isCorrect && ` +${answerFeedback.pointsEarned} pts`}
                    {answerFeedback?.isCorrect && answerFeedback.streak > 1 && ` 🔥 ${answerFeedback.streak}x streak`}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.84rem" }}>
                    ✅ Answer: <strong style={{ color: "var(--accent-green)" }}>{roundResult.correct_option}</strong> — {roundResult.explanation}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar leaderboard */}
        <Leaderboard participants={sortedParticipants} mySocketId={mySocketId} compact />
      </div>
    );
  }

  /* ── Ended ── */
  return (
    <div>
      <Podium participants={sortedParticipants} mySocketId={mySocketId} />
      <FullLeaderboard participants={sortedParticipants} mySocketId={mySocketId} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SHARED ARENA COMPONENTS
══════════════════════════════════════════════════════════════════ */

function TimerBar({ pct, remaining }: { pct: number; remaining: number }) {
  const color = pct > 50 ? "var(--accent-green)" : pct > 25 ? AMBER : "#ef4444";
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Time remaining</span>
        <span style={{ fontSize: "0.9rem", fontWeight: 700, color }}>{remaining}s</span>
      </div>
      <div style={{ height: 8, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${Math.max(0, pct)}%`,
          background: color, borderRadius: 999,
          transition: "width 0.9s linear, background 0.3s",
        }} />
      </div>
    </div>
  );
}

function Leaderboard({ participants, mySocketId, compact }: {
  participants: Participant[];
  mySocketId?: string;
  compact?: boolean;
}) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 16, padding: compact ? "1rem" : "1.5rem",
    }}>
      <h3 style={{ fontSize: compact ? "0.85rem" : "1rem", fontWeight: 700, margin: "0 0 0.75rem", color: "var(--text)" }}>
        🏆 Live Scores
      </h3>
      {participants.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>No participants yet</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {participants.map((p, i) => {
            const isMe = p.socketId === mySocketId;
            return (
              <div
                key={p.socketId ? `${p.socketId}-${i}` : `lead-participant-${i}`}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.4rem 0.6rem", borderRadius: 8,
                  background: isMe ? AMBER_LIGHT : "var(--surface-2)",
                  border: `1px solid ${isMe ? AMBER_BORDER : "transparent"}`,
                }}
              >
                <span style={{ fontWeight: 800, fontSize: "0.78rem", color: "var(--text-muted)", width: 18 }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}.`}
                </span>
                <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: isMe ? 700 : 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}
                </span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: AMBER }}>{p.score}</span>
                {p.streak > 1 && <span style={{ fontSize: "0.7rem" }}>🔥{p.streak}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Podium({ participants, mySocketId }: { participants: Participant[]; mySocketId?: string }) {
  const top3 = participants.slice(0, 3);
  const medals = ["🥇","🥈","🥉"];
  const heights = ["5rem","4rem","3.5rem"];
  const display = [1,0,2]; // show 2nd, 1st, 3rd

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 20, padding: "2rem 1.5rem", marginBottom: "1.25rem", textAlign: "center",
    }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏆</div>
      <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 1.5rem", color: "var(--text)" }}>
        Match Complete!
      </h2>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "0.75rem" }}>
        {display.map(idx => {
          const p = top3[idx];
          if (!p) return <div key={`empty-podium-${idx}`} style={{ width: 90 }} />;
          const isMe = p.socketId === mySocketId;
          return (
            <div key={p.socketId ? `${p.socketId}-${idx}` : `podium-rank-${idx}`} style={{ textAlign: "center", width: 90 }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>{medals[idx]}</div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: isMe ? AMBER : "var(--text)", marginBottom: "0.25rem" }}>
                {p.name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                {p.score} pts
              </div>
              <div style={{
                height: heights[idx], background: idx === 0 ? AMBER : "var(--border)",
                borderRadius: "6px 6px 0 0",
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FullLeaderboard({ participants, mySocketId }: { participants: Participant[]; mySocketId?: string }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 16, padding: "1.5rem",
    }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 0.75rem", color: "var(--text)" }}>
        Final Standings
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
        <thead>
          <tr style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem" }}>
            <th style={{ textAlign: "left", padding: "0.4rem 0.6rem" }}>#</th>
            <th style={{ textAlign: "left", padding: "0.4rem 0.6rem" }}>Name</th>
            <th style={{ textAlign: "left", padding: "0.4rem 0.6rem" }}>Class</th>
            <th style={{ textAlign: "right", padding: "0.4rem 0.6rem" }}>Score</th>
            <th style={{ textAlign: "right", padding: "0.4rem 0.6rem" }}>Best Streak</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p, i) => {
            const isMe = p.socketId === mySocketId;
            return (
              <tr
                key={p.socketId ? `${p.socketId}-${i}` : `full-leaderboard-row-${i}`}
                style={{
                  background: isMe ? AMBER_LIGHT : i % 2 === 0 ? "transparent" : "var(--surface-2)",
                }}
              >
                <td style={{ padding: "0.5rem 0.6rem", fontWeight: 700, color: "var(--text-muted)" }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}`}
                </td>
                <td style={{ padding: "0.5rem 0.6rem", fontWeight: isMe ? 700 : 500, color: isMe ? AMBER : "var(--text)" }}>
                  {p.name} {isMe && "(You)"}
                </td>
                <td style={{ padding: "0.5rem 0.6rem", color: "var(--text-muted)" }}>{p.classGroup}</td>
                <td style={{ padding: "0.5rem 0.6rem", textAlign: "right", fontWeight: 700, color: AMBER }}>{p.score}</td>
                <td style={{ padding: "0.5rem 0.6rem", textAlign: "right", color: "var(--text-muted)" }}>
                  {p.streak > 1 ? `🔥 ${p.streak}` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ═══ Shared style helpers ═══ */
const amberBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
  padding: "0.65rem 1.5rem", borderRadius: 10, border: "none",
  background: AMBER, color: "#fff", fontWeight: 700, fontSize: "0.9rem",
  cursor: "pointer", transition: "opacity 0.15s",
};

const ghostBtn: React.CSSProperties = {
  padding: "0.5rem 0.9rem", borderRadius: 8,
  border: "1px solid var(--border)", background: "transparent",
  color: "var(--text-muted)", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.78rem", fontWeight: 600,
  color: "var(--text-muted)", marginBottom: "0.3rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.55rem 0.8rem", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--surface-2)",
  color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box",
};
