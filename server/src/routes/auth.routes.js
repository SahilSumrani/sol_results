const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { generateTokens, authenticateToken, JWT_REFRESH_SECRET } = require('../middleware/auth');
const { validateBody, loginSchema } = require('../middleware/validate');

const router = express.Router();

router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  const { email, password, role } = req.body;
  try {
    const rows = await query(
      "SELECT id, name, email, password, role, rollNo, course, department, semester, section, fatherName, motherName, enrollmentNo FROM users WHERE (email = ? OR rollNo = ?) AND role = ?",
      [email, email, role]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials or role' });
    }

    const user = rows[0];
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials or role' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      rollNo: user.rollNo,
      course: user.course,
      department: user.department,
      semester: user.semester,
      section: user.section,
      fatherName: user.fatherName,
      motherName: user.motherName,
      enrollmentNo: user.enrollmentNo
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      accessToken,
      user: payload
    });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    try {
      // Re-fetch latest user profile attributes from DB
      const rows = await query(
        "SELECT id, name, email, role, rollNo, course, department, semester, section, fatherName, motherName, enrollmentNo FROM users WHERE id = ?",
        [user.id]
      );
      const dbUser = rows && rows.length > 0 ? rows[0] : user;

      const payload = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        rollNo: dbUser.rollNo,
        course: dbUser.course,
        department: dbUser.department,
        semester: dbUser.semester,
        section: dbUser.section,
        fatherName: dbUser.fatherName,
        motherName: dbUser.motherName,
        enrollmentNo: dbUser.enrollmentNo
      };

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({ accessToken, user: payload });
    } catch (dbErr) {
      next(dbErr);
    }
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
