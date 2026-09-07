-- Migration 001: Initial Clean Schema with Strict Foreign Keys and Normalized ENUMs

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'TEACHER', 'STUDENT') NOT NULL DEFAULT 'STUDENT',
  `rollNo` VARCHAR(100) UNIQUE DEFAULT NULL,
  `course` VARCHAR(255) DEFAULT NULL,
  `department` VARCHAR(255) DEFAULT NULL,
  `semester` VARCHAR(50) DEFAULT 'I',
  `section` VARCHAR(20) DEFAULT 'A',
  `fatherName` VARCHAR(255) DEFAULT NULL,
  `motherName` VARCHAR(255) DEFAULT NULL,
  `enrollmentNo` VARCHAR(100) DEFAULT NULL,
  `mustChangePassword` TINYINT(1) DEFAULT 0,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `department` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(100) UNIQUE NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `course` VARCHAR(255) NOT NULL,
  `semester` VARCHAR(50) NOT NULL,
  `maxMarks` INT NOT NULL DEFAULT 40,
  `assessmentType` VARCHAR(100) NOT NULL DEFAULT 'Practical',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_subjects_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `teacher_assignments` (
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
  INDEX `idx_ta_teacher_email` (`teacherEmail`),
  INDEX `idx_ta_teacher_id` (`teacherId`),
  CONSTRAINT `fk_ta_teacher_id` FOREIGN KEY (`teacherId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ta_subject_code` FOREIGN KEY (`subjectCode`) REFERENCES `subjects`(`code`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `mark_submissions` (
  `id` VARCHAR(100) PRIMARY KEY,
  `teacherId` INT NOT NULL,
  `subjectCode` VARCHAR(100) NOT NULL,
  `subjectName` VARCHAR(255) NOT NULL,
  `course` VARCHAR(255) NOT NULL,
  `semester` VARCHAR(50) NOT NULL,
  `section` VARCHAR(20) DEFAULT 'A',
  `examType` VARCHAR(100) NOT NULL,
  `maxMarks` INT DEFAULT 40,
  `totalStudents` INT NOT NULL,
  `status` ENUM('DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'CORRECTION_REQUIRED') DEFAULT 'UNDER_REVIEW',
  `teacherEmail` VARCHAR(255) NOT NULL,
  `teacherName` VARCHAR(255) NOT NULL,
  `rejectionReason` TEXT DEFAULT NULL,
  `submittedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `reviewedAt` DATETIME DEFAULT NULL,
  INDEX `idx_ms_teacher_status` (`teacherEmail`, `status`),
  INDEX `idx_ms_teacher_id` (`teacherId`),
  INDEX `idx_ms_status` (`status`),
  CONSTRAINT `fk_ms_teacher_id` FOREIGN KEY (`teacherId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ms_subject_code` FOREIGN KEY (`subjectCode`) REFERENCES `subjects`(`code`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `marks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `submissionId` VARCHAR(100) DEFAULT NULL,
  `rollNo` VARCHAR(100) NOT NULL,
  `studentName` VARCHAR(255) NOT NULL,
  `paperCode` VARCHAR(100) NOT NULL,
  `paperName` VARCHAR(255) NOT NULL,
  `course` VARCHAR(255) NOT NULL DEFAULT 'B.Tech CSE',
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
  `status` ENUM('DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'CORRECTION_REQUIRED') DEFAULT 'UNDER_REVIEW',
  `uploadedBy` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_marks_rollno_status` (`rollNo`, `status`),
  INDEX `idx_marks_submission_id` (`submissionId`),
  INDEX `idx_marks_papercode` (`paperCode`),
  CONSTRAINT `fk_marks_submission_id` FOREIGN KEY (`submissionId`) REFERENCES `mark_submissions`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_marks_paper_code` FOREIGN KEY (`paperCode`) REFERENCES `subjects`(`code`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `marks_audit` (
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
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_submission` (`submissionId`),
  CONSTRAINT `fk_audit_submission_id` FOREIGN KEY (`submissionId`) REFERENCES `mark_submissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `re_evaluations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `queryId` VARCHAR(100) NOT NULL,
  `rollNo` VARCHAR(100) NOT NULL,
  `studentName` VARCHAR(255) NOT NULL,
  `subjectName` VARCHAR(255) NOT NULL,
  `currentGrade` VARCHAR(20) DEFAULT 'B+',
  `requestedReview` TEXT NOT NULL,
  `status` ENUM('PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED') DEFAULT 'PENDING',
  `requestedAt` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
