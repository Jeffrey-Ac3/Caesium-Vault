const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const db = require('./database');

const resourcesDir = path.join(__dirname, 'resources_folder');

// Ensure the directory exists
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
  console.log('📁 Created resources_folder for academic repository.');
}

// Helper to infer metadata from path & filename
function extractMetadata(filepath) {
  const relativePath = path.relative(resourcesDir, filepath).replace(/\\/g, '/');
  const filename = path.basename(filepath);
  const ext = path.extname(filename).toLowerCase();
  const searchStr = `${relativePath} ${filename}`.toLowerCase();

  // 1. File Type
  let type = 'document';
  if (ext === '.zim') type = 'kiwix-archive';
  else if (['.mp4', '.mkv', '.avi', '.webm'].includes(ext)) type = 'video';
  else if (['.pdf'].includes(ext)) type = 'pdf';
  else if (['.epub', '.docx', '.pptx', '.txt'].includes(ext)) type = 'document';
  else if (['.jpg', '.png', '.svg'].includes(ext)) type = 'image';

  // 2. Grade Level
  let gradeLevel = 'All Grades';
  if (/\bjss1\b/i.test(searchStr)) gradeLevel = 'JSS1';
  else if (/\bjss2\b/i.test(searchStr)) gradeLevel = 'JSS2';
  else if (/\bjss3\b/i.test(searchStr)) gradeLevel = 'JSS3';
  else if (/\bss1\b/i.test(searchStr)) gradeLevel = 'SS1';
  else if (/\bss2\b/i.test(searchStr)) gradeLevel = 'SS2';
  else if (/\bss3\b/i.test(searchStr)) gradeLevel = 'SS3';

  // 3. Category
  let category = 'General Resource';
  if (/past|waec|neco|bece|jamb|utme|mock|exam/i.test(searchStr)) {
    category = 'Past Exam Questions';
  } else if (/note|syllabus|scheme|curriculum|module/i.test(searchStr)) {
    category = 'Syllabus Notes';
  } else if (/practical|lab|stem|drawing|circuit|sensor|fiber|project/i.test(searchStr)) {
    category = 'STEM Practicals';
  } else if (/competition|arena|contest|clash|quiz|challenge/i.test(searchStr)) {
    category = 'Competition Bank';
  } else if (ext === '.zim') {
    category = 'Kiwix Offline Archives';
  }

  // 4. Subject Detection
  let subject = 'General Science';
  if (/math|further\s*math|algebra|geometry/i.test(searchStr)) subject = 'Mathematics';
  else if (/physics|quantum|motion|optics/i.test(searchStr)) subject = 'Physics';
  else if (/chem/i.test(searchStr)) subject = 'Chemistry';
  else if (/bio/i.test(searchStr)) subject = 'Biology';
  else if (/english|oral|literature/i.test(searchStr)) subject = 'English Language';
  else if (/tech|drawing|cad/i.test(searchStr)) subject = 'Technical Drawing';
  else if (/computer|ict|programming|coding/i.test(searchStr)) subject = 'Computer Studies';
  else if (/econ/i.test(searchStr)) subject = 'Economics';
  else if (/account/i.test(searchStr)) subject = 'Accounting';
  else if (/commerce/i.test(searchStr)) subject = 'Commerce';
  else if (/govt|government|civic/i.test(searchStr)) subject = 'Government & Civic';
  else if (/phet/i.test(searchStr)) subject = 'Interactive STEM Labs';
  else if (/aviation/i.test(searchStr)) subject = 'Aeronautics & Physics';

  // 5. Department Detection
  let department = 'General';
  if (['Physics', 'Chemistry', 'Biology', 'Technical Drawing', 'Computer Studies', 'Interactive STEM Labs', 'Aeronautics & Physics'].includes(subject)) {
    department = 'Sciences';
  } else if (['Economics', 'Accounting', 'Commerce'].includes(subject)) {
    department = 'Commercial';
  } else if (['Government & Civic', 'Literature'].includes(subject)) {
    department = 'Arts';
  }

  // 6. Friendly Title
  let title = path.parse(filename).name
    .replace(/[_-]+/g, ' ')
    .replace(/\.stackexchange\.com|\.net|\.org/gi, '')
    .trim();
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // File size in bytes
  let fileSize = 0;
  try {
    fileSize = fs.statSync(filepath).size;
  } catch (e) {
    // file size unavailable
  }

  return {
    filename,
    relativePath,
    title,
    type,
    gradeLevel,
    category,
    department,
    subject,
    fileSize
  };
}

// Function to add or update file in database
function addFileToDatabase(filepath) {
  const meta = extractMetadata(filepath);

  const query = `
    INSERT INTO resources (
      title, filename, type, grade_level, category, department, subject, file_size, relative_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(filename) DO UPDATE SET
      title=excluded.title,
      type=excluded.type,
      grade_level=excluded.grade_level,
      category=excluded.category,
      department=excluded.department,
      subject=excluded.subject,
      file_size=excluded.file_size,
      relative_path=excluded.relative_path
  `;

  db.run(query, [
    meta.title,
    meta.filename,
    meta.type,
    meta.gradeLevel,
    meta.category,
    meta.department,
    meta.subject,
    meta.fileSize,
    meta.relativePath
  ], function(err) {
    if (err) {
      console.error(`Error indexing ${meta.filename}:`, err.message);
    } else {
      console.log(`📥 Indexed resource: [${meta.gradeLevel}] ${meta.title} (${meta.category} - ${meta.subject})`);
    }
  });
}

// Function to remove a file from database
function removeFileFromDatabase(filepath) {
  const filename = path.basename(filepath);
  db.run(`DELETE FROM resources WHERE filename = ?`, [filename], function(err) {
    if (err) {
      console.error(`Error removing ${filename}:`, err.message);
    } else if (this.changes > 0) {
      console.log(`🗑️ Resource unindexed: ${filename}`);
    }
  });
}

// Start watching the directory recursively
function startScanner() {
  console.log(`👀 Starting recursive academic file scanner on ${resourcesDir}...`);
  
  const watcher = chokidar.watch(resourcesDir, {
    persistent: true,
    ignoreInitial: false,
    depth: 5 // scan subdirectories up to 5 levels
  });

  watcher
    .on('add', filepath => addFileToDatabase(filepath))
    .on('change', filepath => addFileToDatabase(filepath))
    .on('unlink', filepath => removeFileFromDatabase(filepath));
}

module.exports = { startScanner, extractMetadata };
