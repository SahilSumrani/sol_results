const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pino = require('pino');
const pinoHttp = require('pino-http');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');
const adminRoutes = require('./src/routes/admin.routes');
const teacherRoutes = require('./src/routes/teacher.routes');
const studentRoutes = require('./src/routes/student.routes');
const errorHandler = require('./src/middleware/errorHandler');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();

// 1. Structured Logging
app.use(pinoHttp({ logger }));

// 2. CORS Restriction
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// 3. Rate Limiting
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: { error: 'Too many login attempts. Please try again later.' }
});

const genericApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: { error: 'Too many API requests from this IP.' }
});

app.use('/api/', genericApiLimiter);
app.use('/api/auth/login', authRateLimiter);

// 4. Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/marks', studentRoutes);

// 5. Centralized Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test' && (!process.env.VERCEL || process.env.NODE_ENV !== 'production')) {
  app.listen(PORT, () => {
    logger.info(`High-Performance ERP Server running on port ${PORT}`);
  });
}

module.exports = app;
