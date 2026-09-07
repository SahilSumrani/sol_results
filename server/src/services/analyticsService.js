const { query } = require('../db');

let redisClient = null;
if (process.env.REDIS_URL) {
  try {
    const Redis = require('ioredis');
    redisClient = new Redis(process.env.REDIS_URL, { lazyConnect: true });
    redisClient.connect().catch(err => console.warn('Redis connection failed:', err.message));
  } catch (err) {
    console.warn('ioredis not available or configuration failed.');
  }
}

async function getAnalytics() {
  const CACHE_KEY = 'admin_analytics';
  if (redisClient) {
    try {
      const cached = await redisClient.get(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      // Fall through to DB query on cache error
    }
  }

  const publishedRows = await query("SELECT COUNT(*) as cnt FROM marks WHERE status = 'PUBLISHED'");
  const pendingRows = await query("SELECT COUNT(*) as count FROM mark_submissions WHERE status IN ('UNDER_REVIEW', 'DRAFT')");
  const grades = await query("SELECT netGrade as name, COUNT(*) as value FROM marks GROUP BY netGrade");
  const courses = await query(`
    SELECT ms.course, 
           COUNT(m.id) as checked, 
           SUM(CASE WHEN m.status = 'PUBLISHED' THEN 1 ELSE 0 END) as published 
    FROM mark_submissions ms 
    LEFT JOIN marks m ON ms.id = m.submissionId 
    GROUP BY ms.course
  `);
  const faculty = await query("SELECT teacherName as name, subjectName as subject, COUNT(*) as checked, SUM(CASE WHEN status = 'PUBLISHED' THEN 1 ELSE 0 END) as verified, SUM(CASE WHEN status = 'UNDER_REVIEW' THEN 1 ELSE 0 END) as pending FROM mark_submissions GROUP BY teacherName, subjectName");

  // Real 7-day traffic query from mark_submissions
  const weeklyTraffic = await query(`
    SELECT DATE_FORMAT(submittedAt, '%a') as day,
           COUNT(*) as submissionsCount,
           SUM(CASE WHEN status = 'PUBLISHED' THEN totalStudents ELSE 0 END) as published
    FROM mark_submissions
    WHERE submittedAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DATE(submittedAt), DATE_FORMAT(submittedAt, '%a')
    ORDER BY DATE(submittedAt) ASC
  `);

  const colorMap = { 'O': '#2563eb', 'A+': '#7c3aed', 'A': '#059669', 'B+': '#ea580c', 'F': '#ef4444' };
  const formattedGrades = (grades && grades.length > 0) ? grades.map(g => ({
    name: `${g.name} Grade`,
    value: Number(g.value),
    color: colorMap[g.name] || '#2563eb'
  })) : [];

  const result = {
    publishedCount: Number(publishedRows[0]?.cnt || 0),
    pendingCount: Number(pendingRows[0]?.cnt || 0),
    gradeDistributionData: formattedGrades,
    courseWiseData: courses,
    facultyEvaluationProgress: faculty,
    weeklyTrafficData: weeklyTraffic.map(t => ({
      day: t.day,
      queries: Number(t.submissionsCount),
      published: Number(t.published || 0)
    }))
  };

  if (redisClient) {
    try {
      await redisClient.set(CACHE_KEY, JSON.stringify(result), 'EX', 60);
    } catch (err) {
      // ignore cache write error
    }
  }

  return result;
}

async function invalidateAnalyticsCache() {
  if (redisClient) {
    try {
      await redisClient.del('admin_analytics');
    } catch (err) {
      // ignore
    }
  }
}

module.exports = { getAnalytics, invalidateAnalyticsCache };
