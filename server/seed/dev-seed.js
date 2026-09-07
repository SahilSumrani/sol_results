/**
 * DEVELOPMENT SEED SCRIPT
 * WARNING: THIS SCRIPT IS STRICTLY FOR LOCAL DEV / DEMO TESTING ONLY.
 * NEVER RUN THIS SCRIPT IN STAGING OR PRODUCTION ENVIRONMENTS.
 */
const bcrypt = require('bcryptjs');
const { pool } = require('../src/db');
require('dotenv').config();

if (process.env.NODE_ENV === 'production') {
  console.error('CRITICAL ERROR: dev-seed.js execution blocked in production environment!');
  process.exit(1);
}

async function seedDevData() {
  console.log('Seeding local development database...');
  const connection = await pool.getConnection();

  try {
    const adminPass = await bcrypt.hash('admin123', 12);
    const teacherPass = await bcrypt.hash('teacher123', 12);
    const studentPass = await bcrypt.hash('student123', 12);

    // 1. Users
    await connection.query(`
      INSERT INTO users (name, email, password, role, rollNo, course, department, semester, section, fatherName, motherName, enrollmentNo) VALUES
      ('System Admin', 'admin@sol.du.ac.in', ?, 'ADMIN', NULL, NULL, 'Examination Branch', NULL, NULL, NULL, NULL, NULL),
      ('Dr. Rahul Sharma', 'teacher@sol.du.ac.in', ?, 'TEACHER', NULL, 'B.Tech CSE', 'Computer Science & Engineering', NULL, NULL, NULL, NULL, NULL),
      ('Aman Kumar', 'student1@sol.du.ac.in', ?, 'STUDENT', '240101', 'B.Tech CSE', 'School of Open Learning', 'VIII', 'A', 'Rajesh Kumar', 'Sunita Devi', '23SOL240101'),
      ('Priya Singh', 'student2@sol.du.ac.in', ?, 'STUDENT', '240102', 'B.Tech CSE', 'School of Open Learning', 'VIII', 'A', 'Virender Singh', 'Anita Singh', '23SOL240102')
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `, [adminPass, teacherPass, studentPass, studentPass]);

    // 2. Courses & Subjects
    await connection.query(`
      INSERT INTO courses (code, name, department) VALUES
      ('BTECH-CSE', 'B.Tech CSE', 'Computer Science & Engineering')
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    await connection.query(`
      INSERT INTO subjects (code, name, course, semester, maxMarks, assessmentType) VALUES
      ('CS401L', 'Artificial Intelligence Lab', 'B.Tech CSE', 'VIII', 40, 'Practical')
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    // 3. Teacher Assignment
    const [teacherRow] = await connection.query(`SELECT id FROM users WHERE email = 'teacher@sol.du.ac.in'`);
    if (teacherRow.length > 0) {
      await connection.query(`
        INSERT INTO teacher_assignments (teacherId, teacherEmail, teacherName, subjectCode, subjectName, course, semester, section) VALUES
        (?, 'teacher@sol.du.ac.in', 'Dr. Rahul Sharma', 'CS401L', 'Artificial Intelligence Lab', 'B.Tech CSE', 'VIII', 'A')
      `, [teacherRow[0].id]);
    }

    console.log('✓ Local dev database seeded successfully.');
  } catch (err) {
    console.error('Dev seeding error:', err.message);
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  seedDevData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedDevData };
