const express = require('express');
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// 1. Student fetches published marks for their roll number
router.get('/student/:rollNo', async (req, res, next) => {
  const rollNo = req.params.rollNo;

  // IDOR Check: A student token MUST carry a valid rollNo. Falsy rollNo or mismatch is strictly rejected with 403.
  if (req.user.role === 'STUDENT') {
    if (!req.user.rollNo || req.user.rollNo !== rollNo) {
      return res.status(403).json({ error: 'Forbidden: You can only view your own published marks' });
    }
  }

  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '50', 10);
  const offset = (page - 1) * limit;

  try {
    const totalRows = await query(
      "SELECT COUNT(*) as count FROM marks WHERE rollNo = ? AND status = 'PUBLISHED'",
      [rollNo]
    );
    const total = Number(totalRows[0]?.count || 0);

    const rows = await query(
      `SELECT m.*, u.course as userCourse, u.department, u.fatherName, u.motherName, u.enrollmentNo
       FROM marks m
       LEFT JOIN users u ON m.rollNo = u.rollNo
       WHERE m.rollNo = ? AND m.status = 'PUBLISHED'
       ORDER BY m.createdAt DESC LIMIT ? OFFSET ?`,
      [rollNo, limit, offset]
    );

    // If teacher/admin is searching and no published marks exist yet, provide enrolled student profile info
    if (rows.length === 0 && (req.user.role === 'TEACHER' || req.user.role === 'ADMIN')) {
      const studentUser = await query(
        "SELECT rollNo, name as studentName, course, department, semester as sem FROM users WHERE rollNo = ? AND role = 'STUDENT'",
        [rollNo]
      );
      if (studentUser && studentUser.length > 0) {
        return res.json({
          data: [{
            ...studentUser[0],
            status: 'ENROLLED'
          }],
          pagination: { page: 1, limit, total: 1, totalPages: 1 }
        });
      }
    }

    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// 2. Audit Trail Authorization (ADMIN=all, TEACHER=own submissions, STUDENT=own rollNo)
router.get('/audit/:submissionId', async (req, res, next) => {
  const submissionId = req.params.submissionId;
  const user = req.user;

  try {
    if (user.role === 'ADMIN') {
      const rows = await query("SELECT * FROM marks_audit WHERE submissionId = ? ORDER BY timestamp DESC", [submissionId]);
      return res.json(rows);
    }

    if (user.role === 'TEACHER') {
      const submission = await query(
        "SELECT id FROM mark_submissions WHERE id = ? AND (teacherId = ? OR teacherEmail = ?)",
        [submissionId, user.id, user.email]
      );
      if (!submission || submission.length === 0) {
        return res.status(403).json({ error: 'Forbidden: You can only view audit logs for your own submissions' });
      }
      const rows = await query("SELECT * FROM marks_audit WHERE submissionId = ? ORDER BY timestamp DESC", [submissionId]);
      return res.json(rows);
    }

    if (user.role === 'STUDENT') {
      if (!user.rollNo) {
        return res.status(403).json({ error: 'Forbidden: Invalid student identity token' });
      }
      const rows = await query(
        "SELECT * FROM marks_audit WHERE submissionId = ? AND rollNo = ? ORDER BY timestamp DESC",
        [submissionId, user.rollNo]
      );
      return res.json(rows);
    }

    return res.status(403).json({ error: 'Forbidden: Role not authorized to view audit logs' });
  } catch (err) {
    next(err);
  }
});

// 3. Student Re-Evaluation Request
router.post('/re-evaluation', async (req, res, next) => {
  const { subjectName, currentGrade, requestedReview } = req.body;
  const rollNo = req.user.rollNo;
  const studentName = req.user.name;

  if (req.user.role !== 'STUDENT' || !rollNo) {
    return res.status(403).json({ error: 'Forbidden: Only students can request re-evaluation' });
  }

  if (!requestedReview || !subjectName) {
    return res.status(400).json({ error: 'subjectName and requestedReview are required' });
  }

  try {
    const queryId = `REV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    await query(
      "INSERT INTO re_evaluations (queryId, rollNo, studentName, subjectName, currentGrade, requestedReview, status) VALUES (?, ?, ?, ?, ?, ?, 'PENDING')",
      [queryId, rollNo, studentName, subjectName, currentGrade || 'B+', requestedReview]
    );
    res.json({ message: 'Re-evaluation query submitted successfully', queryId });
  } catch (err) {
    next(err);
  }
});

// 4. Student view own Re-Evaluations
router.get('/re-evaluations', async (req, res, next) => {
  if (req.user.role !== 'STUDENT' || !req.user.rollNo) {
    return res.status(403).json({ error: 'Forbidden: Only students can view their re-evaluation requests' });
  }
  try {
    const rows = await query("SELECT * FROM re_evaluations WHERE rollNo = ? ORDER BY requestedAt DESC", [req.user.rollNo]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
