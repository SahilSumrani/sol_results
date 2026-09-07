-- ==============================================================================
-- DU SOL Portal: 3 Dedicated Users Setup
-- 1. Admin:   Aishwarya Anand Arora
-- 2. Teacher: Asha Mam
-- 3. Student: Sahil Sumrani
-- ==============================================================================

-- 1. Create / Update Admin User
-- Email:    aishwarya.admin@sol.du.ac.in
-- Password: Admin@123
INSERT INTO `users` (
  `name`, 
  `email`, 
  `password`, 
  `role`, 
  `rollNo`, 
  `course`, 
  `department`, 
  `semester`, 
  `section`, 
  `fatherName`, 
  `motherName`, 
  `enrollmentNo`, 
  `mustChangePassword`
) VALUES (
  'Aishwarya Anand Arora',
  'aishwarya.admin@sol.du.ac.in',
  '$2a$12$nQBv3ElEHaToE15hCyiAFuzPvCFkxuMqBnqLqzec5PJw8z3znrjna',
  'ADMIN',
  NULL,
  NULL,
  'Examination & Academic Administration',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  0
)
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `password` = VALUES(`password`),
  `role` = VALUES(`role`),
  `department` = VALUES(`department`);

-- 2. Create / Update Teacher User
-- Email:    asha.teacher@sol.du.ac.in
-- Password: Teacher@123
INSERT INTO `users` (
  `name`, 
  `email`, 
  `password`, 
  `role`, 
  `rollNo`, 
  `course`, 
  `department`, 
  `semester`, 
  `section`, 
  `fatherName`, 
  `motherName`, 
  `enrollmentNo`, 
  `mustChangePassword`
) VALUES (
  'Asha Mam',
  'asha.teacher@sol.du.ac.in',
  '$2a$12$kzdtP8OO9.pROsBr4sp4vOYj41pEWTLUYzZsSqcFN96hqF2ro/SAO',
  'TEACHER',
  NULL,
  'B.Tech CSE',
  'Computer Science & Engineering',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  0
)
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `password` = VALUES(`password`),
  `role` = VALUES(`role`),
  `department` = VALUES(`department`);

-- 3. Create / Update Student User
-- Roll No:  2334522/188
-- Email:    sahil.student@sol.du.ac.in
-- Password: Student@123
INSERT INTO `users` (
  `name`, 
  `email`, 
  `password`, 
  `role`, 
  `rollNo`, 
  `course`, 
  `department`, 
  `semester`, 
  `section`, 
  `fatherName`, 
  `motherName`, 
  `enrollmentNo`, 
  `mustChangePassword`
) VALUES (
  'Sahil Sumrani',
  'sahil.student@sol.du.ac.in',
  '$2a$12$E4kJtPzGeK.GnTAXvw5iDeO.2UPJrP/1DheWErqbT3dpi1sfbMXxq',
  'STUDENT',
  '2334522/188',
  'B.Tech CSE',
  'School of Open Learning',
  'VIII',
  'A',
  'Shri R. Sumrani',
  'Smt. K. Sumrani',
  '23SOL2334522',
  0
)
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `password` = VALUES(`password`),
  `role` = VALUES(`role`),
  `rollNo` = VALUES(`rollNo`),
  `course` = VALUES(`course`),
  `semester` = VALUES(`semester`),
  `fatherName` = VALUES(`fatherName`),
  `motherName` = VALUES(`motherName`),
  `enrollmentNo` = VALUES(`enrollmentNo`);
