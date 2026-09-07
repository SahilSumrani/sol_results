-- Migration 002: Add extended student profile columns and denormalized course column in marks
-- Safe column addition for existing databases

ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `semester` VARCHAR(50) DEFAULT 'I',
  ADD COLUMN IF NOT EXISTS `section` VARCHAR(20) DEFAULT 'A',
  ADD COLUMN IF NOT EXISTS `fatherName` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `motherName` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `enrollmentNo` VARCHAR(100) DEFAULT NULL;

ALTER TABLE `marks`
  ADD COLUMN IF NOT EXISTS `course` VARCHAR(255) NOT NULL DEFAULT 'B.Tech CSE';
