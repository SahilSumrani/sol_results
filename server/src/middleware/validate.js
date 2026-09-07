const { z } = require('zod');

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: result.error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
      });
    }
    req.body = result.data;
    next();
  };
}

// Schemas
const loginSchema = z.object({
  email: z.string().min(1, 'Email or Roll No is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT'], { required_error: 'Valid role is required' })
});

const createTeacherSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  department: z.string().optional(),
  course: z.string().optional()
});

const createStudentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  rollNo: z.string().min(1, 'Roll No is required'),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  course: z.string().optional(),
  department: z.string().optional(),
  semester: z.string().optional(),
  section: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  enrollmentNo: z.string().optional()
});

const createSubjectSchema = z.object({
  code: z.string().min(1, 'Subject code is required'),
  name: z.string().min(1, 'Subject name is required'),
  course: z.string().optional().default('B.Tech CSE'),
  semester: z.string().optional().default('VIII'),
  maxMarks: z.coerce.number().int().positive().optional().default(40),
  assessmentType: z.string().optional().default('Practical')
});

const createCourseSchema = z.object({
  code: z.string().min(1, 'Course code is required'),
  name: z.string().min(1, 'Course name is required'),
  department: z.string().optional().default('Computer Science & Engineering')
});

const assignSubjectSchema = z.object({
  teacherId: z.coerce.number().int(),
  teacherEmail: z.string().email(),
  teacherName: z.string().min(1),
  subjectCode: z.string().min(1),
  subjectName: z.string().min(1),
  course: z.string().min(1),
  semester: z.string().min(1),
  section: z.string().optional().default('A')
});

const submitMarksSchema = z.object({
  submissionId: z.string().optional(),
  subjectCode: z.string().min(1),
  subjectName: z.string().min(1),
  course: z.string().min(1),
  semester: z.string().min(1),
  section: z.string().optional().default('A'),
  examType: z.string().optional().default('Practical'),
  maxMarks: z.coerce.number().int().positive().optional().default(40),
  teacherEmail: z.string().email().optional(),
  teacherName: z.string().optional(),
  marksData: z.array(z.object({
    rollNo: z.string().min(1),
    studentName: z.string().optional(),
    name: z.string().optional(),
    marks: z.union([z.number(), z.string()]),
    paperType: z.string().optional()
  })).min(1, 'At least one student mark entry is required')
});

const reviewSubmissionSchema = z.object({
  submissionId: z.string().min(1),
  action: z.enum(['APPROVE', 'REJECT']),
  rejectionReason: z.string().optional()
}).refine(data => {
  if (data.action === 'REJECT' && (!data.rejectionReason || !data.rejectionReason.trim())) {
    return false;
  }
  return true;
}, {
  message: 'Rejection reason is mandatory when rejecting a submission',
  path: ['rejectionReason']
});

const resubmitMarksSchema = z.object({
  submissionId: z.string().min(1),
  correctionReason: z.string().min(1, 'Correction reason is mandatory for resubmission'),
  updatedMarks: z.array(z.object({
    rollNo: z.string().min(1),
    studentName: z.string().optional(),
    name: z.string().optional(),
    paperCode: z.string().optional(),
    subjectCode: z.string().optional(),
    marks: z.union([z.number(), z.string()]),
    previousMarks: z.union([z.number(), z.string()]).optional(),
    maxMarks: z.coerce.number().optional()
  })).optional().default([])
});

module.exports = {
  validateBody,
  loginSchema,
  createTeacherSchema,
  createStudentSchema,
  createSubjectSchema,
  createCourseSchema,
  assignSubjectSchema,
  submitMarksSchema,
  reviewSubmissionSchema,
  resubmitMarksSchema
};
