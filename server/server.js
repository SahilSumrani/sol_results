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

// 1. Auth Endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  db.get("SELECT id, name, email, role, rollNo, course, department FROM users WHERE email = ? AND password = ? AND role = ?", [email, password, role], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials or role' });
    res.json(user);
  });
});

// 2. Fetch Teacher Submissions
app.get('/api/teacher/submissions', (req, res) => {
  const teacherEmail = req.query.email || 'teacher@sol.du.ac.in';
  db.all("SELECT * FROM mark_submissions WHERE teacherEmail = ? ORDER BY submittedAt DESC", [teacherEmail], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// 3. Dynamic Excel Template Generator API
app.get('/api/teacher/template/download', (req, res) => {
  const { subjectCode, subjectName, course, semester } = req.query;
  
  const sampleData = [
    { "Roll No": "240101", "Student Name": "Aman Kumar", "Theory Marks (Max 75)": 58, "Tutorial Marks (Max 25)": 22, "Practical Marks (Max 25)": 0, "Remarks": "Verified" },
    { "Roll No": "240102", "Student Name": "Rahul Sharma", "Theory Marks (Max 75)": 62, "Tutorial Marks (Max 25)": 24, "Practical Marks (Max 25)": 0, "Remarks": "Verified" },
    { "Roll No": "240103", "Student Name": "Priya Singh", "Theory Marks (Max 75)": 52, "Tutorial Marks (Max 25)": 18, "Practical Marks (Max 25)": 0, "Remarks": "Verified" },
    { "Roll No": "240104", "Student Name": "Mohit Kumar", "Theory Marks (Max 75)": 66, "Tutorial Marks (Max 25)": 23, "Practical Marks (Max 25)": 0, "Remarks": "Verified" }
  ];

  const worksheet = xlsx.utils.json_to_sheet(sampleData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Marks Entry Template");
  
  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=Marks_Template_${subjectCode || 'CS401'}.xlsx`);
  res.send(buffer);
});

// 4. Submit Marks & Save Audit Record
app.post('/api/teacher/marks/submit', (req, res) => {
  const { submissionId, subjectCode, subjectName, course, semester, examType, teacherEmail, teacherName, marksData } = req.body;
  const subId = submissionId || `SUB-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const subStmt = db.prepare(`
      INSERT OR REPLACE INTO mark_submissions (id, subjectCode, subjectName, course, semester, examType, totalStudents, status, teacherEmail, teacherName, rejectionReason, submittedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', ?, ?, null, CURRENT_TIMESTAMP)
    `);
    subStmt.run(subId, subjectCode, subjectName, course, semester, examType, marksData.length, teacherEmail, teacherName);
    subStmt.finalize();

    const markStmt = db.prepare(`
      INSERT INTO marks (submissionId, rollNo, studentName, paperCode, paperName, paperType, sem, credit, thObt, thMax, tuObt, tuMax, prObt, prMax, netGrade, gradePoint, creditPoint, status, uploadedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', ?)
    `);

    marksData.forEach((row) => {
      markStmt.run(
        subId,
        row.rollNo,
        row.name,
        subjectCode,
        subjectName,
        row.type || 'DSC',
        semester,
        row.credit || 4,
        row.thObt || 58,
        row.thMax || 75,
        row.tuObt || 22,
        row.tuMax || 25,
        row.prObt || 0,
        row.prMax || 0,
        row.netGrade || 'A',
        row.gradePoint || 8,
        row.creditPoint || 32,
        teacherName
      );
    });
    markStmt.finalize();

    db.run("COMMIT", (err) => {
      if (err) return res.status(500).json({ error: 'Failed to submit marks' });
      marksCache.clear();
      res.json({ message: 'Marks submitted successfully for admin review.', submissionId: subId });
    });
  });
});

// 5. Admin Approve / Reject Endpoint with Rejection Reason
app.post('/api/admin/submission/review', (req, res) => {
  const { submissionId, action, rejectionReason } = req.body; // action: APPROVE | REJECT
  const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    db.run("UPDATE mark_submissions SET status = ?, rejectionReason = ?, reviewedAt = CURRENT_TIMESTAMP WHERE id = ?", [newStatus, rejectionReason || null, submissionId]);
    db.run("UPDATE marks SET status = ? WHERE submissionId = ?", [newStatus === 'APPROVED' ? 'PUBLISHED' : 'REJECTED', submissionId]);

    db.run("COMMIT", (err) => {
      if (err) return res.status(500).json({ error: 'Review failed' });
      marksCache.clear();
      res.json({ message: `Submission ${submissionId} status updated to ${newStatus}` });
    });
  });
});

// 6. Resubmit Correction with Audit Trail Recording
app.post('/api/teacher/marks/resubmit', (req, res) => {
  const { submissionId, teacherName, correctionReason, updatedMarks } = req.body;

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const auditStmt = db.prepare(`
      INSERT INTO marks_audit (submissionId, rollNo, studentName, paperCode, fieldModified, previousValue, newValue, modifiedBy, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    updatedMarks.forEach(item => {
      auditStmt.run(submissionId, item.rollNo, item.name, item.paperCode, 'thObt/tuObt', item.previousValue, item.newValue, teacherName, correctionReason);
      db.run("UPDATE marks SET thObt = ?, tuObt = ?, netGrade = ?, status = 'SUBMITTED' WHERE submissionId = ? AND rollNo = ?", [item.thObt, item.tuObt, item.netGrade, submissionId, item.rollNo]);
    });
    auditStmt.finalize();

    db.run("UPDATE mark_submissions SET status = 'SUBMITTED', rejectionReason = null WHERE id = ?", [submissionId]);

    db.run("COMMIT", (err) => {
      if (err) return res.status(500).json({ error: 'Resubmission failed' });
      marksCache.clear();
      res.json({ message: 'Correction resubmitted to admin with audit trail recorded.' });
    });
  });
});

// 7. Audit Trail Fetch API
app.get('/api/marks/audit/:submissionId', (req, res) => {
  db.all("SELECT * FROM marks_audit WHERE submissionId = ? ORDER BY timestamp DESC", [req.params.submissionId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// 8. Student Published Marks API
app.get('/api/marks/student/:rollNo', (req, res) => {
  const rollNo = req.params.rollNo;
  if (marksCache.has(rollNo)) return res.json(marksCache.get(rollNo));

  db.all("SELECT * FROM marks WHERE rollNo = ? AND status = 'PUBLISHED'", [rollNo], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    marksCache.set(rollNo, rows);
    res.json(rows);
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`High-Performance ERP Server running on http://localhost:${PORT}`);
});
