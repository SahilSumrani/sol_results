const request = require('supertest');
const { generateTokens } = require('../src/middleware/auth');

jest.mock('../src/db', () => ({
  query: jest.fn().mockImplementation(async (sql, params) => {
    if (sql.includes('COUNT(*) as cnt FROM marks')) {
      return [{ cnt: 10 }];
    }
    if (sql.includes('COUNT(*) as count FROM mark_submissions')) {
      return [{ count: 2 }];
    }
    if (sql.includes('SELECT netGrade as name')) {
      return [{ name: 'A', value: 5 }];
    }
    if (sql.includes('FROM mark_submissions ms')) {
      return [{ course: 'B.Tech CSE', checked: 10, published: 8 }];
    }
    if (sql.includes('GROUP BY teacherName, subjectName')) {
      return [{ name: 'Dr. Sharma', subject: 'AI Lab', checked: 10, verified: 8, pending: 2 }];
    }
    if (sql.includes('re_evaluations')) {
      if (sql.includes('INSERT')) {
        return { insertId: 1 };
      }
      return [{ queryId: 'REV-1', rollNo: '240101', studentName: 'Student 1', subjectName: 'AI Lab', status: 'PENDING' }];
    }
    if (sql.includes('FROM users WHERE role = \'STUDENT\'')) {
      return [{ id: 3, name: 'Student 1', rollNo: '240101', course: 'B.Tech CSE', semester: 'VIII', section: 'A' }];
    }
    if (sql.includes('teacher_assignments')) {
      return { insertId: 1 };
    }
    if (sql.includes('subjects') || sql.includes('courses')) {
      return { insertId: 1 };
    }
    return [];
  }),
  withTransaction: jest.fn().mockImplementation(async (cb) => {
    return cb({
      execute: jest.fn().mockResolvedValue([])
    });
  }),
  pool: {
    end: jest.fn().mockResolvedValue()
  }
}));

const app = require('../server');

describe('Full Backend API Operations & Validation Tests', () => {
  const adminToken = generateTokens({ id: 1, email: 'admin@sol.du.ac.in', name: 'Admin', role: 'ADMIN' }).accessToken;
  const teacherToken = generateTokens({ id: 2, email: 'teacher@sol.du.ac.in', name: 'Dr. Sharma', role: 'TEACHER' }).accessToken;
  const studentToken = generateTokens({ id: 3, email: 'student1@sol.du.ac.in', name: 'Student 1', role: 'STUDENT', rollNo: '240101' }).accessToken;

  test('Admin assigns subject with string teacherId successfully (coercion verified)', async () => {
    const res = await request(app)
      .post('/api/admin/assign-subject')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        teacherId: '2', // string from UI form
        teacherEmail: 'teacher@sol.du.ac.in',
        teacherName: 'Dr. Sharma',
        subjectCode: 'CS401L',
        subjectName: 'Artificial Intelligence Lab',
        course: 'B.Tech CSE',
        semester: 'VIII',
        section: 'A'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('Successfully assigned');
  });

  test('Admin fetches analytics safely without SQL schema errors', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.publishedCount).toBeDefined();
    expect(res.body.courseWiseData).toBeDefined();
  });

  test('Student can submit a re-evaluation query', async () => {
    const res = await request(app)
      .post('/api/marks/re-evaluation')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        subjectName: 'Artificial Intelligence Lab',
        currentGrade: 'B+',
        requestedReview: 'Please re-verify lab file evaluation'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.queryId).toBeDefined();
  });

  test('Student can view own re-evaluations', async () => {
    const res = await request(app)
      .get('/api/marks/re-evaluations')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
