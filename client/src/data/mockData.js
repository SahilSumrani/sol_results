// Initial Mock Database for Portal

export const INITIAL_USERS = [
  { id: 'u1', name: 'Admin Controller', email: 'admin@portal.com', role: 'ADMIN', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' },
  { id: 'u2', name: 'Dr. Suresh Verma', email: 'teacher@portal.com', role: 'TEACHER', employeeId: 'EMP-9021', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
  { id: 'u3', name: 'Rahul Sharma', email: 'student@portal.com', role: 'STUDENT', rollNo: '101', course: 'B.Tech', year: '4th Year', semester: '8th Sem', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces' },
  { id: 'u4', name: 'Aman Deep Gupta', email: 'aman@portal.com', role: 'STUDENT', rollNo: '102', course: 'B.Tech', year: '4th Year', semester: '8th Sem', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces' },
  { id: 'u5', name: 'Priya Patel', email: 'priya@portal.com', role: 'STUDENT', rollNo: '103', course: 'B.Tech', year: '4th Year', semester: '8th Sem', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
  { id: 'u6', name: 'Prof. Anjali Mehta', email: 'anjali@portal.com', role: 'TEACHER', employeeId: 'EMP-9088', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces' }
];

export const INITIAL_COURSES = [
  { id: 'c1', name: 'B.Tech', code: 'BT', years: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
  { id: 'c2', name: 'M.Tech', code: 'MT', years: ['1st Year', '2nd Year'] },
  { id: 'c3', name: 'BCA', code: 'BCA', years: ['1st Year', '2nd Year', '3rd Year'] }
];

export const INITIAL_SUBJECTS = [
  { id: 's1', name: 'Artificial Intelligence & ML', code: 'CS-801', course: 'B.Tech', year: '4th Year', semester: '8th Sem', teacherId: 'u2', maxInternal: 20, maxMidterm: 30, maxFinal: 50 },
  { id: 's2', name: 'Cloud Computing & DevOps', code: 'CS-802', course: 'B.Tech', year: '4th Year', semester: '8th Sem', teacherId: 'u2', maxInternal: 20, maxMidterm: 30, maxFinal: 50 },
  { id: 's3', name: 'Web Technologies & Frameworks', code: 'CS-803', course: 'B.Tech', year: '4th Year', semester: '8th Sem', teacherId: 'u6', maxInternal: 20, maxMidterm: 30, maxFinal: 50 },
  { id: 's4', name: 'Cyber Security & Forensics', code: 'CS-804', course: 'B.Tech', year: '4th Year', semester: '8th Sem', teacherId: 'u6', maxInternal: 20, maxMidterm: 30, maxFinal: 50 }
];

export const INITIAL_STUDENTS_LIST = [
  { id: 'st1', userId: 'u3', rollNo: '101', name: 'Rahul Sharma', course: 'B.Tech', year: '4th Year', semester: '8th Sem', section: 'A' },
  { id: 'st2', userId: 'u4', rollNo: '102', name: 'Aman Deep Gupta', course: 'B.Tech', year: '4th Year', semester: '8th Sem', section: 'A' },
  { id: 'st3', userId: 'u5', rollNo: '103', name: 'Priya Patel', course: 'B.Tech', year: '4th Year', semester: '8th Sem', section: 'A' },
  { id: 'st4', userId: 'u7', rollNo: '104', name: 'Sneha Roy', course: 'B.Tech', year: '4th Year', semester: '8th Sem', section: 'B' },
  { id: 'st5', userId: 'u8', rollNo: '105', name: 'Vikas Kumar', course: 'B.Tech', year: '4th Year', semester: '8th Sem', section: 'B' }
];

export const INITIAL_MARKS = [
  { id: 'm1', studentId: 'st1', rollNo: '101', studentName: 'Rahul Sharma', subjectId: 's1', subjectCode: 'CS-801', subjectName: 'Artificial Intelligence & ML', internal: 18, midterm: 26, final: 45, total: 89, status: 'PUBLISHED', teacherId: 'u2', updatedAt: '2026-08-25' },
  { id: 'm2', studentId: 'st1', rollNo: '101', studentName: 'Rahul Sharma', subjectId: 's2', subjectCode: 'CS-802', subjectName: 'Cloud Computing & DevOps', internal: 17, midterm: 24, final: 42, total: 83, status: 'PUBLISHED', teacherId: 'u2', updatedAt: '2026-08-26' },
  { id: 'm3', studentId: 'st1', rollNo: '101', studentName: 'Rahul Sharma', subjectId: 's3', subjectCode: 'CS-803', subjectName: 'Web Technologies & Frameworks', internal: 19, midterm: 28, final: 46, total: 93, status: 'PUBLISHED', teacherId: 'u6', updatedAt: '2026-08-26' },
  { id: 'm4', studentId: 'st2', rollNo: '102', studentName: 'Aman Deep Gupta', subjectId: 's1', subjectCode: 'CS-801', subjectName: 'Artificial Intelligence & ML', internal: 15, midterm: 22, final: 40, total: 77, status: 'PUBLISHED', teacherId: 'u2', updatedAt: '2026-08-25' },
  { id: 'm5', studentId: 'st3', rollNo: '103', studentName: 'Priya Patel', subjectId: 's1', subjectCode: 'CS-801', subjectName: 'Artificial Intelligence & ML', internal: 19, midterm: 27, final: 48, total: 94, status: 'PENDING_APPROVAL', teacherId: 'u2', updatedAt: '2026-09-01' }
];

export const INITIAL_AUDIT_LOGS = [
  { id: 'log1', action: 'MARKS_SUBMITTED', details: 'Dr. Suresh Verma uploaded marks for CS-801 (Priya Patel)', timestamp: '2026-09-01 14:10:00', user: 'Dr. Suresh Verma' },
  { id: 'log2', action: 'MARKS_PUBLISHED', details: 'Admin approved CS-801 results for Rahul Sharma', timestamp: '2026-08-25 10:30:00', user: 'Admin' }
];
