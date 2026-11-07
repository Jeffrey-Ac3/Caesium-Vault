"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface Exam {
  id: number;
  title: string;
  grade_level: string;
  subject: string;
  duration_minutes: number;
  total_questions: number;
  instructions: string;
  actual_question_count: number;
  total_submissions: number;
  high_score: number | null;
}

interface Question {
  id: number;
  exam_id: number;
  question_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface ReviewItem {
  question_number: number;
  question_text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  student_choice: string | null;
  correct_option: string;
  is_correct: boolean;
  explanation: string;
}

interface SubmissionResult {
  submission_id: number;
  student_name: string;
  student_class: string;
  score: number;
  total_questions: number;
  percentage: number;
  grade: string;
  time_spent_seconds: number;
  review: ReviewItem[];
}

interface LeaderboardEntry {
  id: number;
  student_name: string;
  student_class: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_spent_seconds: number;
  submitted_at: string;
}

export default function CBTPage() {
  const [view, setView] = useState<"lobby" | "exam" | "result">("lobby");

  // Lobby State
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState("All");

  // Student Entry Modal State
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("JSS1");
  const [anonymousLeaderboard, setAnonymousLeaderboard] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);

  // Active Exam Session State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [qNum: number]: string }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Result & Review State
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "incorrect">("all");

  // Leaderboard Modal State
  const [leaderboardExam, setLeaderboardExam] = useState<Exam | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Admin Clear Submissions Modal State (NDPA Right to Erasure)
  const [showAdminClearModal, setShowAdminClearModal] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [clearingSubmissions, setClearingSubmissions] = useState(false);
  const [clearMessage, setClearMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const getBackendBase = () => {
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.hostname}:3001`;
    }
    return "http://localhost:3001";
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = () => {
    setLoadingExams(true);
    fetch(`${getBackendBase()}/api/cbt/exams`)
      .then((res) => res.json())
      .then((data) => {
        setExams(data.exams || []);
        setLoadingExams(false);
      })
      .catch((err) => {
        console.error("Error loading exams:", err);
        setLoadingExams(false);
      });
  };

  const initiateExamStart = (exam: Exam) => {
    setActiveExam(exam);
    if (exam.grade_level !== "All" && exam.grade_level !== "Inter-Class") {
      setStudentClass(exam.grade_level);
    }
    setShowStartModal(true);
  };

  const handleStartExamConfirmed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExam || !studentName.trim()) return;

    setShowStartModal(false);
    setLoadingExams(true);

    fetch(`${getBackendBase()}/api/cbt/exams/${activeExam.id}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setFlaggedQuestions(new Set());
        setSecondsRemaining((activeExam.duration_minutes || 30) * 60);
        setView("exam");
        setLoadingExams(false);
      })
      .catch((err) => {
        console.error("Failed to load questions:", err);
        alert("Could not load exam questions. Please ensure the backend is running.");
        setLoadingExams(false);
      });
  };

  useEffect(() => {
    if (view === "exam" && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view, secondsRemaining]);

  const handleSelectOption = (optionKey: string) => {
    const qNum = questions[currentQuestionIndex].question_number;
    setAnswers((prev) => ({
      ...prev,
      [qNum]: optionKey,
    }));
  };

  const toggleFlag = (qNum: number) => {
    setFlaggedQuestions((prev) => {
      const updated = new Set(prev);
      if (updated.has(qNum)) updated.delete(qNum);
      else updated.add(qNum);
      return updated;
    });
  };

  const handleAutoSubmit = () => {
    submitExamAnswers();
  };

  const submitExamAnswers = () => {
    if (!activeExam) return;
    setSubmitting(true);
    setShowSubmitConfirm(false);

    const totalDurationSeconds = (activeExam.duration_minutes || 30) * 60;
    const timeSpentSeconds = Math.max(1, totalDurationSeconds - secondsRemaining);

    fetch(`${getBackendBase()}/api/cbt/exams/${activeExam.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_name: studentName.trim(),
        student_class: studentClass.trim(),
        answers,
        time_spent_seconds: timeSpentSeconds,
        anonymous_on_leaderboard: anonymousLeaderboard,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResult(data);
        setView("result");
        setSubmitting(false);
      })
      .catch((err) => {
        console.error("Submission failed:", err);
        alert("Failed to record score. Please try again.");
        setSubmitting(false);
      });
  };

  const openLeaderboard = (exam: Exam) => {
    setLeaderboardExam(exam);
    setLoadingLeaderboard(true);
    fetch(`${getBackendBase()}/api/cbt/exams/${exam.id}/leaderboard`)
      .then((res) => res.json())
      .then((data) => {
        setLeaderboardData(data.leaderboard || []);
        setLoadingLeaderboard(false);
      })
      .catch((err) => {
        console.error("Leaderboard fetch failed:", err);
        setLoadingLeaderboard(false);
      });
  };

  const handleAdminClearSubmissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasscode.trim()) return;

    setClearingSubmissions(true);
    setClearMessage(null);

    try {
      const res = await fetch(`${getBackendBase()}/api/admin/clear-submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passcode: adminPasscode.trim(),
          examId: leaderboardExam ? leaderboardExam.id : "all",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to clear student records.");
      }

      setClearMessage({
        type: "success",
        text: data.message || "Records deleted successfully.",
      });
      setAdminPasscode("");
      fetchExams();

      if (leaderboardExam) {
        setLeaderboardData([]);
      }

      setTimeout(() => {
        setShowAdminClearModal(false);
        setClearMessage(null);
      }, 1800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error clearing records";
      setClearMessage({ type: "error", text: msg });
    } finally {
      setClearingSubmissions(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatSecondsToMinutes = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const filteredExams = exams.filter((e) => {
    if (selectedGradeFilter === "All") return true;
    return e.grade_level === selectedGradeFilter;
  });

  const answeredCount = Object.keys(answers).length;
  const currentQ = questions[currentQuestionIndex];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* =========================================================================
          VIEW 1: EXAM LOBBY
         ========================================================================= */}
      {view === "lobby" && (
        <div>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "1rem",
              marginBottom: "2rem",
              paddingBottom: "1.5rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--wine)",
                    background: "var(--wine-light)",
                    padding: "0.25rem 0.65rem",
                    borderRadius: "999px",
                  }}
                >
                  WAEC / BECE Standard Simulator
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Tunwase High School
                </span>
              </div>
              <h1
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  margin: "0 0 0.5rem",
                  color: "var(--text)",
                }}
              >
                CBT <span style={{ color: "var(--wine)" }}>Exams</span>
              </h1>
              <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", margin: 0, maxWidth: 650, lineHeight: 1.6 }}>
                Official computer-based testing engine calibrated strictly to Nigerian curriculum standards.
                Practice under realistic timing and compete on the inter-class leaderboard.
              </p>
            </div>

            {/* Admin Reset Button */}
            <div>
              <button
                onClick={() => {
                  setLeaderboardExam(null);
                  setShowAdminClearModal(true);
                  setClearMessage(null);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.5rem 1rem",
                  borderRadius: 10,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--wine)";
                  e.currentTarget.style.color = "var(--wine)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                <span>🛡️</span>
                <span>Admin: Reset Records</span>
              </button>
            </div>
          </div>

          {/* Grade Filter Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
              Filter Tier:
            </span>
            {["All", "JSS1", "JSS2", "JSS3", "Inter-Class"].map((grade) => {
              const active = selectedGradeFilter === grade;
              return (
                <button
                  key={grade}
                  onClick={() => setSelectedGradeFilter(grade)}
                  style={{
                    padding: "0.4rem 0.95rem",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    border: active ? "1px solid var(--wine)" : "1px solid var(--border)",
                    background: active ? "var(--wine-light)" : "var(--surface)",
                    color: active ? "var(--wine)" : "var(--text-muted)",
                    transition: "all 0.15s",
                  }}
                >
                  {grade === "Inter-Class" ? "🏆 Inter-Class Clash" : grade}
                </button>
              );
            })}
          </div>

          {/* Exams Grid */}
          {loadingExams ? (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
              <div style={{ fontSize: "0.9rem" }}>Loading available CBT examinations...</div>
            </div>
          ) : filteredExams.length === 0 ? (
            <div
              style={{
                background: "var(--surface)",
                border: "1px dashed var(--border)",
                borderRadius: 20,
                padding: "3.5rem 2rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📝</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.5rem" }}>
                No Exams Found
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0 }}>
                No examination matches the selected tier. Select another grade level above.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {filteredExams.map((exam) => (
                <div
                  key={exam.id}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--wine)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    {/* Header Badges */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.65rem",
                          borderRadius: "999px",
                          background: "var(--wine-light)",
                          color: "var(--wine)",
                          border: "1px solid color-mix(in srgb, var(--wine) 25%, transparent)",
                        }}
                      >
                        {exam.grade_level}
                      </span>
                      <div style={{ display: "flex", gap: "0.6rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <span>⏱ {exam.duration_minutes}m</span>
                        <span>•</span>
                        <span>📝 {exam.actual_question_count} Qs</span>
                      </div>
                    </div>

                    {/* Title & Instructions */}
                    <h3
                      style={{
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: "var(--text)",
                        margin: "0 0 0.5rem",
                        lineHeight: 1.35,
                      }}
                    >
                      {exam.title}
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 1.25rem", lineHeight: 1.5 }}>
                      {exam.instructions}
                    </p>
                  </div>

                  {/* Footer & Actions */}
                  <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        marginBottom: "0.85rem",
                      }}
                    >
                      <span>{exam.total_submissions} students tested</span>
                      {exam.high_score !== null && (
                        <span style={{ color: "var(--accent-green)", fontWeight: 700 }}>
                          High Score: {exam.high_score}/{exam.actual_question_count}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "0.5rem" }}>
                      <button
                        onClick={() => openLeaderboard(exam)}
                        style={{
                          padding: "0.6rem",
                          borderRadius: 10,
                          border: "1px solid var(--border)",
                          background: "var(--surface-2)",
                          color: "var(--text)",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        🏆 Rankings
                      </button>
                      <button
                        onClick={() => initiateExamStart(exam)}
                        style={{
                          padding: "0.6rem",
                          borderRadius: 10,
                          background: "var(--wine)",
                          color: "#fff",
                          border: "none",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <span>Start Test</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: ACTIVE CBT SESSION
         ========================================================================= */}
      {view === "exam" && activeExam && questions.length > 0 && (
        <div>
          {/* Exam Header */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "1rem 1.5rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--accent-green)",
                    boxShadow: "0 0 0 3px color-mix(in srgb, var(--accent-green) 25%, transparent)",
                  }}
                />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", margin: 0 }}>
                  {activeExam.title}
                </h2>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 3 }}>
                Candidate: <strong style={{ color: "var(--wine)" }}>{studentName}</strong> ({studentClass})
              </div>
            </div>

            {/* Countdown Clock & Submit */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontFamily: "monospace",
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  padding: "0.45rem 1rem",
                  borderRadius: 12,
                  background: secondsRemaining < 120 ? "color-mix(in srgb, #EF4444 15%, transparent)" : "var(--surface-2)",
                  color: secondsRemaining < 120 ? "#EF4444" : "var(--text)",
                  border: secondsRemaining < 120 ? "1px solid #EF4444" : "1px solid var(--border)",
                }}
              >
                <span>⏳</span>
                <span>{formatTimer(secondsRemaining)}</span>
              </div>

              <button
                onClick={() => setShowSubmitConfirm(true)}
                style={{
                  padding: "0.6rem 1.25rem",
                  background: "var(--accent-green)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Submit Exam
              </button>
            </div>
          </div>

          {/* Question Workspace Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 300px",
              gap: "1.5rem",
              alignItems: "start",
            }}
          >
            {/* Active Question Box */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "1.75rem",
                display: "flex",
                flexDirection: "column",
                minHeight: 460,
                justifyContent: "space-between",
              }}
            >
              <div>
                {/* Question Info Bar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid var(--border)",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.25rem 0.65rem",
                        borderRadius: "999px",
                        background: "var(--wine-light)",
                        color: "var(--wine)",
                        border: "1px solid color-mix(in srgb, var(--wine) 25%, transparent)",
                      }}
                    >
                      Question {currentQ.question_number} of {questions.length}
                    </span>
                    {answers[currentQ.question_number] && (
                      <span style={{ fontSize: "0.75rem", color: "var(--accent-green)", fontWeight: 600 }}>
                        ✓ Answered
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleFlag(currentQ.question_number)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.35rem 0.75rem",
                      borderRadius: 8,
                      border: flaggedQuestions.has(currentQ.question_number)
                        ? "1px solid #D97706"
                        : "1px solid var(--border)",
                      background: flaggedQuestions.has(currentQ.question_number)
                        ? "color-mix(in srgb, #D97706 15%, transparent)"
                        : "var(--surface-2)",
                      color: flaggedQuestions.has(currentQ.question_number) ? "#D97706" : "var(--text-muted)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <span>🚩</span>
                    <span>{flaggedQuestions.has(currentQ.question_number) ? "Flagged" : "Flag for Review"}</span>
                  </button>
                </div>

                {/* Question Text */}
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: "var(--text)",
                    lineHeight: 1.6,
                    margin: "0 0 1.5rem",
                  }}
                >
                  {currentQ.question_text}
                </h3>

                {/* Multiple Choice Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {(["A", "B", "C", "D"] as const).map((optKey) => {
                    const optText =
                      optKey === "A"
                        ? currentQ.option_a
                        : optKey === "B"
                        ? currentQ.option_b
                        : optKey === "C"
                        ? currentQ.option_c
                        : currentQ.option_d;
                    const isSelected = answers[currentQ.question_number] === optKey;

                    return (
                      <button
                        key={optKey}
                        onClick={() => handleSelectOption(optKey)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.85rem",
                          padding: "0.95rem 1.15rem",
                          borderRadius: 12,
                          border: isSelected ? "2px solid var(--wine)" : "1px solid var(--border)",
                          background: isSelected ? "var(--wine-light)" : "var(--surface)",
                          color: isSelected ? "var(--wine)" : "var(--text)",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        <span
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "0.85rem",
                            background: isSelected ? "var(--wine)" : "var(--surface-2)",
                            color: isSelected ? "#fff" : "var(--text-muted)",
                            flexShrink: 0,
                          }}
                        >
                          {optKey}
                        </span>
                        <span style={{ fontSize: "0.95rem", fontWeight: isSelected ? 600 : 400 }}>
                          {optText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prev / Next Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid var(--border)",
                  marginTop: "1.5rem",
                }}
              >
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  style={{
                    padding: "0.6rem 1.25rem",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
                    opacity: currentQuestionIndex === 0 ? 0.4 : 1,
                  }}
                >
                  ← Previous
                </button>

                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {currentQuestionIndex + 1} / {questions.length}
                </span>

                <button
                  disabled={currentQuestionIndex === questions.length - 1}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  style={{
                    padding: "0.6rem 1.25rem",
                    borderRadius: 10,
                    background: "var(--wine)",
                    color: "#fff",
                    border: "none",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: currentQuestionIndex === questions.length - 1 ? "not-allowed" : "pointer",
                    opacity: currentQuestionIndex === questions.length - 1 ? 0.4 : 1,
                  }}
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Question Palette Sidebar */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "1.25rem",
              }}
            >
              <h4
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                  margin: "0 0 1rem",
                }}
              >
                Question Palette
              </h4>

              {/* Grid of question buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.45rem", marginBottom: "1.5rem" }}>
                {questions.map((q, idx) => {
                  const isAnswered = !!answers[q.question_number];
                  const isFlagged = flaggedQuestions.has(q.question_number);
                  const isCurrent = idx === currentQuestionIndex;

                  let bg = "var(--surface-2)";
                  let color = "var(--text-muted)";
                  let border = "1px solid var(--border)";

                  if (isCurrent) {
                    border = "2px solid var(--wine)";
                  }
                  if (isFlagged) {
                    bg = "color-mix(in srgb, #D97706 18%, transparent)";
                    color = "#D97706";
                    border = "1px solid #D97706";
                  } else if (isAnswered) {
                    bg = "color-mix(in srgb, var(--accent-green) 18%, transparent)";
                    color = "var(--accent-green)";
                    border = "1px solid var(--accent-green)";
                  }

                  return (
                    <button
                      key={q.question_number}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      style={{
                        height: 38,
                        borderRadius: 8,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        border,
                        background: bg,
                        color,
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      {q.question_number}
                      {isFlagged && (
                        <span
                          style={{
                            position: "absolute",
                            top: 3,
                            right: 3,
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "#D97706",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Answered</span>
                  <strong style={{ color: "var(--accent-green)" }}>{answeredCount}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Unanswered</span>
                  <strong style={{ color: "var(--text-muted)" }}>{questions.length - answeredCount}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Flagged</span>
                  <strong style={{ color: "#D97706" }}>{flaggedQuestions.size}</strong>
                </div>
              </div>

              <button
                onClick={() => setShowSubmitConfirm(true)}
                style={{
                  width: "100%",
                  marginTop: "1.25rem",
                  padding: "0.75rem",
                  borderRadius: 10,
                  background: "var(--wine)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Finish & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: RESULT & SCORECARD
         ========================================================================= */}
      {view === "result" && result && (
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <button
              onClick={() => {
                setView("lobby");
                fetchExams();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 1rem",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ← Back to Exams Lobby
            </button>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
              Submission #{result.submission_id || "Recorded"}
            </span>
          </div>

          {/* Performance Hero Card */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "2.5rem 2rem",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--accent-green)",
                background: "color-mix(in srgb, var(--accent-green) 12%, transparent)",
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                marginBottom: "1rem",
              }}
            >
              ✓ Official Certified Result
            </span>

            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text)", margin: "0 0 0.5rem" }}>
              {result.student_name}
            </h2>
            <div style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "2rem" }}>
              Class: <strong style={{ color: "var(--wine)" }}>{result.student_class}</strong> • Time Taken:{" "}
              <strong>{formatSecondsToMinutes(result.time_spent_seconds)}</strong>
            </div>

            {/* Score & Standing Boxes */}
            <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
              <div
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "1.25rem 2rem",
                  minWidth: 170,
                }}
              >
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Total Score
                </div>
                <div style={{ fontSize: "2.4rem", fontWeight: 900, color: "var(--wine)", margin: "0.25rem 0" }}>
                  {result.score} / {result.total_questions}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  {result.percentage}% Accuracy
                </div>
              </div>

              <div
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "1.25rem 2rem",
                  minWidth: 170,
                }}
              >
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Grade Standing
                </div>
                <div
                  style={{
                    fontSize: "2.4rem",
                    fontWeight: 900,
                    margin: "0.25rem 0",
                    color:
                      result.grade === "Distinction"
                        ? "var(--accent-green)"
                        : result.grade === "Credit"
                        ? "var(--accent-blue)"
                        : "var(--wine)",
                  }}
                >
                  {result.grade}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Official Ranking Recorded
                </div>
              </div>
            </div>

            {activeExam && (
              <button
                onClick={() => openLeaderboard(activeExam)}
                style={{
                  padding: "0.65rem 1.5rem",
                  borderRadius: 10,
                  background: "var(--wine)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                🏆 View Contest Leaderboard
              </button>
            )}
          </div>

          {/* Solutions & Review */}
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", margin: 0 }}>
                  Question Solutions & Review
                </h3>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Verify answers and step-by-step mathematical explanations
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.4rem" }}>
                {(["all", "correct", "incorrect"] as const).map((filter) => {
                  const active = reviewFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setReviewFilter(filter)}
                      style={{
                        padding: "0.35rem 0.85rem",
                        borderRadius: 8,
                        fontSize: "0.75rem",
                        fontWeight: active ? 700 : 500,
                        cursor: "pointer",
                        border: active ? "1px solid var(--wine)" : "1px solid var(--border)",
                        background: active ? "var(--wine-light)" : "var(--surface)",
                        color: active ? "var(--wine)" : "var(--text-muted)",
                        textTransform: "capitalize",
                      }}
                    >
                      {filter === "all" ? "All Questions" : filter}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {result.review
                .filter((r) => {
                  if (reviewFilter === "correct") return r.is_correct;
                  if (reviewFilter === "incorrect") return !r.is_correct;
                  return true;
                })
                .map((q) => (
                  <div
                    key={q.question_number}
                    style={{
                      background: "var(--surface)",
                      border: q.is_correct
                        ? "1px solid color-mix(in srgb, var(--accent-green) 40%, transparent)"
                        : "1px solid color-mix(in srgb, #EF4444 40%, transparent)",
                      borderRadius: 14,
                      padding: "1.25rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>
                        Question {q.question_number}
                      </span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "999px",
                          background: q.is_correct
                            ? "color-mix(in srgb, var(--accent-green) 15%, transparent)"
                            : "color-mix(in srgb, #EF4444 15%, transparent)",
                          color: q.is_correct ? "var(--accent-green)" : "#EF4444",
                        }}
                      >
                        {q.is_correct ? "✓ Correct" : "✕ Incorrect"}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", margin: "0 0 1rem" }}>
                      {q.question_text}
                    </h4>

                    {/* Options list */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
                      {(["A", "B", "C", "D"] as const).map((opt) => {
                        const isStudentChoice = q.student_choice === opt;
                        const isCorrectOption = q.correct_option === opt;

                        let border = "1px solid var(--border)";
                        let bg = "var(--surface-2)";
                        let color = "var(--text-muted)";

                        if (isCorrectOption) {
                          border = "1px solid var(--accent-green)";
                          bg = "color-mix(in srgb, var(--accent-green) 12%, transparent)";
                          color = "var(--accent-green)";
                        } else if (isStudentChoice && !q.is_correct) {
                          border = "1px solid #EF4444";
                          bg = "color-mix(in srgb, #EF4444 12%, transparent)";
                          color = "#EF4444";
                        }

                        return (
                          <div
                            key={opt}
                            style={{
                              padding: "0.6rem 0.85rem",
                              borderRadius: 8,
                              border,
                              background: bg,
                              color,
                              fontSize: "0.8rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>
                              <strong>{opt}.</strong> {q.options[opt]}
                            </span>
                            {isCorrectOption && <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>✓ Key</span>}
                            {isStudentChoice && !isCorrectOption && (
                              <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>Your Pick</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Step-by-step Derivation */}
                    <div
                      style={{
                        padding: "0.85rem 1rem",
                        borderRadius: 10,
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        fontSize: "0.8rem",
                        color: "var(--text)",
                        lineHeight: 1.5,
                      }}
                    >
                      <strong style={{ color: "var(--wine)", display: "block", marginBottom: 3 }}>
                        Step-by-Step Explanation:
                      </strong>
                      {q.explanation}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: STUDENT CREDENTIAL ENTRY BEFORE START
         ========================================================================= */}
      {showStartModal && activeExam && (
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
          }}
          onClick={() => setShowStartModal(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "2rem",
              maxWidth: 480,
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--wine)",
                  background: "var(--wine-light)",
                  padding: "0.2rem 0.65rem",
                  borderRadius: "999px",
                }}
              >
                Official Entry Protocol
              </span>
              <button
                onClick={() => setShowStartModal(false)}
                style={{
                  border: "none",
                  background: "var(--surface-2)",
                  color: "var(--text-muted)",
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text)", margin: "0 0 0.5rem" }}>
              {activeExam.title}
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
              Please enter your full name and class to begin the timed test session. Your final score will be ranked on the leaderboard.
            </p>

            <form onSubmit={handleStartExamConfirmed} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                  Candidate Full Name:
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Adebayo Ogunlesi"
                  style={{
                    width: "100%",
                    padding: "0.7rem 0.85rem",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    color: "var(--text)",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                  Class Tier:
                </label>
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.7rem 0.85rem",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    color: "var(--text)",
                    fontSize: "0.88rem",
                    outline: "none",
                  }}
                >
                  <option value="JSS1">JSS 1</option>
                  <option value="JSS2">JSS 2</option>
                  <option value="JSS3">JSS 3</option>
                </select>
              </div>

              {/* NDPA Child Privacy Toggle */}
              <div
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "0.75rem 0.85rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.6rem",
                }}
              >
                <input
                  type="checkbox"
                  id="anonymousCheckbox"
                  checked={anonymousLeaderboard}
                  onChange={(e) => setAnonymousLeaderboard(e.target.checked)}
                  style={{ marginTop: "0.2rem", cursor: "pointer", accentColor: "var(--wine)" }}
                />
                <label
                  htmlFor="anonymousCheckbox"
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text)",
                    cursor: "pointer",
                    lineHeight: 1.4,
                  }}
                >
                  <strong>Hide my real name on public class leaderboards</strong>
                  <span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.7rem", marginTop: 2 }}>
                    (NDPA Section 31 Child Privacy Safeguard — displays as &quot;Student ({studentClass})&quot;)
                  </span>
                </label>
              </div>

              {/* Exam specs summary */}
              <div
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "0.85rem",
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Questions:</span>
                  <strong style={{ color: "var(--text)" }}>{activeExam.actual_question_count}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Time Allowed:</span>
                  <strong style={{ color: "var(--text)" }}>{activeExam.duration_minutes} Minutes</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Type:</span>
                  <strong style={{ color: "var(--text)" }}>Strict Multiple Choice</strong>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowStartModal(false)}
                  style={{
                    padding: "0.65rem",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.65rem",
                    borderRadius: 10,
                    background: "var(--wine)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Start Timer & Begin →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SUBMIT CONFIRMATION
         ========================================================================= */}
      {showSubmitConfirm && activeExam && (
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
          }}
          onClick={() => setShowSubmitConfirm(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "2rem",
              maxWidth: 420,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>⚠️</div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", margin: "0 0 0.5rem" }}>
              Submit Examination?
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
              You have answered <strong style={{ color: "var(--accent-green)" }}>{answeredCount}</strong> of{" "}
              <strong style={{ color: "var(--text)" }}>{questions.length}</strong> questions.
              {questions.length - answeredCount > 0 && (
                <span style={{ display: "block", color: "#D97706", fontWeight: 700, marginTop: "0.5rem" }}>
                  Notice: You have {questions.length - answeredCount} unanswered questions remaining!
                </span>
              )}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <button
                disabled={submitting}
                onClick={() => setShowSubmitConfirm(false)}
                style={{
                  padding: "0.65rem",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Return to Exam
              </button>
              <button
                disabled={submitting}
                onClick={submitExamAnswers}
                style={{
                  padding: "0.65rem",
                  borderRadius: 10,
                  background: "var(--accent-green)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? "Scoring..." : "Yes, Submit Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: LEADERBOARD
         ========================================================================= */}
      {leaderboardExam && (
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
          }}
          onClick={() => setLeaderboardExam(null)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              maxWidth: 620,
              width: "100%",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 25px 70px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--wine)" }}>
                  Official Rankings (NDPA Pseudonymized)
                </span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", margin: "2px 0 0" }}>
                  {leaderboardExam.title}
                </h3>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                  onClick={() => {
                    setShowAdminClearModal(true);
                    setClearMessage(null);
                  }}
                  title="Admin: Clear submissions for this test"
                  style={{
                    padding: "0.35rem 0.65rem",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--text-muted)",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  🗑️ Reset Board
                </button>
                <button
                  onClick={() => setLeaderboardExam(null)}
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
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
              {loadingLeaderboard ? (
                <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-muted)" }}>
                  Loading rankings...
                </div>
              ) : leaderboardData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  No submissions recorded yet for this contest. Be the first to claim #1!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {leaderboardData.map((entry, idx) => {
                    const is1 = idx === 0;
                    const is2 = idx === 1;
                    const is3 = idx === 2;

                    return (
                      <div
                        key={entry.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.85rem 1rem",
                          borderRadius: 12,
                          background: is1
                            ? "color-mix(in srgb, #EAB308 12%, var(--surface))"
                            : is2
                            ? "color-mix(in srgb, #94A3B8 12%, var(--surface))"
                            : is3
                            ? "color-mix(in srgb, #D97706 12%, var(--surface))"
                            : "var(--surface-2)",
                          border: is1
                            ? "1px solid #EAB308"
                            : is2
                            ? "1px solid #94A3B8"
                            : is3
                            ? "1px solid #D97706"
                            : "1px solid var(--border)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: "0.75rem",
                              background: is1 ? "#EAB308" : is2 ? "#94A3B8" : is3 ? "#D97706" : "var(--border)",
                              color: is1 || is2 ? "#000" : "#fff",
                            }}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>
                              {entry.student_name}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                              Class: {entry.student_class}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text)" }}>
                            {entry.score} / {entry.total_questions} ({entry.percentage}%)
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            Time: {formatSecondsToMinutes(entry.time_spent_seconds)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADMIN CLEAR SUBMISSIONS (PASSCODED: NDPA RIGHT TO ERASURE)
         ========================================================================= */}
      {showAdminClearModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowAdminClearModal(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "2rem",
              maxWidth: 440,
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.3rem" }}>🔒</span>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text)", margin: 0 }}>
                    Admin Data Erasure
                  </h3>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    NDPA Section 34 Data Compliance
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAdminClearModal(false)}
                style={{
                  border: "none",
                  background: "var(--surface-2)",
                  color: "var(--text-muted)",
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 1.25rem", lineHeight: 1.5 }}>
              {leaderboardExam
                ? `You are about to clear all submissions and reset the leaderboard for: "${leaderboardExam.title}".`
                : "You are about to purge all student exam submission records across all exams (e.g. at the end of the school term)."}
            </p>

            {clearMessage && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: 10,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  background:
                    clearMessage.type === "success"
                      ? "color-mix(in srgb, var(--accent-green) 15%, transparent)"
                      : "color-mix(in srgb, #EF4444 15%, transparent)",
                  color: clearMessage.type === "success" ? "var(--accent-green)" : "#EF4444",
                  border:
                    clearMessage.type === "success"
                      ? "1px solid color-mix(in srgb, var(--accent-green) 30%, transparent)"
                      : "1px solid color-mix(in srgb, #EF4444 30%, transparent)",
                }}
              >
                {clearMessage.text}
              </div>
            )}

            <form onSubmit={handleAdminClearSubmissions} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                  Enter Master Admin Passcode:
                </label>
                <input
                  type="password"
                  required
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="Master passcode required..."
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "0.7rem 0.85rem",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    color: "var(--text)",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowAdminClearModal(false)}
                  style={{
                    padding: "0.65rem",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={clearingSubmissions}
                  style={{
                    padding: "0.65rem",
                    borderRadius: 10,
                    background: "#EF4444",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    opacity: clearingSubmissions ? 0.6 : 1,
                  }}
                >
                  {clearingSubmissions ? "Purging..." : "Confirm & Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
