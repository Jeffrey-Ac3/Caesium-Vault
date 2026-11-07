const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// This creates a file called caecium.db in the backend folder
const dbPath = path.resolve(__dirname, 'caecium.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('📦 Connected to the SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Create Users table (Simple account creation: username, password, role)
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create Resources table (Tracks downloaded Kiwix files & Academic PDFs)
    db.run(`CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      filename TEXT UNIQUE,
      type TEXT,
      grade_level TEXT DEFAULT 'All Grades',
      category TEXT DEFAULT 'General',
      department TEXT DEFAULT 'General',
      subject TEXT DEFAULT 'General',
      file_size INTEGER DEFAULT 0,
      relative_path TEXT,
      download_count INTEGER DEFAULT 0,
      date_added DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Add missing columns if upgrading an older database
    const columns = [
      { name: 'grade_level', def: "TEXT DEFAULT 'All Grades'" },
      { name: 'category', def: "TEXT DEFAULT 'General'" },
      { name: 'department', def: "TEXT DEFAULT 'General'" },
      { name: 'subject', def: "TEXT DEFAULT 'General'" },
      { name: 'file_size', def: 'INTEGER DEFAULT 0' },
      { name: 'relative_path', def: 'TEXT' },
      { name: 'download_count', def: 'INTEGER DEFAULT 0' }
    ];

    columns.forEach(col => {
      db.run(`ALTER TABLE resources ADD COLUMN ${col.name} ${col.def}`, (err) => {
        // Ignore "duplicate column name" error if it already exists
      });
    });

    // Create Exams table
    db.run(`CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      grade_level TEXT DEFAULT 'All',
      subject TEXT DEFAULT 'Mathematics',
      duration_minutes INTEGER DEFAULT 30,
      total_questions INTEGER DEFAULT 15,
      instructions TEXT,
      date_created DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create Exam Questions table
    db.run(`CREATE TABLE IF NOT EXISTS exam_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id INTEGER NOT NULL,
      question_number INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL,
      explanation TEXT,
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    )`);

    // Create Exam Submissions table (with Leaderboard capability)
    db.run(`CREATE TABLE IF NOT EXISTS exam_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id INTEGER NOT NULL,
      student_name TEXT NOT NULL,
      student_class TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      percentage REAL NOT NULL,
      time_spent_seconds INTEGER DEFAULT 0,
      answers_json TEXT,
      anonymous_on_leaderboard INTEGER DEFAULT 0,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (exam_id) REFERENCES exams(id)
    )`);

    // Math Arena Questions table
    db.run(`CREATE TABLE IF NOT EXISTS arena_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL,
      difficulty TEXT DEFAULT 'Junior',
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL,
      explanation TEXT
    )`);

    console.log('Database tables verified and migrated successfully.');
  });
}

module.exports = db;
