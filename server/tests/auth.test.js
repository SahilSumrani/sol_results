const request = require('supertest');
const { generateTokens } = require('../src/middleware/auth');

jest.mock('../src/db', () => ({
  query: jest.fn().mockImplementation(async (sql) => {
    if (sql.includes('COUNT(*) as count FROM users')) {
      return [{ count: 1 }];
    }
    if (sql.includes('FROM users u')) {
      return [{ id: 2, name: 'Dr. Sharma', email: 'teacher@sol.du.ac.in', department: 'Computer Science', course: 'B.Tech CSE', assignedSubjects: 'AI Lab' }];
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

describe('Comprehensive Authentication & Authorization RBAC Integration Tests', () => {
  const adminToken = generateTokens({ id: 1, email: 'admin@sol.du.ac.in', name: 'Admin', role: 'ADMIN' }).accessToken;
  const teacherToken = generateTokens({ id: 2, email: 'teacher@sol.du.ac.in', name: 'Dr. Sharma', role: 'TEACHER' }).accessToken;
  const studentToken = generateTokens({ id: 3, email: 'student1@sol.du.ac.in', name: 'Student 1', role: 'STUDENT', rollNo: '240101' }).accessToken;

  describe('RBAC Route Protection', () => {
    test('Student attempting to access /api/admin/teachers returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/teachers')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.statusCode).toBe(403);
    });

    test('Teacher attempting to access /api/admin/teachers returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/teachers')
        .set('Authorization', `Bearer ${teacherToken}`);
      expect(res.statusCode).toBe(403);
    });

    test('Student attempting to access /api/teacher/assignments returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/teacher/assignments')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.statusCode).toBe(403);
    });

    test('Admin accessing /api/admin/teachers returns 200 OK', async () => {
      const res = await request(app)
        .get('/api/admin/teachers')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('IDOR & Roll Number Isolation Tests', () => {
    test('Student 1 accessing Student 2 marks returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/marks/student/240102')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.statusCode).toBe(403);
    });

    test('Student token missing rollNo accessing marks returns 403 Forbidden', async () => {
      const invalidStudentToken = generateTokens({ id: 5, email: 'bad@sol.du.ac.in', role: 'STUDENT' }).accessToken;
      const res = await request(app)
        .get('/api/marks/student/240101')
        .set('Authorization', `Bearer ${invalidStudentToken}`);
      expect(res.statusCode).toBe(403);
    });
  });
});
