const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query, withTransaction } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  validateBody,
  createTeacherSchema,
  createStudentSchema,
  createSubjectSchema,
  createCourseSchema,
  assignSubjectSchema,
  reviewSubmissionSchema
} = require('../middleware/validate');
const { getAnalytics, invalidateAnalyticsCache } = require('../services/analyticsService');

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('ADMIN'));

// 1. Paginated Teachers List
router.get('/teachers', async (req, res, next) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);
  const offset = (page - 1) * limit;

  try {
    const totalRows = await query("SELECT COUNT(*) as count FROM users WHERE role = 'TEACHER'");
    const total = Number(totalRows[0]?.count || 0);

    const sql = `
      SELECT u.id, u.name, u.email, u.department, u.course,
             GROUP_CONCAT(ta.subjectName SEPARATOR ', ') as assignedSubjects
      FROM users u
      LEFT JOIN teacher_assignments ta ON u.id = ta.teacherId
      WHERE u.role = 'TEACHER'
      GROUP BY u.id, u.name, u.email, u.department, u.course
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
    `;
    const rows = await query(sql, [limit, offset]);
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// 2. Create Teacher (Random token if no password supplied + forced password change)
router.post('/teacher/create', validateBody(createTeacherSchema), async (req, res, next) => {
  const { name, email, password, department, course } = req.body;
  try {
    const initialPassword = password || crypto.randomBytes(8).toString('hex');
    const mustChangePassword = password ? 0 : 1;
    const hashedPassword = await bcrypt.hash(initialPassword, 12);

    const sql = `INSERT INTO users (name, email, password, role, department, course, mustChangePassword) VALUES (?, ?, ?, 'TEACHER', ?, ?, ?)`;
    await query(sql, [name, email, hashedPassword, department || 'Computer Science', course || 'B.Tech CSE', mustChangePassword]);

    res.json({
      message: `Teacher ${name} created successfully!`,
      oneTimePassword: password ? undefined : initialPassword,
      mustChangePassword: !!mustChangePassword
    });
  } catch (err) {
    next(err);
  }
});

// 3. Paginated Students List
router.get('/students', async (req, res, next) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);
  const offset = (page - 1) * limit;

  try {
    const totalRows = await query("SELECT COUNT(*) as count FROM users WHERE role = 'STUDENT'");
    const total = Number(totalRows[0]?.count || 0);

    const rows = await query(
      "SELECT id, name, email, rollNo, course, department, semester, section, fatherName, motherName, enrollmentNo FROM users WHERE role = 'STUDENT' ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// 4. Create Student (Random token if no password supplied + forced password change)
router.post('/student/create', validateBody(createStudentSchema), async (req, res, next) => {
  const { name, email, rollNo, course, department, password, semester, section, fatherName, motherName, enrollmentNo } = req.body;
  try {
    const studentEmail = email || `${rollNo}@sol.du.ac.in`;
    const initialPassword = password || crypto.randomBytes(8).toString('hex');
    const mustChangePassword = password ? 0 : 1;
    const hashedPassword = await bcrypt.hash(initialPassword, 12);

    const sql = `
      INSERT INTO users (name, email, password, role, rollNo, course, department, semester, section, fatherName, motherName, enrollmentNo, mustChangePassword)
      VALUES (?, ?, ?, 'STUDENT', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await query(sql, [
      name,
      studentEmail,
      hashedPassword,
      rollNo,
      course || 'B.Tech CSE',
      department || 'School of Open Learning',
      semester || 'I',
      section || 'A',
      fatherName || null,
      motherName || null,
      enrollmentNo || `23SOL${rollNo}`,
      mustChangePassword
    ]);

    res.json({
      message: `Student ${name} created successfully!`,
      oneTimePassword: password ? undefined : initialPassword,
      mustChangePassword: !!mustChangePassword
    });
  } catch (err) {
    next(err);
  }
});

// 5. Paginated Subjects List
router.get('/subjects', async (req, res, next) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '50', 10);
  const offset = (page - 1) * limit;

  try {
    const totalRows = await query("SELECT COUNT(*) as count FROM subjects");
    const total = Number(totalRows[0]?.count || 0);

    const rows = await query("SELECT * FROM subjects ORDER BY id DESC LIMIT ? OFFSET ?", [limit, offset]);
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// 6. Create Subject
router.post('/subject/create', validateBody(createSubjectSchema), async (req, res, next) => {
  const { code, name, course, semester, maxMarks, assessmentType } = req.body;
  try {
    const sql = `INSERT INTO subjects (code, name, course, semester, maxMarks, assessmentType) VALUES (?, ?, ?, ?, ?, ?)`;
    await query(sql, [code, name, course, semester, maxMarks, assessmentType]);
    res.json({ message: `Subject ${code} (${name}) created successfully!` });
  } catch (err) {
    next(err);
  }
});

// 7. Paginated Courses List
router.get('/courses', async (req, res, next) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '50', 10);
  const offset = (page - 1) * limit;

  try {
    const totalRows = await query("SELECT COUNT(*) as count FROM courses");
    const total = Number(totalRows[0]?.count || 0);

    const rows = await query("SELECT * FROM courses ORDER BY id DESC LIMIT ? OFFSET ?", [limit, offset]);
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// 8. Create Course
router.post('/course/create', validateBody(createCourseSchema), async (req, res, next) => {
  const { code, name, department } = req.body;
  try {
    const sql = `INSERT INTO courses (code, name, department) VALUES (?, ?, ?)`;
    await query(sql, [code, name, department]);
    res.json({ message: `Course ${code} (${name}) created successfully!` });
  } catch (err) {
    next(err);
  }
});

// 9. Assign Subject to Teacher (Auto-ensures subject and course exist in DB to satisfy FK constraints)
router.post('/assign-subject', validateBody(assignSubjectSchema), async (req, res, next) => {
  const { teacherId, teacherEmail, teacherName, subjectCode, subjectName, course, semester, section } = req.body;
  try {
    // 1. Ensure course exists in courses table
    await query(
      `INSERT INTO courses (code, name, department)
       VALUES (?, ?, 'School of Open Learning')
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [course, course]
    );

    // 2. Ensure subject exists in subjects table to avoid foreign key failure
    await query(
      `INSERT INTO subjects (code, name, course, semester, maxMarks, assessmentType)
       VALUES (?, ?, ?, ?, 40, 'Practical')
       ON DUPLICATE KEY UPDATE name = VALUES(name), course = VALUES(course), semester = VALUES(semester)`,
      [subjectCode, subjectName, course, semester]
    );

    // 3. Insert assignment
    const sql = `INSERT INTO teacher_assignments (teacherId, teacherEmail, teacherName, subjectCode, subjectName, course, semester, section)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await query(sql, [teacherId, teacherEmail, teacherName, subjectCode, subjectName, course, semester, section]);
    res.json({ message: `Successfully assigned ${subjectCode} (${subjectName}) to ${teacherName}` });
  } catch (err) {
    next(err);
  }
});

// 10. Approval Queue
router.get('/approval-queue', async (req, res, next) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);
  const offset = (page - 1) * limit;

  try {
    const totalRows = await query("SELECT COUNT(*) as count FROM mark_submissions WHERE status IN ('UNDER_REVIEW', 'DRAFT')");
    const total = Number(totalRows[0]?.count || 0);

    const submissions = await query(
      "SELECT * FROM mark_submissions WHERE status IN ('UNDER_REVIEW', 'DRAFT') ORDER BY submittedAt DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    res.json({ data: submissions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// 10b. Get Marks for a Specific Submission (Admin Review)
router.get('/submission/:submissionId/marks', async (req, res, next) => {
  const submissionId = req.params.submissionId;
  try {
    const rows = await query(
      "SELECT id, rollNo, studentName, paperCode, paperName, prObt, prMax, thObt, thMax, totalObt, netGrade, gradePoint FROM marks WHERE submissionId = ? ORDER BY rollNo ASC",
      [submissionId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// 11. Review Submission (Consistent PUBLISHED status across both mark_submissions and marks)
router.post('/submission/review', validateBody(reviewSubmissionSchema), async (req, res, next) => {
  const { submissionId, action, rejectionReason } = req.body;
  const status = action === 'APPROVE' ? 'PUBLISHED' : 'CORRECTION_REQUIRED';

  try {
    await withTransaction(async (conn) => {
      await conn.execute(
        "UPDATE mark_submissions SET status = ?, rejectionReason = ?, reviewedAt = CURRENT_TIMESTAMP WHERE id = ?",
        [status, action === 'REJECT' ? rejectionReason : null, submissionId]
      );
      await conn.execute(
        "UPDATE marks SET status = ? WHERE submissionId = ?",
        [status, submissionId]
      );
    });

    invalidateAnalyticsCache();
    res.json({ message: `Submission ${submissionId} status updated to ${status}` });
  } catch (err) {
    next(err);
  }
});

// 12. Audit Logs
router.get('/audit-logs', async (req, res, next) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '50', 10);
  const offset = (page - 1) * limit;

  try {
    const totalRows = await query("SELECT COUNT(*) as count FROM marks_audit");
    const total = Number(totalRows[0]?.count || 0);

    const rows = await query("SELECT * FROM marks_audit ORDER BY timestamp DESC LIMIT ? OFFSET ?", [limit, offset]);
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// 13. Cached Analytics
router.get('/analytics', async (req, res, next) => {
  try {
    const analytics = await getAnalytics();
    res.json(analytics);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
