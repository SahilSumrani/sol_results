const mysql = require('mysql2/promise');

async function seed() {
  const conn = await mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '3VebAuMCyzCmMSi.root',
    password: 'slktDyj17tjak12o',
    database: 'sol_results',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  console.log('Inserting sample courses...');
  await conn.query(`
    INSERT INTO courses (code, name, department) VALUES 
    ('BTECH-CSE', 'B.Tech CSE', 'Computer Science & Engineering'),
    ('BCOM-H', 'B.Com (Hons)', 'Commerce')
    ON DUPLICATE KEY UPDATE name=VALUES(name);
  `);

  console.log('Inserting sample subjects...');
  await conn.query(`
    INSERT INTO subjects (code, name, course, semester, maxMarks, assessmentType) VALUES 
    ('CS301', 'Database Management Systems', 'B.Tech CSE', 3, 100, 'BOTH'),
    ('CS302', 'Data Structures & Algorithms', 'B.Tech CSE', 3, 100, 'BOTH'),
    ('CS303', 'Operating Systems', 'B.Tech CSE', 3, 100, 'THEORY')
    ON DUPLICATE KEY UPDATE name=VALUES(name);
  `);

  console.log('Assigning subjects to Asha Mam (id 2)...');
  await conn.query(`
    INSERT INTO teacher_assignments (teacherId, teacherEmail, teacherName, subjectCode, subjectName, course, semester, section) VALUES 
    (2, 'asha.teacher@sol.du.ac.in', 'Asha Mam', 'CS301', 'Database Management Systems', 'B.Tech CSE', 3, 'A'),
    (2, 'asha.teacher@sol.du.ac.in', 'Asha Mam', 'CS302', 'Data Structures & Algorithms', 'B.Tech CSE', 3, 'A');
  `);

  console.log('Adding 2 more student records for realistic testing...');
  await conn.query(`
    INSERT INTO users (name, email, password, role, rollNo, course, department, semester, section) VALUES 
    ('Rohan Verma', 'rohan.student@sol.du.ac.in', '$2a$10$qV4E3bJoxU8010o9JbFk6.8q4bknrKxK23L2vYQ6.K5K1WpT1eHGe', 'STUDENT', '2334522/189', 'B.Tech CSE', 'Computer Science & Engineering', 3, 'A'),
    ('Priya Sharma', 'priya.student@sol.du.ac.in', '$2a$10$qV4E3bJoxU8010o9JbFk6.8q4bknrKxK23L2vYQ6.K5K1WpT1eHGe', 'STUDENT', '2334522/190', 'B.Tech CSE', 'Computer Science & Engineering', 3, 'A')
    ON DUPLICATE KEY UPDATE name=VALUES(name);
  `);

  console.log('Seed completed successfully!');
  await conn.end();
}

seed().catch(console.error);
