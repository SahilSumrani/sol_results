const express = require('express');
const xlsx = require('xlsx');
const { query, withTransaction } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateBody, submitMarksSchema, resubmitMarksSchema } = require('../middleware/validate');
const { calculateGrade } = require('../services/gradeService');
const { invalidateAnalyticsCache } = require('../services/analyticsService');

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('TEACHER'));

// 1. Fetch Teacher Assignments (uses verified req.user.id)
router.get('/assignments', async (req, res, next) => {
  try {
    const rows = await query(
      "SELECT * FROM teacher_assignments WHERE teacherId = ? OR teacherEmail = ? ORDER BY assignedAt DESC",
      [req.user.id, req.user.email]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// 2. Fetch Teacher Submissions (uses verified req.user.id)
router.get('/submissions', async (req, res, next) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);
  const offset = (page - 1) * limit;

  try {
    const totalRows = await query(
      "SELECT COUNT(*) as count FROM mark_submissions WHERE teacherId = ? OR teacherEmail = ?",
      [req.user.id, req.user.email]
    );
    const total = Number(totalRows[0]?.count || 0);

    const rows = await query(
      "SELECT * FROM mark_submissions WHERE teacherId = ? OR teacherEmail = ? ORDER BY submittedAt DESC LIMIT ? OFFSET ?",
      [req.user.id, req.user.email, limit, offset]
    );
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// 3. Dynamic Excel Template Download
router.get('/template/download', async (req, res, next) => {
  const { subjectCode, maxMarks } = req.query;

  try {
    let enrolledStudents = [];
    if (subjectCode) {
      const subjectRows = await query("SELECT course FROM subjects WHERE code = ?", [subjectCode]);
      if (subjectRows && subjectRows.length > 0 && subjectRows[0].course) {
        enrolledStudents = await query(
          "SELECT rollNo, name FROM users WHERE role = 'STUDENT' AND course = ? ORDER BY rollNo ASC",
          [subjectRows[0].course]
        );
      }
    }

    if (!enrolledStudents || enrolledStudents.length === 0) {
      enrolledStudents = await query(
        "SELECT rollNo, name FROM users WHERE role = 'STUDENT' ORDER BY rollNo ASC"
      );
    }

    const templateRows = enrolledStudents && enrolledStudents.length > 0
      ? enrolledStudents.map(s => ({
          "Roll No": s.rollNo,
          "Student Name": s.name,
          "Internal Marks": "",
          "Practical Marks": "",
          "Remarks": ""
        }))
      : [
          { "Roll No": "", "Student Name": "", "Internal Marks": "", "Practical Marks": "", "Remarks": "" }
        ];

    const worksheet = xlsx.utils.json_to_sheet(templateRows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Marks Entry Template");

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Marks_Template_${subjectCode || 'SUBJECT'}.xlsx`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

// 4. Submit Marks (Strict Assignment Check + Comprehensive Data Validation + Transaction)
router.post('/marks/submit', validateBody(submitMarksSchema), async (req, res, next) => {
  const {
    submissionId,
    subjectCode,
    subjectName,
    course,
    semester,
    section,
    examType,
    maxMarks,
    marksData
  } = req.body;

  const teacherId = req.user.id;
  const teacherEmail = req.user.email;
  const teacherName = req.user.name;

  try {
    // IDOR Check 6: Verify subjectCode + section is assigned to this teacher
    const assignments = await query(
      "SELECT id FROM teacher_assignments WHERE (teacherId = ? OR teacherEmail = ?) AND subjectCode = ? AND section = ?",
      [teacherId, teacherEmail, subjectCode, section || 'A']
    );

    if (!assignments || assignments.length === 0) {
      return res.status(403).json({ error: `Forbidden: You are not assigned to subject ${subjectCode} section ${section || 'A'}` });
    }

    // Data Validation 10: Check duplicate roll numbers in upload batch
    const seenRolls = new Set();
    const rowErrors = [];

    for (let index = 0; index < marksData.length; index++) {
      const row = marksData[index];
      const rollNo = row.rollNo;
      const obt = Number(row.marks);

      if (seenRolls.has(rollNo)) {
        rowErrors.push({ row: index + 1, rollNo, error: 'Duplicate roll number in submission batch' });
      }
      seenRolls.add(rollNo);

      if (isNaN(obt) || obt < 0 || obt > maxMarks) {
        rowErrors.push({ row: index + 1, rollNo, error: `Marks value (${row.marks}) must be between 0 and maxMarks (${maxMarks})` });
      }
    }

    // Check student existence and course matching in DB
    const rollNos = Array.from(seenRolls);
    if (rollNos.length > 0) {
      const placeholders = rollNos.map(() => '?').join(',');
      const students = await query(
        `SELECT rollNo, course FROM users WHERE role = 'STUDENT' AND rollNo IN (${placeholders})`,
        rollNos
      );
      const studentMap = new Map(students.map(s => [s.rollNo, s]));

      for (let index = 0; index < marksData.length; index++) {
        const rollNo = marksData[index].rollNo;
        const student = studentMap.get(rollNo);

        if (!student) {
          rowErrors.push({ row: index + 1, rollNo, error: `Student with Roll No ${rollNo} does not exist` });
        } else if (student.course && student.course !== course) {
          rowErrors.push({ row: index + 1, rollNo, error: `Student belongs to ${student.course}, not target course ${course}` });
        }
      }
    }

    if (rowErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed for marks submission', rowErrors });
    }

    const subId = submissionId || `SUB-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    await withTransaction(async (conn) => {
      await conn.execute(
        `INSERT INTO mark_submissions (id, teacherId, subjectCode, subjectName, course, semester, section, examType, maxMarks, totalStudents, status, teacherEmail, teacherName, rejectionReason, submittedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UNDER_REVIEW', ?, ?, null, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE
           teacherId=VALUES(teacherId), subjectCode=VALUES(subjectCode), subjectName=VALUES(subjectName), course=VALUES(course),
           semester=VALUES(semester), section=VALUES(section), examType=VALUES(examType),
           maxMarks=VALUES(maxMarks), totalStudents=VALUES(totalStudents), status='UNDER_REVIEW',
           teacherEmail=VALUES(teacherEmail), teacherName=VALUES(teacherName), rejectionReason=null, submittedAt=CURRENT_TIMESTAMP`,
        [subId, teacherId, subjectCode, subjectName, course, semester, section, examType, maxMarks, marksData.length, teacherEmail, teacherName]
      );

      await conn.execute(`DELETE FROM marks WHERE submissionId = ?`, [subId]);

      const values = [];
      const placeholders = [];

      for (const row of marksData) {
        const studentRollNo = row.rollNo;
        const studentName = row.studentName || row.name || 'Student';
        const obt = Number(row.marks);
        const paperType = row.paperType || 'DSC';

        const { grade, gradePoint, creditPoint } = calculateGrade(obt, maxMarks);

        placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, 4, ?, ?, ?, ?, ?, ?, "UNDER_REVIEW", ?)');
        values.push(
          subId,
          studentRollNo,
          studentName,
          subjectCode,
          subjectName,
          course,
          paperType,
          semester,
          obt,
          maxMarks,
          obt,
          grade,
          gradePoint,
          creditPoint,
          teacherName
        );
      }

      const batchSql = `
        INSERT INTO marks (
          submissionId, rollNo, studentName, paperCode, paperName, course, paperType, sem, credit,
          prObt, prMax, totalObt, netGrade, gradePoint, creditPoint, status, uploadedBy
        ) VALUES ${placeholders.join(', ')}
      `;

      await conn.execute(batchSql, values);
    });

    invalidateAnalyticsCache();
    res.json({ message: 'Marks submitted successfully for admin review.', submissionId: subId });
  } catch (err) {
    next(err);
  }
});

// 5. Teacher Resubmit Marks (IDOR Check 7 + DB Transaction)
router.post('/marks/resubmit', validateBody(resubmitMarksSchema), async (req, res, next) => {
  const { submissionId, correctionReason, updatedMarks } = req.body;
  const teacherId = req.user.id;
  const teacherEmail = req.user.email;
  const teacherName = req.user.name;

  try {
    // IDOR Check 7: Verify submission belongs to this teacher
    const existing = await query(
      "SELECT id FROM mark_submissions WHERE id = ? AND (teacherId = ? OR teacherEmail = ?)",
      [submissionId, teacherId, teacherEmail]
    );

    if (!existing || existing.length === 0) {
      return res.status(403).json({ error: `Forbidden: You do not own submission ${submissionId}` });
    }

    await withTransaction(async (conn) => {
      if (updatedMarks && updatedMarks.length > 0) {
        for (const item of updatedMarks) {
          const paperCode = item.paperCode || item.subjectCode || '';
          const previousMarks = String(item.previousMarks || 0);
          const newMarks = String(item.marks);
          const obt = Number(item.marks);
          const max = Number(item.maxMarks || 40);

          await conn.execute(
            `INSERT INTO marks_audit (submissionId, rollNo, studentName, paperCode, fieldModified, previousValue, newValue, modifiedBy, reason)
             VALUES (?, ?, ?, ?, 'Marks', ?, ?, ?, ?)`,
            [submissionId, item.rollNo, item.studentName || item.name || 'Student', paperCode, previousMarks, newMarks, teacherName, correctionReason]
          );

          const { grade, gradePoint, creditPoint } = calculateGrade(obt, max);

          await conn.execute(
            "UPDATE marks SET prObt = ?, totalObt = ?, netGrade = ?, gradePoint = ?, creditPoint = ?, status = 'UNDER_REVIEW' WHERE submissionId = ? AND rollNo = ?",
            [obt, obt, grade, gradePoint, creditPoint, submissionId, item.rollNo]
          );
        }
      } else {
        await conn.execute(
          `INSERT INTO marks_audit (submissionId, rollNo, studentName, paperCode, fieldModified, previousValue, newValue, modifiedBy, reason)
           VALUES (?, 'BATCH', 'Batch Verification', 'BATCH', 'Status', 'CORRECTION_REQUIRED', 'UNDER_REVIEW', ?, ?)`,
          [submissionId, teacherName, correctionReason]
        );
        await conn.execute(
          "UPDATE marks SET status = 'UNDER_REVIEW' WHERE submissionId = ?",
          [submissionId]
        );
      }

      await conn.execute(
        "UPDATE mark_submissions SET status = 'UNDER_REVIEW', rejectionReason = null WHERE id = ?",
        [submissionId]
      );
    });

    invalidateAnalyticsCache();
    res.json({ message: 'Correction resubmitted to admin approval queue with audit trail recorded.' });
  } catch (err) {
    next(err);
  }
});

// 6. Get Marks for a Teacher's Submission
router.get('/submission/:submissionId/marks', async (req, res, next) => {
  const submissionId = req.params.submissionId;
  try {
    const existing = await query(
      "SELECT id FROM mark_submissions WHERE id = ? AND (teacherId = ? OR teacherEmail = ?)",
      [submissionId, req.user.id, req.user.email]
    );
    if (!existing || existing.length === 0) {
      return res.status(403).json({ error: 'Forbidden: You do not own this submission' });
    }
    const rows = await query(
      "SELECT id, rollNo, studentName, paperCode, paperName, prObt, prMax, thObt, thMax, totalObt, netGrade, gradePoint FROM marks WHERE submissionId = ? ORDER BY rollNo ASC",
      [submissionId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// 6. Re-Evaluations List & Update
router.get('/re-evaluations', async (req, res, next) => {
  try {
    const rows = await query("SELECT * FROM re_evaluations ORDER BY requestedAt DESC");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/re-evaluation/update', async (req, res, next) => {
  const { queryId, status } = req.body;
  try {
    await query("UPDATE re_evaluations SET status = ? WHERE id = ? OR queryId = ?", [status, queryId, queryId]);
    res.json({ message: 'Re-evaluation query status updated successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
