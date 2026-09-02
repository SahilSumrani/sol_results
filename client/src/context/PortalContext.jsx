import React, { createContext, useContext, useState, useEffect } from 'react';

const PortalContext = createContext();

export const PortalProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('portal_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  const API_BASE = typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:5000';

  // Fetch Portal Data on Mount or User Login
  const refreshData = async () => {
    try {
      const resTeachers = await fetch(`${API_BASE}/api/admin/teachers`);
      if (resTeachers.ok) {
        const teachersData = await resTeachers.json();
        setFacultyList(teachersData.map(t => ({
          id: String(t.id),
          name: t.name,
          email: t.email,
          employeeId: `T00${t.id}`,
          department: t.department || 'Computer Science & Engineering',
          subject: t.assignedSubjects || 'No Subject Assigned',
          status: 'ONLINE'
        })));
      }

      const resStudents = await fetch(`${API_BASE}/api/admin/students`);
      if (resStudents.ok) {
        const studentsData = await resStudents.json();
        setStudents(studentsData.map(s => ({
          id: String(s.id),
          rollNo: s.rollNo || `24010${s.id}`,
          name: s.name,
          course: s.course || 'B.Tech CSE',
          semester: 'VIII',
          section: 'A'
        })));
      }

      if (currentUser?.role === 'TEACHER') {
        const resAssign = await fetch(`${API_BASE}/api/teacher/assignments?email=${encodeURIComponent(currentUser.email)}`);
        if (resAssign.ok) {
          const assignData = await resAssign.json();
          setAssignedSubjects(assignData);
        }
        const resSub = await fetch(`${API_BASE}/api/teacher/submissions?email=${encodeURIComponent(currentUser.email)}`);
        if (resSub.ok) {
          const subData = await resSub.json();
          setSubmissions(subData);
        }
      } else if (currentUser?.role === 'ADMIN') {
        const resQueue = await fetch(`${API_BASE}/api/admin/approval-queue`);
        if (resQueue.ok) {
          const queueData = await resQueue.json();
          setSubmissions(queueData);
        }
        const resAudit = await fetch(`${API_BASE}/api/admin/audit-logs`);
        if (resAudit.ok) {
          const auditData = await resAudit.json();
          setLogs(auditData);
        }
      }
    } catch (err) {
      console.log('PortalContext API fetch error:', err.message);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  // Sync to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('portal_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('portal_user');
    }
  }, [currentUser]);

  // Auth actions
  const login = async (email, password, role) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        return true;
      }
    } catch (err) {
      console.warn('API login failed, falling back to static auth:', err.message);
    }

    // Static / Mock Fallback Authentication if backend server is offline or credential match
    if (role === 'ADMIN' && email === 'admin@sol.du.ac.in' && password === 'admin123') {
      const adminUser = { id: 1, name: 'System Admin', email: 'admin@sol.du.ac.in', role: 'ADMIN', department: 'Examination Branch' };
      setCurrentUser(adminUser);
      return true;
    }

    if (role === 'TEACHER' && email === 'teacher@sol.du.ac.in' && password === 'teacher123') {
      const teacherUser = { id: 2, name: 'Dr. Rajesh Sharma', email: 'teacher@sol.du.ac.in', role: 'TEACHER', department: 'Computer Science' };
      setCurrentUser(teacherUser);
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Admin Actions
  const assignTeacherToSubject = async (assignmentObj) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/assign-subject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentObj)
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
    } catch (err) {
      console.error('Assign error:', err);
    }
    return false;
  };

  const reviewSubmission = async (submissionId, action, rejectionReason) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/submission/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, action, rejectionReason })
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
    } catch (err) {
      console.error('Review error:', err);
    }
    return false;
  };

  // Teacher Submit Marks
  const submitTeacherMarks = async (submissionData) => {
    try {
      const res = await fetch(`${API_BASE}/api/teacher/marks/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
    } catch (err) {
      console.error('Submit marks error:', err);
    }
    return false;
  };

  // Teacher Resubmit Correction Marks
  const resubmitTeacherMarks = async (submissionId, correctionReason, updatedMarks) => {
    try {
      const res = await fetch(`${API_BASE}/api/teacher/marks/resubmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          teacherName: currentUser?.name || 'Teacher',
          correctionReason,
          updatedMarks
        })
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
    } catch (err) {
      console.error('Resubmit error:', err);
    }
    return false;
  };

  // Add Faculty to MySQL DB
  const addFacultyMember = async (name, department, subject, email) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/teacher/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@sol.du.ac.in`,
          department: department || 'Computer Science',
          course: subject || 'B.Tech CSE'
        })
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
    } catch (err) {
      console.error('Error creating teacher in DB:', err);
    }
    return false;
  };

  // Add Subject to MySQL DB
  const addSubject = async (subjectObj) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/subject/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subjectObj)
      });
      if (res.ok) {
        refreshData();
        return true;
      }
    } catch (err) {
      console.error('Error creating subject in DB:', err);
    }
  };

  // Add Student to MySQL DB
  const addStudent = async (studentObj) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/student/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentObj)
      });
      if (res.ok) {
        refreshData();
        return true;
      }
    } catch (err) {
      console.error('Error creating student in DB:', err);
    }
  };

  return (
    <PortalContext.Provider value={{
      currentUser,
      assignedSubjects,
      submissions,
      students,
      marks,
      logs,
      facultyList,
      login,
      logout,
      refreshData,
      assignTeacherToSubject,
      reviewSubmission,
      submitTeacherMarks,
      resubmitTeacherMarks,
      addFacultyMember,
      addSubject,
      addStudent
    }}>
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => useContext(PortalContext);

