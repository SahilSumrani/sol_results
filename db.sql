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
-- 2. MARK SUBMISSIONS TABLE (Teacher Submission Batch & Admin Approval Status)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `mark_submissions`;
CREATE TABLE `mark_submissions` (
  `id` VARCHAR(100) PRIMARY KEY,
  `subjectCode` VARCHAR(100) NOT NULL,
  `subjectName` VARCHAR(255) NOT NULL,
  `course` VARCHAR(255) NOT NULL,
  `semester` VARCHAR(50) NOT NULL,
  `examType` VARCHAR(100) NOT NULL,
  `totalStudents` INT NOT NULL,
  `status` ENUM('DRAFT', 'PENDING', 'SUBMITTED', 'UNDER REVIEW', 'CORRECTION REQUIRED', 'APPROVED', 'PUBLISHED', 'REJECTED') DEFAULT 'SUBMITTED',
  `teacherEmail` VARCHAR(255) NOT NULL,
  `teacherName` VARCHAR(255) NOT NULL,
  `rejectionReason` TEXT DEFAULT NULL,
  `submittedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `reviewedAt` DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. MARKS DETAILED TABLE (Individual Student Marks per Subject)
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
  `tuObt` INTEGER DEFAULT 0,
  `tuMax` INT DEFAULT 25,
  `prObt` INT DEFAULT 0,
  `prMax` INT DEFAULT 0,
  `netGrade` VARCHAR(10) NOT NULL DEFAULT 'A',
  `gradePoint` INT NOT NULL DEFAULT 8,
  `creditPoint` INT NOT NULL DEFAULT 32,
  `status` ENUM('DRAFT', 'PENDING', 'SUBMITTED', 'CORRECTION REQUIRED', 'APPROVED', 'PUBLISHED') DEFAULT 'SUBMITTED',
  `uploadedBy` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_marks_rollno_status` (`rollNo`, `status`),
  INDEX `idx_marks_papercode` (`paperCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. MARKS AUDIT HISTORY TABLE (Modifications Log & Security Trail)
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
-- OFFICIAL DEFAULT USERS (ADMIN, TEACHER, STUDENT)
-- ==============================================================================
INSERT INTO `users` (`name`, `email`, `password`, `role`, `rollNo`, `course`, `department`) VALUES
('System Admin / Controller Exam', 'admin@sol.du.ac.in', 'admin123', 'ADMIN', NULL, NULL, 'Examination Branch'),
('Dr. Rahul Sharma', 'teacher@sol.du.ac.in', 'teacher123', 'TEACHER', NULL, 'B.Tech CSE', 'Computer Science & Engineering'),
('Sahil Sumrani', 'student@sol.du.ac.in', 'student123', 'STUDENT', '23345227188', '(NEP) B.A. (PROGRAMME)', 'School of Open Learning');

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;
