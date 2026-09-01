const mysql = require('mysql2');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Live MySQL Database Credentials from DirectAdmin / Control Panel
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'univers1_soldata';
const DB_PASSWORD = process.env.DB_PASSWORD || 'HhnqPv6TJYsn9hRwa2w6';
const DB_NAME = process.env.DB_NAME || 'univers1_soldata';
const USE_MYSQL = process.env.USE_MYSQL !== 'false';

let dbPool;
let isMySQL = false;

// Auto Create Tables in Live MySQL Database
async function initMySQLSchema(pool) {
  try {
    console.log("Auto-creating MySQL tables & seeding default data...");

    // 1. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        rollNo VARCHAR(100),
        course VARCHAR(255),
        department VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Mark Submissions Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mark_submissions (
        id VARCHAR(100) PRIMARY KEY,
        subjectCode VARCHAR(100) NOT NULL,
        subjectName VARCHAR(255) NOT NULL,
        course VARCHAR(255) NOT NULL,
        semester VARCHAR(50) NOT NULL,
        examType VARCHAR(100) NOT NULL,
        totalStudents INT NOT NULL,
        status VARCHAR(50) DEFAULT 'SUBMITTED',
        teacherEmail VARCHAR(255) NOT NULL,
        teacherName VARCHAR(255) NOT NULL,
        rejectionReason TEXT,
        submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewedAt DATETIME
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Marks Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS marks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submissionId VARCHAR(100),
        rollNo VARCHAR(100) NOT NULL,
        studentName VARCHAR(255) NOT NULL,
        paperCode VARCHAR(100) NOT NULL,
        paperName VARCHAR(255) NOT NULL,
        paperType VARCHAR(50) NOT NULL,
        sem VARCHAR(50) NOT NULL,
        credit INT NOT NULL,
        thObt INT DEFAULT 0,
        thMax INT DEFAULT 75,
        tuObt INT DEFAULT 0,
        tuMax INT DEFAULT 25,
        prObt INT DEFAULT 0,
        prMax INT DEFAULT 0,
        netGrade VARCHAR(10) NOT NULL,
        gradePoint INT NOT NULL,
        creditPoint INT NOT NULL,
        status VARCHAR(50) DEFAULT 'SUBMITTED',
        uploadedBy VARCHAR(255) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Marks Audit Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS marks_audit (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submissionId VARCHAR(100),
        rollNo VARCHAR(100) NOT NULL,
        studentName VARCHAR(255) NOT NULL,
        paperCode VARCHAR(100) NOT NULL,
        fieldModified VARCHAR(100) NOT NULL,
        previousValue VARCHAR(255),
        newValue VARCHAR(255),
        modifiedBy VARCHAR(255) NOT NULL,
        reason TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default users if empty
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM users");
    if (rows && rows[0] && rows[0].count === 0) {
      await pool.query(`
        INSERT INTO users (name, email, password, role, rollNo, course, department) 
        VALUES 
        ('System Admin', 'admin@sol.du.ac.in', 'admin123', 'ADMIN', NULL, NULL, 'Examination Branch'),
        ('Dr. Rahul Sharma', 'teacher@sol.du.ac.in', 'teacher123', 'TEACHER', NULL, NULL, 'Computer Science'),
        ('Sahil Sumrani', 'student@sol.du.ac.in', 'student123', 'STUDENT', '23345227188', '(NEP) B.A. (PROGRAMME)', 'School of Open Learning');
      `);
      console.log("MySQL default users seeded successfully.");
    }

    console.log("✓ Live MySQL Database Tables Auto-Created Successfully!");
  } catch (err) {
    console.error("MySQL Auto Table Creation Error:", err.message);
  }
}

if (USE_MYSQL) {
  try {
    dbPool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    }).promise();
    isMySQL = true;
    console.log(`Connected to Live MySQL Database: ${DB_NAME} at ${DB_HOST}`);
    initMySQLSchema(dbPool);
  } catch (err) {
    console.warn("Live MySQL Connection failed, falling back to local SQLite", err.message);
  }
}

// Fallback SQLite Connection setup
const dbPath = path.resolve(__dirname, 'sol_portal.sqlite');
const sqliteDb = new sqlite3.Database(dbPath);

sqliteDb.serialize(() => {
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      rollNo TEXT,
      course TEXT,
      department TEXT
    )
  `);

  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS mark_submissions (
      id TEXT PRIMARY KEY,
      subjectCode TEXT NOT NULL,
      subjectName TEXT NOT NULL,
      course TEXT NOT NULL,
      semester TEXT NOT NULL,
      examType TEXT NOT NULL,
      totalStudents INTEGER NOT NULL,
      status TEXT DEFAULT 'SUBMITTED',
      teacherEmail TEXT NOT NULL,
      teacherName TEXT NOT NULL,
      rejectionReason TEXT,
      submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewedAt DATETIME
    )
  `);

  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS marks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submissionId TEXT,
      rollNo TEXT NOT NULL,
      studentName TEXT NOT NULL,
      paperCode TEXT NOT NULL,
      paperName TEXT NOT NULL,
      paperType TEXT NOT NULL,
      sem TEXT NOT NULL,
      credit INTEGER NOT NULL,
      thObt INTEGER DEFAULT 0,
      thMax INTEGER DEFAULT 75,
      tuObt INTEGER DEFAULT 0,
      tuMax INTEGER DEFAULT 25,
      prObt INTEGER DEFAULT 0,
      prMax INTEGER DEFAULT 0,
      netGrade TEXT NOT NULL,
      gradePoint INTEGER NOT NULL,
      creditPoint INTEGER NOT NULL,
      status TEXT DEFAULT 'SUBMITTED',
      uploadedBy TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS marks_audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submissionId TEXT,
      rollNo TEXT NOT NULL,
      studentName TEXT NOT NULL,
      paperCode TEXT NOT NULL,
      fieldModified TEXT NOT NULL,
      previousValue TEXT,
      newValue TEXT,
      modifiedBy TEXT NOT NULL,
      reason TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  sqliteDb.run(`CREATE INDEX IF NOT EXISTS idx_marks_rollno_status ON marks (rollNo, status)`);

  sqliteDb.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (row && row.count === 0) {
      const stmt = sqliteDb.prepare("INSERT INTO users (name, email, password, role, rollNo, course, department) VALUES (?, ?, ?, ?, ?, ?, ?)");
      stmt.run("System Admin", "admin@sol.du.ac.in", "admin123", "ADMIN", null, null, "Examination Branch");
      stmt.run("Dr. Rahul Sharma", "teacher@sol.du.ac.in", "teacher123", "TEACHER", null, null, "Computer Science");
      stmt.run("Sahil Sumrani", "student@sol.du.ac.in", "student123", "STUDENT", "23345227188", "(NEP) B.A. (PROGRAMME)", "School of Open Learning");
      stmt.finalize();
    }
  });
});

module.exports = {
  sqliteDb,
  dbPool,
  isMySQL
};
