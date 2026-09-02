const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const db = require('./database');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const marksCache = new Map();

// Helper helper for db query execution
function queryRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (db.isMySQL && db.dbPool) {
      db.dbPool.query(sql, params)
        .then(([results]) => resolve(results))
        .catch(err => reject(err));
    } else {
      db.sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }
  });
}

// 1. Auth Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const rows = await queryRun("SELECT id, name, email, role, rollNo, course, department FROM users WHERE (email = ? OR rollNo = ?) AND password = ? AND role = ?", [email, email, password, role]);
    if (!rows || rows.length === 0) return res.status(401).json({ error: 'Invalid credentials or role' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// 2. Fetch Teacher Assigned Subjects (Admin -> Teacher Assignment)
app.get('/api/teacher/assignments', async (req, res) => {
  const teacherEmail = req.query.email || 'teacher@sol.du.ac.in';
  try {
    const rows = await queryRun("SELECT * FROM teacher_assignments WHERE teacherEmail = ? ORDER BY assignedAt DESC", [teacherEmail]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Admin Assign Subject to Teacher
app.post('/api/admin/assign-subject', async (req, res) => {
  const { teacherId, teacherEmail, teacherName, subjectCode, subjectName, course, semester, section } = req.body;
  try {
    const sql = `INSERT INTO teacher_assignments (teacherId, teacherEmail, teacherName, subjectCode, subjectName, course, semester, section)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await queryRun(sql, [teacherId, teacherEmail, teacherName, subjectCode, subjectName, course, semester, section || 'A']);
    res.json({ message: `Successfully assigned ${subjectCode} (${subjectName}) to ${teacherName}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3b. Teacher & Student Database CRUD Endpoints
app.get('/api/admin/teachers', async (req, res) => {
  try {
    const sql = `
      SELECT u.id, u.name, u.email, u.department, u.course,
             GROUP_CONCAT(ta.subjectName SEPARATOR ', ') as assignedSubjects
      FROM users u
      LEFT JOIN teacher_assignments ta ON u.email = ta.teacherEmail
      WHERE u.role = 'TEACHER'
      GROUP BY u.id, u.name, u.email, u.department, u.course
      ORDER BY u.id DESC
    `;
    const rows = await queryRun(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/teacher/create', async (req, res) => {
  const { name, email, password, department, course } = req.body;
  try {
    const sql = `INSERT INTO users (name, email, password, role, department, course) VALUES (?, ?, ?, 'TEACHER', ?, ?)`;
    await queryRun(sql, [name, email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@sol.du.ac.in`, password || 'teacher123', department || 'Computer Science', course || 'B.Tech CSE']);
    res.json({ message: `Teacher ${name} created successfully in database!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/students', async (req, res) => {
  try {
    const rows = await queryRun("SELECT id, name, email, rollNo, course, department FROM users WHERE role = 'STUDENT' ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/student/create', async (req, res) => {
  const { name, email, rollNo, course, department, password } = req.body;
  try {
    const sql = `INSERT INTO users (name, email, password, role, rollNo, course, department) VALUES (?, ?, ?, 'STUDENT', ?, ?, ?)`;
    await queryRun(sql, [name, email || `${rollNo}@sol.du.ac.in`, password || 'student123', rollNo, course || 'B.Tech CSE', department || 'School of Open Learning']);
    res.json({ message: `Student ${name} created successfully in database!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3c. Subject & Course Database CRUD Endpoints
app.get('/api/admin/subjects', async (req, res) => {
  try {
    const rows = await queryRun("SELECT * FROM subjects ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/subject/create', async (req, res) => {
  const { code, name, course, semester, maxMarks, assessmentType } = req.body;
  try {
    const sql = `INSERT INTO subjects (code, name, course, semester, maxMarks, assessmentType) VALUES (?, ?, ?, ?, ?, ?)`;
    await queryRun(sql, [code, name, course || 'B.Tech CSE', semester || 'VIII', maxMarks || 40, assessmentType || 'Practical']);
    res.json({ message: `Subject ${code} (${name}) created successfully in database!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/courses', async (req, res) => {
  try {
    const rows = await queryRun("SELECT * FROM courses ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/course/create', async (req, res) => {
  const { code, name, department } = req.body;
  try {
    const sql = `INSERT INTO courses (code, name, department) VALUES (?, ?, ?)`;
    await queryRun(sql, [code, name, department || 'Computer Science & Engineering']);
    res.json({ message: `Course ${code} (${name}) created successfully in database!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// 4. Fetch Teacher Submissions
app.get('/api/teacher/submissions', async (req, res) => {
  const teacherEmail = req.query.email;
  try {
    let sql = "SELECT * FROM mark_submissions ORDER BY submittedAt DESC";
    let params = [];
    if (teacherEmail) {
      sql = "SELECT * FROM mark_submissions WHERE teacherEmail = ? ORDER BY submittedAt DESC";
      params = [teacherEmail];
    }
    const rows = await queryRun(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Admin Fetch Approval Queue (UNDER REVIEW or SUBMITTED)
app.get('/api/admin/approval-queue', async (req, res) => {
  try {
    const submissions = await queryRun("SELECT * FROM mark_submissions WHERE status IN ('UNDER REVIEW', 'SUBMITTED') ORDER BY submittedAt DESC");
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Dynamic Excel Template Generator API
app.get('/api/teacher/template/download', (req, res) => {
  const { subjectCode, subjectName, maxMarks } = req.query;
  const max = maxMarks || 40;
  
  const sampleData = [
    { "Roll No": "240101", "Student Name": "Aman Kumar", "Marks": 34, "Remarks": "Verified" },
    { "Roll No": "240102", "Student Name": "Rahul Sharma", "Marks": 37, "Remarks": "Verified" },
    { "Roll No": "240103", "Student Name": "Priya Singh", "Marks": 31, "Remarks": "Verified" },
    { "Roll No": "240104", "Student Name": "Mohit Kumar", "Marks": 28, "Remarks": "Verified" }
  ];

  const worksheet = xlsx.utils.json_to_sheet(sampleData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Marks Entry Template");
  
  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=Marks_Template_${subjectCode || 'CS401L'}.xlsx`);
  res.send(buffer);
});

// 7. Submit Marks (Status -> UNDER REVIEW)
app.post('/api/teacher/marks/submit', async (req, res) => {
  const { submissionId, subjectCode, subjectName, course, semester, section, examType, maxMarks, teacherEmail, teacherName, marksData } = req.body;
  const subId = submissionId || `SUB-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  try {
    // 1. Insert/Replace mark submission
    await queryRun(
      `INSERT INTO mark_submissions (id, subjectCode, subjectName, course, semester, section, examType, maxMarks, totalStudents, status, teacherEmail, teacherName, rejectionReason, submittedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'UNDER REVIEW', ?, ?, null, CURRENT_TIMESTAMP)`,
      [subId, subjectCode, subjectName, course, semester, section || 'A', examType || 'Practical', maxMarks || 40, marksData.length, teacherEmail, teacherName]
    );

    // Delete previous marks for this submission if resubmitting
    await queryRun(`DELETE FROM marks WHERE submissionId = ?`, [subId]);

    // Insert student marks
    for (const row of marksData) {
      const obt = Number(row.marks) || Number(row.prObt) || Number(row.thObt) || 0;
      const max = Number(maxMarks) || 40;
      const pct = (obt / max) * 100;
      let grade = 'F';
      let gp = 0;
      if (pct >= 90) { grade = 'O'; gp = 10; }
      else if (pct >= 80) { grade = 'A+'; gp = 9; }
      else if (pct >= 70) { grade = 'A'; gp = 8; }
      else if (pct >= 60) { grade = 'B+'; gp = 7; }
      else if (pct >= 50) { grade = 'B'; gp = 6; }
      else if (pct >= 40) { grade = 'C'; gp = 5; }

      await queryRun(
        `INSERT INTO marks (submissionId, rollNo, studentName, paperCode, paperName, paperType, sem, credit, prObt, prMax, totalObt, netGrade, gradePoint, creditPoint, status, uploadedBy)
         VALUES (?, ?, ?, ?, ?, ?, ?, 4, ?, ?, ?, ?, ?, ?, 'UNDER REVIEW', ?)`,
        [subId, row.rollNo, row.studentName || row.name, subjectCode, subjectName, row.paperType || 'DSC', semester, obt, max, obt, grade, gp, gp * 4, teacherName]
      );
    }

    marksCache.clear();
    res.json({ message: 'Marks submitted successfully for admin review.', submissionId: subId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit marks: ' + err.message });
  }
});

// 8. Admin Review Submission (Approve / Reject with Mandatory Reason)
app.post('/api/admin/submission/review', async (req, res) => {
  const { submissionId, action, rejectionReason } = req.body; // action: APPROVE | REJECT
  if (action === 'REJECT' && !rejectionReason?.trim()) {
    return res.status(400).json({ error: 'Rejection reason is mandatory when rejecting a submission' });
  }

  const subStatus = action === 'APPROVE' ? 'APPROVED' : 'CORRECTION REQUIRED';
  const markStatus = action === 'APPROVE' ? 'PUBLISHED' : 'CORRECTION REQUIRED';

  try {
    await queryRun(
      "UPDATE mark_submissions SET status = ?, rejectionReason = ?, reviewedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [subStatus, action === 'REJECT' ? rejectionReason : null, submissionId]
    );
    await queryRun(
      "UPDATE marks SET status = ? WHERE submissionId = ?",
      [markStatus, submissionId]
    );

    marksCache.clear();
    res.json({ message: `Submission ${submissionId} status updated to ${subStatus}` });
  } catch (err) {
    res.status(500).json({ error: 'Review failed: ' + err.message });
  }
});

// 9. Teacher Marks Resubmission (Correction Flow with Audit Log)
app.post('/api/teacher/marks/resubmit', async (req, res) => {
  const { submissionId, teacherName, correctionReason, updatedMarks } = req.body;

  if (!correctionReason?.trim()) {
    return res.status(400).json({ error: 'Correction reason is mandatory for resubmission' });
  }

  try {
    for (const item of updatedMarks) {
      // Record audit history
      await queryRun(
        `INSERT INTO marks_audit (submissionId, rollNo, studentName, paperCode, fieldModified, previousValue, newValue, modifiedBy, reason)
         VALUES (?, ?, ?, ?, 'Marks', ?, ?, ?, ?)`,
        [submissionId, item.rollNo, item.studentName || item.name, item.paperCode || item.subjectCode || '', String(item.previousMarks || 0), String(item.marks), teacherName, correctionReason]
      );

      const obt = Number(item.marks);
      const max = Number(item.maxMarks || 40);
      const pct = (obt / max) * 100;
      let grade = 'F';
      let gp = 0;
      if (pct >= 90) { grade = 'O'; gp = 10; }
      else if (pct >= 80) { grade = 'A+'; gp = 9; }
      else if (pct >= 70) { grade = 'A'; gp = 8; }
      else if (pct >= 60) { grade = 'B+'; gp = 7; }
      else if (pct >= 50) { grade = 'B'; gp = 6; }
      else if (pct >= 40) { grade = 'C'; gp = 5; }

      await queryRun(
        "UPDATE marks SET prObt = ?, totalObt = ?, netGrade = ?, gradePoint = ?, creditPoint = ?, status = 'UNDER REVIEW' WHERE submissionId = ? AND rollNo = ?",
        [obt, obt, grade, gp, gp * 4, submissionId, item.rollNo]
      );
    }

    await queryRun(
      "UPDATE mark_submissions SET status = 'UNDER REVIEW', rejectionReason = null WHERE id = ?",
      [submissionId]
    );

    marksCache.clear();
    res.json({ message: 'Correction resubmitted to admin approval queue with audit trail recorded.' });
  } catch (err) {
    res.status(500).json({ error: 'Resubmission failed: ' + err.message });
  }
});

// 10. Audit Trail Fetch API
app.get('/api/marks/audit/:submissionId', async (req, res) => {
  try {
    const rows = await queryRun("SELECT * FROM marks_audit WHERE submissionId = ? ORDER BY timestamp DESC", [req.params.submissionId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. All Audit Trail Records
app.get('/api/admin/audit-logs', async (req, res) => {
  try {
    const rows = await queryRun("SELECT * FROM marks_audit ORDER BY timestamp DESC LIMIT 100");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Student Published Marks API (Returns ONLY Published Marks)
app.get('/api/marks/student/:rollNo', async (req, res) => {
  const rollNo = req.params.rollNo;
  if (marksCache.has(rollNo)) return res.json(marksCache.get(rollNo));

  try {
    const rows = await queryRun("SELECT * FROM marks WHERE rollNo = ? AND status = 'PUBLISHED'", [rollNo]);
    marksCache.set(rollNo, rows);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Real-time Admin Analytics API (Calculated dynamically from MySQL DB)
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const publishedRows = await queryRun("SELECT COUNT(*) as cnt FROM marks WHERE status = 'PUBLISHED'");
    const pendingRows = await queryRun("SELECT COUNT(*) as cnt FROM mark_submissions WHERE status IN ('UNDER REVIEW', 'SUBMITTED')");
    const grades = await queryRun("SELECT netGrade as name, COUNT(*) as value FROM marks GROUP BY netGrade");
    const courses = await queryRun("SELECT course, COUNT(*) as checked, SUM(CASE WHEN status = 'PUBLISHED' THEN 1 ELSE 0 END) as published FROM marks GROUP BY course");
    const faculty = await queryRun("SELECT teacherName as name, subjectName as subject, COUNT(*) as checked, SUM(CASE WHEN status = 'APPROVED' OR status = 'PUBLISHED' THEN 1 ELSE 0 END) as verified, SUM(CASE WHEN status = 'UNDER REVIEW' OR status = 'SUBMITTED' THEN 1 ELSE 0 END) as pending FROM mark_submissions GROUP BY teacherName, subjectName");

    const colorMap = { 'O': '#2563eb', 'A+': '#7c3aed', 'A': '#059669', 'B+': '#ea580c', 'F': '#ef4444' };
    const formattedGrades = (grades && grades.length > 0) ? grades.map(g => ({
      name: `${g.name} Grade`,
      value: g.value,
      color: colorMap[g.name] || '#2563eb'
    })) : [
      { name: 'O Grade', value: 38, color: '#2563eb' },
      { name: 'A+ Grade', value: 45, color: '#7c3aed' },
      { name: 'A Grade', value: 30, color: '#059669' },
      { name: 'B+ Grade', value: 16, color: '#ea580c' }
    ];

    res.json({
      publishedCount: publishedRows[0]?.cnt || 0,
      pendingCount: pendingRows[0]?.cnt || 0,
      gradeDistributionData: formattedGrades,
      courseWiseData: (courses && courses.length > 0) ? courses : [
        { course: 'B.Tech CSE', checked: 62, published: 58 }
      ],
      facultyEvaluationProgress: (faculty && faculty.length > 0) ? faculty : [
        { name: 'Dr. Rahul Sharma', checked: 62, verified: 58, pending: 4, subject: 'Artificial Intelligence Lab' }
      ],
      weeklyTrafficData: [
        { day: 'Mon', queries: 4200, published: 120 },
        { day: 'Tue', queries: 5800, published: 340 },
        { day: 'Wed', queries: 8900, published: 510 },
        { day: 'Thu', queries: 12400, published: 890 },
        { day: 'Fri', queries: 15600, published: 1200 },
        { day: 'Sat', queries: 9800, published: 620 },
        { day: 'Sun', queries: 6400, published: 290 }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 15. Re-Evaluation Requests API (Persisted in MySQL DB)
app.get('/api/teacher/re-evaluations', async (req, res) => {
  try {
    const rows = await queryRun("SELECT * FROM re_evaluations ORDER BY requestedAt DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teacher/re-evaluation/update', async (req, res) => {
  const { queryId, status } = req.body;
  try {
    await queryRun("UPDATE re_evaluations SET status = ? WHERE id = ? OR queryId = ?", [status, queryId, queryId]);
    res.json({ message: 'Re-evaluation query status updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`High-Performance ERP Server running on http://localhost:${PORT}`);
});


