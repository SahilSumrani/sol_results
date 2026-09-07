import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, setAccessToken, getAccessToken } from '../services/apiClient';

const PortalContext = createContext();

export const PortalProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  const [teachersPagination, setTeachersPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [studentsPagination, setStudentsPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [logsPagination, setLogsPagination] = useState({ page: 1, limit: 50, total: 0 });

  // On initial mount, attempt silent refresh using httpOnly cookie
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await apiFetch('/api/auth/refresh', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.log('No active session on mount.');
      } finally {
        setLoadingUser(false);
      }
    };

    initAuth();

    const handleUnauthorized = () => {
      setCurrentUser(null);
      setAccessToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const refreshData = async () => {
    if (!currentUser) return;

    try {
      if (currentUser.role === 'ADMIN') {
        // Fetch teachers
        const resTeachers = await apiFetch(`/api/admin/teachers?page=${teachersPagination.page}&limit=${teachersPagination.limit}`);
        if (resTeachers.ok) {
          const json = await resTeachers.json();
          const teachersData = json.data || json;
          if (json.pagination) setTeachersPagination(json.pagination);
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

        // Fetch students
        const resStudents = await apiFetch(`/api/admin/students?page=${studentsPagination.page}&limit=${studentsPagination.limit}`);
        if (resStudents.ok) {
          const json = await resStudents.json();
          const studentsData = json.data || json;
          if (json.pagination) setStudentsPagination(json.pagination);
          setStudents(studentsData.map(s => ({
            id: String(s.id),
            rollNo: s.rollNo || '',
            name: s.name,
            course: s.course || '-',
            semester: s.semester || '-',
            section: s.section || 'A'
          })));
        }

        // Fetch Queue & Audit Logs
        const resQueue = await apiFetch('/api/admin/approval-queue');
        if (resQueue.ok) {
          const json = await resQueue.json();
          setSubmissions(json.data || json);
        }

        const resAudit = await apiFetch(`/api/admin/audit-logs?page=${logsPagination.page}&limit=${logsPagination.limit}`);
        if (resAudit.ok) {
          const json = await resAudit.json();
          if (json.pagination) setLogsPagination(json.pagination);
          setLogs(json.data || json);
        }
      } else if (currentUser.role === 'TEACHER') {
        const resAssign = await apiFetch('/api/teacher/assignments');
        if (resAssign.ok) {
          const assignData = await resAssign.json();
          setAssignedSubjects(assignData);
        }

        const resSub = await apiFetch('/api/teacher/submissions');
        if (resSub.ok) {
          const json = await resSub.json();
          setSubmissions(json.data || json);
        }
      } else if (currentUser.role === 'STUDENT' && currentUser.rollNo) {
        const resMarks = await apiFetch(`/api/marks/student/${currentUser.rollNo}`);
        if (resMarks.ok) {
          const json = await resMarks.json();
          setMarks(json.data || json);
        }
      }
    } catch (err) {
      console.error('PortalContext refresh error:', err.message);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser, teachersPagination.page, studentsPagination.page, logsPagination.page]);

  const login = async (email, password, role) => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role })
      });

      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.accessToken);
        setCurrentUser(data.user);
        return true;
      }
    } catch (err) {
      console.error('Login failed:', err.message);
    }
    return false;
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // ignore
    } finally {
      setAccessToken(null);
      setCurrentUser(null);
    }
  };

  const assignTeacherToSubject = async (assignmentObj) => {
    try {
      const res = await apiFetch('/api/admin/assign-subject', {
        method: 'POST',
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
      const res = await apiFetch('/api/admin/submission/review', {
        method: 'POST',
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

  const submitTeacherMarks = async (submissionData) => {
    try {
      const res = await apiFetch('/api/teacher/marks/submit', {
        method: 'POST',
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

  const resubmitTeacherMarks = async (submissionId, correctionReason, updatedMarks) => {
    try {
      const res = await apiFetch('/api/teacher/marks/resubmit', {
        method: 'POST',
        body: JSON.stringify({
          submissionId,
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

  const addFacultyMember = async (name, department, subject, email, password) => {
    try {
      const res = await apiFetch('/api/admin/teacher/create', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email: email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@sol.du.ac.in`,
          password,
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

  const addSubject = async (subjectObj) => {
    try {
      const res = await apiFetch('/api/admin/subject/create', {
        method: 'POST',
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

  const addStudent = async (studentObj) => {
    try {
      const res = await apiFetch('/api/admin/student/create', {
        method: 'POST',
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
      loadingUser,
      assignedSubjects,
      submissions,
      students,
      marks,
      logs,
      facultyList,
      teachersPagination,
      setTeachersPagination,
      studentsPagination,
      setStudentsPagination,
      logsPagination,
      setLogsPagination,
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
