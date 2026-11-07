"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Resource {
  id: number;
  title: string;
  filename: string;
  type: string;
  grade_level: string;
  category: string;
  department: string;
  subject: string;
  file_size: number;
  relative_path: string;
  download_count: number;
  date_added: string;
}

interface MetaStats {
  grades: string[];
  categories: string[];
  departments: string[];
  subjects: string[];
  stats: {
    total_count: number;
    total_size_bytes: number;
  };
}

interface NetworkInfo {
  primaryIp: string;
  vaultUrl: string;
  backendUrl: string;
  kiwixUrl: string;
  interfaces: { interface: string; address: string }[];
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [meta, setMeta] = useState<MetaStats | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedIp, setCopiedIp] = useState(false);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  // Preview Modal State
  const [previewFile, setPreviewFile] = useState<Resource | null>(null);

  // Delete Confirmation State
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadGrade, setUploadGrade] = useState("All Grades");
  const [uploadCategory, setUploadCategory] = useState("Past Exam Questions");
  const [uploadDepartment, setUploadDepartment] = useState("Sciences");
  const [uploadSubject, setUploadSubject] = useState("Mathematics");
  const [customSubject, setCustomSubject] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const getBackendBase = () => {
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.hostname}:3001`;
    }
    return "http://localhost:3001";
  };
  const BACKEND_BASE = getBackendBase();

  const getKiwixBase = () => {
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.hostname}:8080`;
    }
    return "http://localhost:8080";
  };

  useEffect(() => {
    fetchMeta();
    fetchNetworkInfo();
    fetchResources();
  }, []);

  const fetchMeta = () => {
    fetch(`${getBackendBase()}/api/resources/meta`)
      .then((res) => res.json())
      .then((data) => setMeta(data))
      .catch((err) => console.error("Error fetching meta:", err));
  };

  const fetchNetworkInfo = () => {
    fetch(`${getBackendBase()}/api/network-info`)
      .then((res) => res.json())
      .then((data) => setNetworkInfo(data))
      .catch((err) => console.error("Error fetching network info:", err));
  };

  const fetchResources = (
    grade = selectedGrade,
    cat = selectedCategory,
    dept = selectedDepartment,
    query = search
  ) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (grade !== "All") params.append("grade", grade);
    if (cat !== "All") params.append("category", cat);
    if (dept !== "All") params.append("department", dept);
    if (query.trim()) params.append("search", query.trim());

    fetch(`${BACKEND_BASE}/api/resources?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setResources(data.resources || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching resources:", err);
        setLoading(false);
      });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      if (!uploadTitle.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim();
        setUploadTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadStatus({ type: "error", text: "Please select a file to upload." });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle.trim());
    formData.append("grade_level", uploadGrade);
    formData.append("category", uploadCategory);
    formData.append("department", uploadDepartment);
    formData.append(
      "subject",
      uploadSubject === "Other" && customSubject.trim() ? customSubject.trim() : uploadSubject
    );

    try {
      const res = await fetch(`${BACKEND_BASE}/api/resources/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      setUploadStatus({
        type: "success",
        text: `Successfully added "${data.resource?.title || uploadFile.name}" to the Vault!`,
      });
      setUploadFile(null);
      setUploadTitle("");
      setCustomSubject("");

      fetchResources();
      fetchMeta();

      setTimeout(() => {
        setShowUploadModal(false);
        setUploadStatus(null);
      }, 1500);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error uploading file";
      setUploadStatus({ type: "error", text: errorMsg });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`${BACKEND_BASE}/api/resources/${resourceToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete resource");
      }

      setResources((prev) => prev.filter((r) => r.id !== resourceToDelete.id));
      fetchMeta();
      setResourceToDelete(null);
    } catch (err) {
      console.error("Error deleting resource:", err);
      alert("Failed to delete resource from vault.");
    } finally {
      setDeleting(false);
    }
  };

  const copyIpAddress = () => {
    const hostIp =
      networkInfo?.primaryIp ||
      (typeof window !== "undefined" ? window.location.hostname : "localhost");
    const fullUrl = `http://${hostIp}:3000`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2500);
  };

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    fetchResources(grade, selectedCategory, selectedDepartment, search);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    fetchResources(selectedGrade, cat, selectedDepartment, search);
  };

  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartment(dept);
    fetchResources(selectedGrade, selectedCategory, dept, search);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedGrade("All");
    setSelectedCategory("All");
    setSelectedDepartment("All");
    fetchResources("All", "All", "All", "");
  };

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileUrl = (item: Resource): string => {
    const rel = item.relative_path || item.filename;
    return `${BACKEND_BASE}/files/${encodeURI(rel)}`;
  };

  const getKiwixBookUrl = (filename: string): string => {
    const slug = filename.replace(/_\d{4}-\d{2}\.zim$/i, "").replace(/\.zim$/i, "");
    return `${getKiwixBase()}/${slug}/`;
  };

  const getCategoryIcon = (cat: string, type: string) => {
    if (type === "kiwix-archive") return "📚";
    if (cat === "Past Exam Questions") return "📝";
    if (cat === "STEM Practicals") return "🔬";
    if (cat === "Competition Bank") return "🏆";
    if (type === "video") return "🎥";
    return "📄";
  };

  const gradesList = ["All", "JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];
  const categoriesList = [
    "All",
    "Past Exam Questions",
    "Syllabus Notes",
    "STEM Practicals",
    "Competition Bank",
    "Kiwix Offline Archives",
  ];
  const departmentsList = ["All", "Sciences", "Commercial", "Arts"];

  const currentHostIp =
    networkInfo?.primaryIp ||
    (typeof window !== "undefined" ? window.location.hostname : "localhost");

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Top Header Section */}
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
              Academic Repository
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
            Library & <span style={{ color: "var(--wine)" }}>Archives</span>
          </h1>
          <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", margin: 0, maxWidth: 650, lineHeight: 1.6 }}>
            Instant zero-bandwidth access to WAEC past papers, STEM labs, curriculum notes, and offline encyclopedia archives.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Quick Metrics */}
          {meta && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "0.5rem 0.85rem",
                fontSize: "0.8rem",
              }}
            >
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.68rem" }}>Catalog</span>
                <span style={{ fontWeight: 700, color: "var(--text)" }}>{meta.stats.total_count} files</span>
              </div>
              <div style={{ width: 1, height: 20, background: "var(--border)" }} />
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.68rem" }}>Capacity</span>
                <span style={{ fontWeight: 700, color: "var(--text)" }}>{formatBytes(meta.stats.total_size_bytes)}</span>
              </div>
            </div>
          )}

          {/* Add Resource Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "var(--wine)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "0.65rem 1.25rem",
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px -2px color-mix(in srgb, var(--wine) 35%, transparent)",
            }}
          >
            <span>➕</span>
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      {/* Kiwix Offline Archives Banner */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "1.25rem 1.5rem",
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.3rem" }}>🌐</span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>
                  Kiwix Offline Server Archives
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    color: "var(--accent-green)",
                    background: "color-mix(in srgb, var(--accent-green) 12%, transparent)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "999px",
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent-green)" }} />
                  Live on :8080
                </span>
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Standalone interactive simulations and academic Q&A archives loaded directly from disk
              </span>
            </div>
          </div>
          <a
            href={getKiwixBase()}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "var(--wine)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              background: "var(--wine-light)",
              padding: "0.4rem 0.85rem",
              borderRadius: 8,
            }}
          >
            <span>Open Kiwix Portal</span>
            <span>→</span>
          </a>
        </div>

        {/* 3 Featured Kiwix Archives Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem" }}>
          {[
            {
              title: "PhET STEM Simulations",
              desc: "Interactive physics, chemistry & math labs",
              slug: "phet_en_all",
              icon: "🔬",
            },
            {
              title: "MathOverflow Q&A",
              desc: "Complete peer-reviewed mathematical problem solutions",
              slug: "mathoverflow.net_en_all",
              icon: "📐",
            },
            {
              title: "Aviation Sciences",
              desc: "Aerodynamics, flight physics and engineering bank",
              slug: "aviation.stackexchange.com_en_all",
              icon: "✈️",
            },
          ].map((arc) => (
            <a
              key={arc.slug}
              href={`${getKiwixBase()}/${arc.slug}/`}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "0.85rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--wine)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <span style={{ fontSize: "1.4rem" }}>{arc.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {arc.title}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
                  {arc.desc}
                </div>
              </div>
              <span style={{ color: "var(--wine)", fontSize: "0.9rem" }}>→</span>
            </a>
          ))}
        </div>
      </div>

      {/* Search Bar & Filters Section */}
      <div style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.75rem" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchResources(selectedGrade, selectedCategory, selectedDepartment, e.target.value);
              }}
              placeholder="Search by topic, subject (e.g. Physics, Chemistry, WAEC, BECE, Calculus)..."
              style={{
                width: "100%",
                padding: "0.75rem 2.5rem 0.75rem 2.75rem",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "var(--text)",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  fetchResources(selectedGrade, selectedCategory, selectedDepartment, "");
                }}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            style={{
              padding: "0.75rem 1.5rem",
              background: "var(--wine)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>

        {/* Grade Filter Row */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
            Grade:
          </span>
          {gradesList.map((grade) => {
            const active = selectedGrade === grade;
            return (
              <button
                key={grade}
                onClick={() => handleGradeChange(grade)}
                style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  border: active ? "1px solid var(--wine)" : "1px solid var(--border)",
                  background: active ? "var(--wine-light)" : "var(--surface)",
                  color: active ? "var(--wine)" : "var(--text-muted)",
                  transition: "all 0.15s",
                }}
              >
                {grade}
              </button>
            );
          })}
        </div>

        {/* Category & Department Row */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
            Category:
          </span>
          {categoriesList.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: 8,
                  fontSize: "0.75rem",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  border: active ? "1px solid var(--wine)" : "1px solid var(--border)",
                  background: active ? "var(--wine-light)" : "var(--surface)",
                  color: active ? "var(--wine)" : "var(--text-muted)",
                }}
              >
                {cat}
              </button>
            );
          })}

          <div style={{ width: 1, height: 16, background: "var(--border)", margin: "0 0.25rem" }} />

          <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
            Dept:
          </span>
          {departmentsList.map((dept) => {
            const active = selectedDepartment === dept;
            return (
              <button
                key={dept}
                onClick={() => handleDepartmentChange(dept)}
                style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: 8,
                  fontSize: "0.75rem",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  border: active ? "1px solid var(--accent-blue)" : "1px solid var(--border)",
                  background: active ? "color-mix(in srgb, var(--accent-blue) 12%, transparent)" : "var(--surface)",
                  color: active ? "var(--accent-blue)" : "var(--text-muted)",
                }}
              >
                {dept}
              </button>
            );
          })}

          {(selectedGrade !== "All" || selectedCategory !== "All" || selectedDepartment !== "All" || search) && (
            <button
              onClick={resetFilters}
              style={{
                marginLeft: "auto",
                border: "none",
                background: "transparent",
                color: "#EF4444",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Resources Cards Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
          <div style={{ fontSize: "0.9rem" }}>Loading vault library materials...</div>
        </div>
      ) : resources.length === 0 ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px dashed var(--border)",
            borderRadius: 20,
            padding: "3.5rem 2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔍</div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.5rem" }}>
            No Matching Resources Found
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", maxWidth: 420, margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
            No files matched your selected filters. You can upload new files or reset the active filter set.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
            <button
              onClick={() => setShowUploadModal(true)}
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: 10,
                background: "var(--wine)",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              ➕ Add Resource Now
            </button>
            <button
              onClick={resetFilters}
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: 10,
                background: "var(--surface-2)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {resources.map((item) => {
            const fileUrl = getFileUrl(item);
            const isPdf = item.type === "pdf" || item.filename.endsWith(".pdf");
            const isZim = item.type === "kiwix-archive" || item.filename.endsWith(".zim");

            return (
              <div
                key={item.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "1.25rem",
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
                  {/* Top row: Icon & Tag badges & Delete */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.3rem",
                      }}
                    >
                      {getCategoryIcon(item.category, item.type)}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.55rem",
                          borderRadius: "999px",
                          background: "var(--wine-light)",
                          color: "var(--wine)",
                          border: "1px solid color-mix(in srgb, var(--wine) 25%, transparent)",
                        }}
                      >
                        {item.category}
                      </span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.55rem",
                          borderRadius: "999px",
                          background: "color-mix(in srgb, var(--accent-blue) 10%, transparent)",
                          color: "var(--accent-blue)",
                          border: "1px solid color-mix(in srgb, var(--accent-blue) 25%, transparent)",
                        }}
                      >
                        {item.grade_level}
                      </span>
                      <button
                        onClick={() => setResourceToDelete(item)}
                        title="Delete resource"
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          padding: 4,
                          fontSize: "0.9rem",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Title & Subject */}
                  <div style={{ marginBottom: "1rem" }}>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--wine)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {item.subject} {item.department !== "General" ? `• ${item.department}` : ""}
                    </div>
                    <h3
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: "var(--text)",
                        margin: "0 0 0.35rem",
                        lineHeight: 1.35,
                      }}
                      title={item.title}
                    >
                      {item.title}
                    </h3>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                        fontFamily: "monospace",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={item.filename}
                    >
                      {item.filename}
                    </div>
                  </div>
                </div>

                {/* Footer metadata & actions */}
                <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                    <span>{formatBytes(item.file_size)}</span>
                    <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>Zero Data Cost</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    {isPdf ? (
                      <button
                        onClick={() => setPreviewFile(item)}
                        style={{
                          padding: "0.5rem",
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                          background: "var(--surface-2)",
                          color: "var(--text)",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        👁️ Preview
                      </button>
                    ) : isZim ? (
                      <a
                        href={getKiwixBookUrl(item.filename)}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: "0.5rem",
                          borderRadius: 8,
                          border: "1px solid var(--wine)",
                          background: "var(--wine-light)",
                          color: "var(--wine)",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          textDecoration: "none",
                          textAlign: "center",
                        }}
                      >
                        🔬 Launch ZIM
                      </a>
                    ) : (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: "0.5rem",
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                          background: "var(--surface-2)",
                          color: "var(--text)",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          textDecoration: "none",
                          textAlign: "center",
                        }}
                      >
                        📂 Open
                      </a>
                    )}

                    <a
                      href={`${BACKEND_BASE}/api/resources/${item.id}/download`}
                      download={item.filename}
                      style={{
                        padding: "0.5rem",
                        borderRadius: 8,
                        background: "var(--wine)",
                        color: "#fff",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        textDecoration: "none",
                        textAlign: "center",
                      }}
                    >
                      ⬇️ Download
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Resource Modal */}
      {showUploadModal && (
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
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUploadModal(false);
              setUploadStatus(null);
            }
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "2rem",
              maxWidth: 540,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text)", margin: "0 0 0.25rem" }}>
                  Add New Resource
                </h2>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                  Upload academic materials directly into the Caesium Vault
                </p>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadStatus(null);
                }}
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

            {uploadStatus && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: 10,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  background:
                    uploadStatus.type === "success"
                      ? "color-mix(in srgb, var(--accent-green) 15%, transparent)"
                      : "color-mix(in srgb, #EF4444 15%, transparent)",
                  color: uploadStatus.type === "success" ? "var(--accent-green)" : "#EF4444",
                  border:
                    uploadStatus.type === "success"
                      ? "1px solid color-mix(in srgb, var(--accent-green) 30%, transparent)"
                      : "1px solid color-mix(in srgb, #EF4444 30%, transparent)",
                }}
              >
                {uploadStatus.text}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* File Dropzone */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                  Select File *
                </label>
                <div
                  style={{
                    position: "relative",
                    border: "2px dashed var(--border)",
                    borderRadius: 12,
                    padding: "1.5rem 1rem",
                    textAlign: "center",
                    background: "var(--surface-2)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="file"
                    required
                    onChange={handleFileChange}
                    style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }}
                  />
                  <div style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>📄</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)" }}>
                    {uploadFile ? uploadFile.name : "Click or drag & drop file here"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>
                    Supports PDF, ZIM, DOCX, MP4, EPUB (Up to 2GB)
                  </div>
                  {uploadFile && (
                    <div style={{ fontSize: "0.75rem", color: "var(--accent-green)", fontWeight: 600, marginTop: 6 }}>
                      Size: {formatBytes(uploadFile.size)}
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. WAEC 2024 Further Mathematics Past Questions"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    color: "var(--text)",
                    fontSize: "0.88rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Grade & Category */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Grade Level
                  </label>
                  <select
                    value={uploadGrade}
                    onChange={(e) => setUploadGrade(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      color: "var(--text)",
                      fontSize: "0.85rem",
                      outline: "none",
                    }}
                  >
                    <option value="All Grades">All Grades</option>
                    <option value="JSS1">JSS1</option>
                    <option value="JSS2">JSS2</option>
                    <option value="JSS3">JSS3</option>
                    <option value="SS1">SS1</option>
                    <option value="SS2">SS2</option>
                    <option value="SS3">SS3</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      color: "var(--text)",
                      fontSize: "0.85rem",
                      outline: "none",
                    }}
                  >
                    <option value="Past Exam Questions">Past Exam Questions</option>
                    <option value="Syllabus Notes">Syllabus Notes</option>
                    <option value="STEM Practicals">STEM Practicals</option>
                    <option value="Competition Bank">Competition Bank</option>
                    <option value="Kiwix Offline Archives">Kiwix Offline Archives</option>
                    <option value="General Resource">General Resource</option>
                  </select>
                </div>
              </div>

              {/* Department & Subject */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Department
                  </label>
                  <select
                    value={uploadDepartment}
                    onChange={(e) => setUploadDepartment(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      color: "var(--text)",
                      fontSize: "0.85rem",
                      outline: "none",
                    }}
                  >
                    <option value="Sciences">Sciences</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Arts">Arts</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Subject
                  </label>
                  <select
                    value={uploadSubject}
                    onChange={(e) => setUploadSubject(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      color: "var(--text)",
                      fontSize: "0.85rem",
                      outline: "none",
                    }}
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English Language">English Language</option>
                    <option value="Computer Studies">Computer Studies</option>
                    <option value="Technical Drawing">Technical Drawing</option>
                    <option value="Economics">Economics</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Government & Civic">Government & Civic</option>
                    <option value="Interactive STEM Labs">Interactive STEM Labs</option>
                    <option value="Other">Custom / Other</option>
                  </select>
                </div>
              </div>

              {uploadSubject === "Other" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                    Custom Subject Name
                  </label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter custom subject..."
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      color: "var(--text)",
                      fontSize: "0.85rem",
                      outline: "none",
                    }}
                  />
                </div>
              )}

              {/* Form buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{
                    padding: "0.6rem 1.25rem",
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
                  disabled={uploading}
                  style={{
                    padding: "0.6rem 1.5rem",
                    borderRadius: 10,
                    background: "var(--wine)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    opacity: uploading ? 0.6 : 1,
                  }}
                >
                  {uploading ? "Uploading..." : "Add to Vault"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {resourceToDelete && (
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
          onClick={() => setResourceToDelete(null)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "1.75rem",
              maxWidth: 420,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🗑️</div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.5rem" }}>
              Delete Resource?
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
              Are you sure you want to remove <strong style={{ color: "var(--text)" }}>"{resourceToDelete.title}"</strong> ({resourceToDelete.filename}) from the Vault?
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <button
                onClick={() => setResourceToDelete(null)}
                disabled={deleting}
                style={{
                  padding: "0.6rem",
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
                onClick={handleDeleteConfirm}
                disabled={deleting}
                style={{
                  padding: "0.6rem",
                  borderRadius: 10,
                  background: "#EF4444",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF In-Browser Preview Modal */}
      {previewFile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setPreviewFile(null)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 1000,
              height: "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 25px 70px rgba(0,0,0,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 1.5rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", margin: "0 0 2px" }}>
                  {previewFile.title}
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {previewFile.subject} • {previewFile.grade_level} • Local High-Speed Delivery
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <a
                  href={`${BACKEND_BASE}/api/resources/${previewFile.id}/download`}
                  download={previewFile.filename}
                  style={{
                    padding: "0.45rem 1rem",
                    borderRadius: 8,
                    background: "var(--wine)",
                    color: "#fff",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  ⬇️ Save File
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "none",
                    background: "var(--surface-2)",
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Frame */}
            <div style={{ flex: 1, background: "var(--bg)" }}>
              <iframe
                src={getFileUrl(previewFile)}
                style={{ width: "100%", height: "100%", border: "none" }}
                title={previewFile.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
