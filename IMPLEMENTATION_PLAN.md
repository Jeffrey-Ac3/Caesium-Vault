# Caesium Vault & Tunwase Library Portal
## Master Redesigned Implementation Plan & System Architecture

**Document Version:** 2.0.0  
**Authority:** Office of the Head Boy (Jeffrey Feyisetan) & Caesium Alliance (Computer Club & STEM Society)  
**Institution:** Tunwase High School  
**Date:** Academic Year 2026  

---

### Executive Summary & Institutional Mandate

The **Caesium Vault** and the **Tunwase Library Portal (TLP)** constitute a unified, zero-bandwidth, offline digital infrastructure initiative engineered under the mandate of the **Caesium Alliance**—the strategic coalition between the **Computer Club** and the **STEM Society**, spearheaded by **Jeffrey Feyisetan (Head Boy)**.

Deriving its identity from element Caesium ($Cs_{55}$)—whose isotope Caesium-133 defines the global atomic clock standard of precision—this initiative directly dismantles the academic divide caused by high mobile data costs and unreliable commercial network access. By establishing an air-gapped or localized intranet edge server on existing school hardware (Zorin OS), the system delivers 100% data-free access to syllabus notes, past examination archives (WAEC/NECO/BECE), STEM practical guides, CBT assessments, inter-class math competitions, offline knowledge repositories (Wikipedia/Khan Academy via Kiwix), and local AI reasoning models (Qwen 2.5 via Ollama).

```
                      +------------------------------------------+
                      |         TUNWASE HIGH SCHOOL LAN          |
                      |  Wi-Fi Access Points & Lab Workstations  |
                      +--------------------+---------------------+
                                           |
                                  [Port 80 / HTTP]
                                           v
                      +------------------------------------------+
                      |     NGINX GATEWAY REVERSE PROXY          |
                      |          (caesium-proxy)                 |
                      +--+-------------+-------------+---------+-+
                         |             |             |         |
           +-------------+             |             |         +-------------+
           | / (Root Portal)           | /api/core/  | /kiwix/               | /ai/ & /api/tags
           v                           v             v                       v
+--------------------+      +--------------------+  +---------------+  +---------------+
|   CAESIUM PORTAL   |      |    CAESIUM CORE    |  | KIWIX ARCHIVE |  | OLLAMA & QWEN |
|  Next.js Frontend  |<---->|  Express / Sockets |  |  Kiwix Server |  |  Local LLM /  |
| (Vault, TLP, Arena)|      | SQLite / Chokidar  |  |  (.zim data)  |  |  Open-WebUI   |
+--------------------+      +--------------------+  +---------------+  +---------------+
```

---

### 1. Document Synthesis & Architectural Gap Analysis

A forensic review of all project specifications revealed critical requirements that were previously disjointed across separate documents:

| Source Document | Core Focus & Mandated Requirements | Gap in Initial Repository Implementation |
| :--- | :--- | :--- |
| **`Caesium Alliance Project Proposal V2.pdf`** | 1. **Tunwase Library Portal (TLP)**: Laptop-based attendance check-in/out and book return timers.<br>2. **Data-Free Academic Archive**: Past papers, study guides, shared club files. | TLP features (student attendance, circulation tracking, overdue timers) were completely absent from the codebase. |
| **`caesium_vault_architecture.pdf`** | 1. **4-Tier Academic Schema**: JSS1–SS3 across Sciences, Commercial, Arts.<br>2. **Categories**: Past Exams (WAEC/NECO/BECE), Notes, STEM Practicals, Competition Bank.<br>3. **Launchpad**: JSS1 vs JSS2 Mathematics Competition. | Flat file list in SQLite without grade-level or department organization; no CBT engine; no Math Arena socket logic. |
| **`Caesium Vault Software Setup Guide.pdf`** | 1. **Deployment Platform**: Zorin OS host (`192.168.1.150/24`).<br>2. **Container Stack**: Kiwix-serve (`*.zim`), Ollama (Qwen 2.5 0.5B/1.5B/7B), Open-WebUI, Nginx proxy. | Docker Compose and Nginx mapped `/` directly to Open-WebUI, leaving no unified URL routing for the Next.js app or Express backend. |
| **Current Workspace Codebase** | Next.js 15 app router, Node/Express server on port 3001, SQLite `caecium.db`, Chokidar scanner. | Disconnected from Docker stack; UI links to `/cbt` and `/arena` lead to 404 errors; Kiwix and Ollama not integrated into frontend. |

#### Architectural Resolution
This redesign harmonizes the **Dual-Pillar Framework** (Caesium Vault + Tunwase Library Portal) into a single, cohesive containerized architecture where Nginx routes to the **Caesium Unified Portal** at the root, with seamless background integration to Kiwix, Ollama, Open-WebUI, and the SQLite core database.

---

### 2. Target Unified System Architecture

#### 2.1 Microservices & Service Mesh (Docker Compose)
All services are orchestrated via `/opt/caesium/docker-compose.yml` bound to the internal `caesium-net` bridge network:

1. **`caesium-proxy` (Nginx Gateway - Port 80)**:
   - Unified single-port entry point for the entire school network (`http://192.168.1.150`).
   - Reverse proxies frontend, backend API, WebSocket streams, Kiwix knowledge base, and Ollama/Open-WebUI.
2. **`caesium-portal` (Unified Next.js Frontend - Internal Port 3000)**:
   - Modern, responsive client optimized for low-spec lab monitors and mobile phones connected to school Wi-Fi.
   - Houses the Academic Vault Explorer, Tunwase Library Portal, CBT Simulator, Math Arena, and AI Tutor interface.
3. **`caesium-core` (Express.js API & Real-time Server - Internal Port 3001)**:
   - Manages SQLite database transactions with WAL (Write-Ahead Logging) enabled.
   - Handles Library Attendance & Loan Timers, Exam generation & grading, Socket.io Arena matchmaking, and Chokidar file synchronization.
4. **`caesium-kiwix` (Kiwix Server - Internal Port 8080)**:
   - Reads `.zim` files mounted from `/opt/caesium/kiwix/zim`.
   - Serves offline Wikipedia, Khan Academy, Project Gutenberg, and PhET simulations.
5. **`caesium-ollama` (Ollama Inference Engine - Internal Port 11434)**:
   - Executes quantized Qwen 2.5 models (`0.5b` for fast student query hints; `1.5b` for step-by-step math and science solutions).
6. **`caesium-webui` (Open-WebUI - Internal Port 8080 / Proxy Path `/ai/`)**:
   - Advanced LLM interface with student chat history, teacher prompt engineering, and offline knowledge synthesis.

#### 2.2 Unified Nginx Gateway Routing Specification
```nginx
# /opt/caesium/nginx/nginx.conf
events { worker_connections 1024; }

http {
    include mime.types;
    default_type application/octet-stream;
    sendfile on;
    client_max_body_size 500M; # Support large PDF/ZIM uploads

    upstream frontend_upstream { server caesium-portal:3000; }
    upstream backend_upstream  { server caesium-core:3001; }
    upstream kiwix_upstream    { server caesium-kiwix:8080; }
    upstream ollama_upstream   { server caesium-ollama:11434; }
    upstream webui_upstream    { server caesium-webui:8080; }

    server {
        listen 80;
        server_name localhost 192.168.1.150 caesium.vault;

        # 1. Main Unified Portal & UI Pages (Next.js)
        location / {
            proxy_pass http://frontend_upstream;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # 2. Caesium Core REST API
        location /api/core/ {
            proxy_pass http://backend_upstream/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # 3. Real-time Math Arena WebSockets
        location /socket.io/ {
            proxy_pass http://backend_upstream/socket.io/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # 4. Kiwix Offline Knowledge Base
        location /kiwix/ {
            proxy_pass http://kiwix_upstream/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # 5. Local AI Tutor Interface (Open-WebUI)
        location /ai/ {
            proxy_pass http://webui_upstream/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # 6. Raw Ollama Engine API
        location /api/ollama/ {
            proxy_pass http://ollama_upstream/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

---

### 3. Functional Module Specifications

#### 3.1 Pillar 1: Caesium Vault Academic Engine

##### A. Structured Academic Repository
The repository directory structure mirrors the high school academic curriculum directly:
```
/opt/caesium/storage/academic/
├── JSS1/
├── JSS2/
├── JSS3/
├── SS1/
│   ├── Sciences/        (Physics, Chemistry, Biology, Further Maths, Tech Drawing)
│   ├── Commercial/      (Accounting, Commerce, Economics)
│   └── Arts/            (Literature, Government, CRS/IRS, History)
├── SS2/
└── SS3/
    ├── Past_Questions/  (WAEC, NECO, JAMB/UTME, BECE, School Mocks)
    ├── Syllabus_Notes/  (Curriculum Schemes of Work)
    ├── STEM_Practicals/ (Lab guides, Sensors, Fiber Optics, Circuits)
    └── Competition_Bank/(JSS1 vs JSS2 Maths Arena past papers)
```
- **Automated Ingestion**: `scanner.js` parses the folder hierarchy dynamically upon file drop, auto-categorizing files into `grade_level`, `department`, `category`, and `subject`.

##### B. CBT Examination Simulator
- Emulates the national **WAEC / NECO / BECE** Computer-Based Testing interface.
- Standard timer, question navigation grid, flag-for-review capability, auto-submission on timeout.
- Instant offline auto-grading with detailed rationale and question-by-question review.
- SQLite question bank with tag-based test generation (e.g., "SS3 WAEC Physics 2023 Mock").

##### C. Real-Time Math Arena (Head-to-Head & Inter-Class)
- Built on `Socket.io` with low-latency in-memory room state.
- **Launchpad Mode**: **JSS1 vs. JSS2 Inter-Class Math Clash**.
- Fast-paced timed rounds: Mental arithmetic, algebraic simplification, geometry problems.
- Features: Live spectator scoreboard, buzzer mode, point multipliers for consecutive correct answers, class victory tally.

##### D. Offline AI Study Tutor (Qwen 2.5 via Ollama)
- Directly integrated into the Vault UI as a floating study assistant.
- Students can highlight a question in a past paper and ask for:
  - Step-by-step working.
  - Formula derivations.
  - Conceptual summaries.
- Operates 100% offline with zero cloud telemetry.

---

#### 3.2 Pillar 2: Tunwase Library Portal (TLP)

##### A. Automated Attendance Station
- Deployed on a dedicated library desk terminal.
- Supports **Rapid Barcode / Student ID Check-In & Check-Out**.
- Tracks: Timestamp, Student Name, Admission Number, Class (e.g., SS2 Science A), Purpose of Visit (Study, Book Borrowing, Lab Research).
- Real-time occupancy gauge displaying current students present in the library.

##### B. Book Circulation & Overdue Return Timers
- **Asset Master**: ISBN / Accession Number, Title, Author, Shelf Classification, Available Copies.
- **Checkout Engine**: Assigns loan duration (default: 7 days or custom).
- **Automated Overdue Timers**: Real-time status indicators (Active, Due Soon, Overdue with daily fine/penalty flags).
- **Alert Desk**: One-click summary of all overdue borrowers for librarian follow-up and prefect notifications.

##### C. Librarian Analytics Dashboard
- Daily and weekly visitor frequency graphs.
- Most borrowed academic textbooks and reading materials.
- Class-by-class library engagement metrics.

---

### 4. Database Schema Specification (SQLite / WAL)

The database `caecium.db` will be updated with full relational tables supporting both pillars:

```sql
-- PRAGMA journal_mode=WAL;

-- ==========================================================
-- 1. AUTHENTICATION & USERS
-- ==========================================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,      -- e.g., THS/2024/0481
    full_name TEXT NOT NULL,
    role TEXT CHECK(role IN ('student', 'teacher', 'librarian', 'prefect', 'admin')) DEFAULT 'student',
    grade_level TEXT NOT NULL,            -- 'JSS1' through 'SS3'
    department TEXT,                      -- 'Sciences', 'Commercial', 'Arts' or NULL
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 2. TUNWASE LIBRARY PORTAL (TLP)
-- ==========================================================
CREATE TABLE IF NOT EXISTS library_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    check_in DATETIME DEFAULT CURRENT_TIMESTAMP,
    check_out DATETIME,
    purpose TEXT DEFAULT 'Private Study',
    FOREIGN KEY(student_id) REFERENCES users(student_id)
);

CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isbn TEXT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade_level TEXT,                     -- 'JSS1-JSS3', 'SS1-SS3', 'General'
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    shelf_location TEXT
);

CREATE TABLE IF NOT EXISTS book_loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    student_id TEXT NOT NULL,
    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME NOT NULL,
    returned_date DATETIME,
    status TEXT CHECK(status IN ('active', 'returned', 'overdue')) DEFAULT 'active',
    FOREIGN KEY(book_id) REFERENCES books(id),
    FOREIGN KEY(student_id) REFERENCES users(student_id)
);

-- ==========================================================
-- 3. CAESIUM VAULT ACADEMIC REPOSITORY
-- ==========================================================
CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    filename TEXT UNIQUE NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes INTEGER,
    file_type TEXT NOT NULL,              -- 'pdf', 'zim', 'video', 'document'
    grade_level TEXT NOT NULL,            -- 'JSS1' .. 'SS3', 'All'
    department TEXT,                      -- 'Sciences', 'Commercial', 'Arts', 'General'
    subject TEXT NOT NULL,                -- 'Mathematics', 'Physics', etc.
    category TEXT NOT NULL,               -- 'Past_Questions', 'Syllabus_Notes', 'STEM_Practicals', 'Competition_Bank'
    exam_body TEXT,                       -- 'WAEC', 'NECO', 'BECE', 'Internal_Mock'
    date_added DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 4. CBT EXAM ENGINE
-- ==========================================================
CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    exam_type TEXT DEFAULT 'WAEC_MOCK',
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    total_marks INTEGER DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exam_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT CHECK(correct_option IN ('A', 'B', 'C', 'D')) NOT NULL,
    explanation TEXT,
    FOREIGN KEY(exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    student_id TEXT NOT NULL,
    score REAL NOT NULL,
    answers_json TEXT,                    -- JSON payload of student choices
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(exam_id) REFERENCES exams(id),
    FOREIGN KEY(student_id) REFERENCES users(student_id)
);

-- ==========================================================
-- 5. REAL-TIME MATH ARENA
-- ==========================================================
CREATE TABLE IF NOT EXISTS arena_matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_code TEXT UNIQUE NOT NULL,
    mode TEXT DEFAULT 'inter-class',      -- 'jss1_vs_jss2', 'open_arena'
    class_team_a TEXT NOT NULL,           -- e.g. 'JSS1'
    class_team_b TEXT NOT NULL,           -- e.g. 'JSS2'
    score_a INTEGER DEFAULT 0,
    score_b INTEGER DEFAULT 0,
    winner TEXT,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 5. Phased Implementation Roadmap

#### Phase 0: Infrastructure Harmonization & Container Blueprint
1. Construct `/opt/caesium/docker-compose.yml` integrating `caesium-proxy`, `caesium-portal`, `caesium-core`, `caesium-kiwix`, `caesium-ollama`, and `caesium-webui`.
2. Configure `nginx.conf` with unified path routing and WebSocket support (`proxy_http_version 1.1; Upgrade $http_upgrade;`).
3. Setup persistent shared volumes:
   - `/opt/caesium/storage/academic` for categorized syllabi, past papers, and practical notes.
   - `/opt/caesium/kiwix/zim` for ZIM knowledge archives.
   - `/opt/caesium/ollama` for weights of Qwen 2.5 (`0.5b` and `1.5b`).

#### Phase 1: Core Backend & Relational Database Modernization
1. Update `backend/database.js` to execute the full schema (Users, TLP Attendance, Books, Loans, Categorized Resources, CBT Exams, Math Arena).
2. Upgrade `backend/scanner.js` to watch hierarchical folders (`JSS1`..`SS3`, `Past_Questions`, `Sciences`, etc.) and automatically catalog records with structured metadata.
3. Build REST endpoints:
   - `/api/resources` (filtering by `grade_level`, `department`, `category`, `subject`).
   - `/api/tlp/attendance` (rapid check-in/out by student ID).
   - `/api/tlp/loans` (book checkout, return, overdue list with computed timers).
   - `/api/exams` and `/api/exams/:id/submit` (CBT question delivery and scoring).
4. Implement `backend/arena.js` for Socket.io game state management (rooms, question broadcasting, synchronized buzzer locks, live score calculations).

#### Phase 2: Caesium Vault Academic Experience (Frontend)
1. **Curriculum Explorer (`/resources` & `/vault`)**:
   - Navigation tree: Grade Level (JSS1–SS3) $\rightarrow$ Subject $\rightarrow$ Resource Category.
   - Direct PDF viewing inside an embedded offline viewer with zero mobile data consumption.
   - Direct download button with zero bandwidth overhead.
2. **CBT Exam Center (`/cbt`)**:
   - Realistic exam session screen with countdown clock, navigation palette, question flags, and instant submit dialog.
   - Result report card detailing score percentage, grade, and question answer keys.
3. **Math Arena (`/arena`)**:
   - Inter-class arena mode showcasing **JSS1 vs JSS2** rivalry.
   - Live socket sync displaying questions simultaneously to all participants.
   - Dynamic sound/visual feedback for correct answers and streak streaks.

#### Phase 3: Tunwase Library Portal (TLP) Implementation
1. **Attendance Terminal (`/tlp/attendance`)**:
   - High-contrast, minimal UI designed for rapid student check-in.
   - Numeric keypad & barcode-ready input for student ID.
   - Live counter of active library users and time elapsed.
2. **Circulation & Overdue Desk (`/tlp/circulation`)**:
   - Book catalog search with availability chips.
   - Overdue tracking table with dynamic time-remaining countdown badges (Green: Safe, Yellow: Due Today, Red: Overdue by $X$ days).

#### Phase 4: Local AI (Qwen 2.5) & Kiwix Offline Integration
1. Build an in-portal floating **AI Study Companion** widget communicating directly with `/api/ollama/generate`.
2. Configure prompt templates tuned for Nigerian Secondary School curriculum (WAEC/NECO syllabus alignment).
3. Connect the Library page to Kiwix `/kiwix/` so students can seamlessly browse offline Wikipedia and Khan Academy within the same unified portal.

#### Phase 5: Production Deployment & Alliance Hand-Off
1. Execute the Zorin OS automated configuration script (`setup_zorin_server.sh`).
2. Run multi-device concurrent stress test across 25+ computer lab PCs and 15 Wi-Fi connected tablets.
3. Train Computer Club members on model maintenance, backup protocols, and past question digitization.
4. Deliver operational documentation to the Office of the Head Boy and Library Staff.

---

### 6. Hardware Allocation & Network Topology (Zorin OS)

```
[ School Wi-Fi Router / Lab Switch (192.168.1.1) ]
                  |
                  +--- (Static IP: 192.168.1.150) ---> [ Caesium Edge Host (Zorin OS) ]
                  |                                     - RAM: 8GB - 16GB
                  |                                     - Storage: 256GB SSD + 1TB HDD
                  |                                     - CPU: Intel Core i5 / AMD Ryzen 5
                  |
                  +--- [ Lab PC 01 .. Lab PC 30 ] ----> Browser: http://192.168.1.150
                  +--- [ Library Terminal ] -----------> Browser: http://192.168.1.150/tlp
                  +--- [ Student Mobile Wi-Fi ] -------> Browser: http://192.168.1.150
```

#### Resource Allocation Matrix
| Service | CPU Share | RAM Allocation | Storage Path & Purpose |
| :--- | :--- | :--- | :--- |
| **`caesium-proxy`** | 5% | 128 MB | Nginx configuration & static cache |
| **`caesium-portal`** | 15% | 512 MB | Next.js production build |
| **`caesium-core`** | 15% | 512 MB | Express, Socket.io, SQLite WAL file |
| **`caesium-kiwix`** | 10% | 512 MB | `/opt/caesium/kiwix/zim` (Wikipedia ~40GB, Khan ~30GB) |
| **`caesium-ollama`** | 50% | 3.5 GB - 6 GB | Qwen 2.5 1.5B (980MB VRAM) or 7.0B (4.7GB VRAM) |
| **`caesium-webui`** | 5% | 512 MB | Open-WebUI conversation database |

---

### 7. Verification & Acceptance Testing Protocol

| Verification Scenario | Acceptance Criteria | Method |
| :--- | :--- | :--- |
| **1. Zero-Internet Isolation** | Unplug WAN/DSL cable from router. Access `http://192.168.1.150`. All PDF downloads, CBT exams, Kiwix searches, and AI chats must function without packet loss. | Hardware disconnect + curl sanity checks |
| **2. High-Speed LAN Download** | A 50 MB WAEC Past Question compilation downloads in $< 2$ seconds on Gigabit LAN and $< 6$ seconds on Wi-Fi. | Browser download timing & `nload` metric |
| **3. Concurrent Lab Load** | 30 lab workstations concurrently accessing the Math Arena and taking CBT exams without server thread starvation. | ApacheBench / Artillery socket stress test |
| **4. Library Overdue Alert** | Loans past the `due_date` automatically display red overdue indicators and calculate elapsed days accurately. | Database time-offset test |
| **5. AI Offline Inference** | Ollama generates responses for physics/math prompts in $< 1.5$ seconds per token using CPU AVX2 instructions on Qwen 2.5 1.5B. | API benchmark via `/api/ollama/generate` |

---

### 8. Institutional Hand-Off & Maintenance Roles

- **Computer Club Responsibilities**:
  - Weekly SQLite database backups to external cold storage (`caecium_backup_YYYYMMDD.db`).
  - Digitization and OCR processing of new termly examination papers.
  - Monitoring Docker container uptime via `docker compose ps`.
- **STEM Society Responsibilities**:
  - Hardware health maintenance (cleaning thermal paste, dust prevention in lab workstation).
  - LAN cable integrity testing and Wi-Fi access point coverage maintenance.
  - Organizing the question bank for the annual **JSS1 vs JSS2 Mathematics Competition**.
- **Office of the Head Boy**:
  - Executive oversight and liaison with School Principal and Board of Governors.
  - Ensuring fair, open, and strictly data-free access to every student at Tunwase High School.

---
*Signed and Approved for Implementation:*  
**Jeffrey Feyisetan** — *Head Boy, Tunwase High School*  
**Caesium Alliance Executive Committee (Computer Club & STEM Society)*
