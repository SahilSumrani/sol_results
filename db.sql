-- ==============================================================================
-- UNIVERSITY EXAMINATION ERP — CLEAN PRODUCTION SCHEMA (NO DUMMY MARKS DATA)
-- Compatible with: phpMyAdmin / DirectAdmin / Vercel / MySQL / MariaDB
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
SET AUTOCOMMIT = 0;
START TRANSACTION;

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE (System Admin, Faculty Teachers, Students)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'TEACHER', 'STUDENT') NOT NULL DEFAULT 'STUDENT',
  `rollNo` VARCHAR(100) DEFAULT NULL,
  `course` VARCHAR(255) DEFAULT NULL,
  `department` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. COURSES & SUBJECTS TABLES
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `department` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `subjects`;
CREATE TABLE `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(100) UNIQUE NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `course` VARCHAR(255) NOT NULL,
  `semester` VARCHAR(50) NOT NULL,
  `maxMarks` INT NOT NULL DEFAULT 40,
  `assessmentType` VARCHAR(100) NOT NULL DEFAULT 'Practical'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. TEACHER ASSIGNMENTS TABLE (Admin -> Assign Subject/Class to Teacher)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `teacher_assignments`;
CREATE TABLE `teacher_assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `teacherId` INT NOT NULL,
  `teacherEmail` VARCHAR(255) NOT NULL,
  `teacherName` VARCHAR(255) NOT NULL,
  `subjectCode` VARCHAR(100) NOT NULL,
  `subjectName` VARCHAR(255) NOT NULL,
  `course` VARCHAR(255) NOT NULL,
  `semester` VARCHAR(50) NOT NULL,
  `section` VARCHAR(20) NOT NULL DEFAULT 'A',
  `assignedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`teacherId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. MARK SUBMISSIONS TABLE (Teacher Submission Batch & Admin Approval Status)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `mark_submissions`;
CREATE TABLE `mark_submissions` (
  `id` VARCHAR(100) PRIMARY KEY,
  `subjectCode` VARCHAR(100) NOT NULL,
  `subjectName` VARCHAR(255) NOT NULL,
  `course` VARCHAR(255) NOT NULL,
  `semester` VARCHAR(50) NOT NULL,
  `section` VARCHAR(20) DEFAULT 'A',
  `examType` VARCHAR(100) NOT NULL,
  `maxMarks` INT DEFAULT 40,
  `totalStudents` INT NOT NULL,
  `status` ENUM('DRAFT', 'PENDING', 'SUBMITTED', 'UNDER REVIEW', 'CORRECTION REQUIRED', 'APPROVED', 'PUBLISHED', 'REJECTED') DEFAULT 'UNDER REVIEW',
  `teacherEmail` VARCHAR(255) NOT NULL,
  `teacherName` VARCHAR(255) NOT NULL,
  `rejectionReason` TEXT DEFAULT NULL,
  `submittedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `reviewedAt` DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. MARKS DETAILED TABLE (Individual Student Marks per Subject)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `marks`;
CREATE TABLE `marks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `submissionId` VARCHAR(100) DEFAULT NULL,
  `rollNo` VARCHAR(100) NOT NULL,
  `studentName` VARCHAR(255) NOT NULL,
  `paperCode` VARCHAR(100) NOT NULL,
  `paperName` VARCHAR(255) NOT NULL,
  `paperType` VARCHAR(50) NOT NULL DEFAULT 'DSC',
  `sem` VARCHAR(50) NOT NULL,
  `credit` INT NOT NULL DEFAULT 4,
  `thObt` INT DEFAULT 0,
  `thMax` INT DEFAULT 75,
  `tuObt` INT DEFAULT 0,
  `tuMax` INT DEFAULT 25,
  `prObt` INT DEFAULT 0,
  `prMax` INT DEFAULT 40,
  `totalObt` INT DEFAULT 0,
  `netGrade` VARCHAR(10) NOT NULL DEFAULT 'A',
  `gradePoint` INT NOT NULL DEFAULT 8,
  `creditPoint` INT NOT NULL DEFAULT 32,
  `status` ENUM('DRAFT', 'PENDING', 'SUBMITTED', 'UNDER REVIEW', 'CORRECTION REQUIRED', 'APPROVED', 'PUBLISHED') DEFAULT 'UNDER REVIEW',
  `uploadedBy` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_marks_rollno_status` (`rollNo`, `status`),
  INDEX `idx_marks_papercode` (`paperCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. MARKS AUDIT HISTORY TABLE (Modifications Log & Security Trail)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `marks_audit`;
CREATE TABLE `marks_audit` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `submissionId` VARCHAR(100) NOT NULL,
  `rollNo` VARCHAR(100) NOT NULL,
  `studentName` VARCHAR(255) NOT NULL,
  `paperCode` VARCHAR(100) NOT NULL,
  `fieldModified` VARCHAR(100) NOT NULL,
  `previousValue` VARCHAR(255) DEFAULT NULL,
  `newValue` VARCHAR(255) DEFAULT NULL,
  `modifiedBy` VARCHAR(255) NOT NULL,
  `reason` TEXT NOT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- DEFAULT INITIAL USERS & DEMO ASSIGNMENT
-- ==============================================================================
INSERT INTO `users` (`name`, `email`, `password`, `role`, `rollNo`, `course`, `department`) VALUES
('System Admin / Controller Exam', 'admin@sol.du.ac.in', 'admin123', 'ADMIN', NULL, NULL, 'Examination Branch'),
('Dr. Rahul Sharma', 'teacher@sol.du.ac.in', 'teacher123', 'TEACHER', NULL, 'B.Tech CSE', 'Computer Science & Engineering'),
('Sahil Sumrani', 'student@sol.du.ac.in', 'student123', 'STUDENT', '240101', 'B.Tech CSE', 'School of Open Learning');

INSERT INTO `subjects` (`code`, `name`, `course`, `semester`, `maxMarks`, `assessmentType`) VALUES
('CS401L', 'Artificial Intelligence Lab', 'B.Tech CSE', 'VIII', 40, 'Practical');

INSERT INTO `teacher_assignments` (`teacherId`, `teacherEmail`, `teacherName`, `subjectCode`, `subjectName`, `course`, `semester`, `section`) VALUES
(2, 'teacher@sol.du.ac.in', 'Dr. Rahul Sharma', 'CS401L', 'Artificial Intelligence Lab', 'B.Tech CSE', 'VIII', 'A');

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;

