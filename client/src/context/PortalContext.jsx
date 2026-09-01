import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS, INITIAL_COURSES, INITIAL_SUBJECTS, INITIAL_STUDENTS_LIST, INITIAL_MARKS, INITIAL_AUDIT_LOGS } from '../data/mockData';

const PortalContext = createContext();

export const PortalProvider = ({ children }) => {
  // Persistence state setup
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('portal_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('portal_users_list');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('portal_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('portal_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('portal_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS_LIST;
  });

  const [marks, setMarks] = useState(() => {
    const saved = localStorage.getItem('portal_marks');
    return saved ? JSON.parse(saved) : INITIAL_MARKS;
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('portal_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('portal_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('portal_marks', JSON.stringify(marks));
  }, [marks]);

  useEffect(() => {
    localStorage.setItem('portal_users_list', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('portal_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('portal_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('portal_logs', JSON.stringify(logs));
  }, [logs]);

  // Auth actions
  const login = (email, password, role) => {
    // Check credentials for ADMIN or TEACHER
    if (role === 'ADMIN') {
      if ((email.toLowerCase() === 'admin@sol.du.ac.in' || email.toLowerCase() === 'admin') && password === 'admin123') {
        const adminUser = { id: '1', name: 'System Admin', role: 'ADMIN', email: 'admin@sol.du.ac.in', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' };
        setCurrentUser(adminUser);
        return true;
      }
    } else if (role === 'TEACHER') {
      if ((email.toLowerCase() === 'teacher@sol.du.ac.in' || email.toLowerCase() === 'teacher') && password === 'teacher123') {
        const teacherUser = { id: '2', name: 'Dr. Rajesh Sharma', role: 'TEACHER', email: 'teacher@sol.du.ac.in', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150' };
        setCurrentUser(teacherUser);
        return true;
      }
    }
    return false;
  };

  const loginAs = (userId) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      addLog('USER_LOGIN', `Logged in as ${target.name} (${target.role})`, target.name);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Helper log function
  const addLog = (action, details, user = currentUser?.name || 'System') => {
    const newLog = {
      id: `log_${Date.now()}`,
      action,
      details,
      timestamp: new Date().toLocaleString(),
      user
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Marks Actions
  const submitBulkMarks = (newMarksList, subjectDetails) => {
    setMarks(prev => {
      const filtered = prev.filter(m => !(m.subjectId === subjectDetails.id && newMarksList.some(nm => nm.rollNo === m.rollNo)));
      const formattedNewMarks = newMarksList.map(nm => {
        const studentInfo = students.find(s => s.rollNo === String(nm.rollNo)) || { name: nm.studentName || 'Student ' + nm.rollNo, id: `st_${nm.rollNo}` };
        return {
          id: `m_${Date.now()}_${nm.rollNo}`,
          studentId: studentInfo.id,
          rollNo: String(nm.rollNo),
          studentName: studentInfo.name,
          subjectId: subjectDetails.id,
          subjectCode: subjectDetails.code,
          subjectName: subjectDetails.name,
          internal: Number(nm.internal) || 0,
          midterm: Number(nm.midterm) || 0,
          final: Number(nm.final) || 0,
          total: (Number(nm.internal) || 0) + (Number(nm.midterm) || 0) + (Number(nm.final) || 0),
          status: 'PENDING_APPROVAL',
          teacherId: currentUser.id,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      });
      return [...filtered, ...formattedNewMarks];
    });

    addLog('MARKS_SUBMITTED', `Uploaded ${newMarksList.length} student marks for ${subjectDetails.code} (${subjectDetails.name})`, currentUser?.name);
  };

  const updateMarkStatus = (markId, status) => {
    setMarks(prev => prev.map(m => m.id === markId ? { ...m, status } : m));
    const targetMark = marks.find(m => m.id === markId);
    if (targetMark) {
      addLog('MARKS_STATUS_CHANGED', `Mark status for Roll ${targetMark.rollNo} in ${targetMark.subjectCode} updated to ${status}`, currentUser?.name);
    }
  };

  const bulkApproveMarks = (subjectId) => {
    setMarks(prev => prev.map(m => m.subjectId === subjectId && m.status === 'PENDING_APPROVAL' ? { ...m, status: 'PUBLISHED' } : m));
    const subj = subjects.find(s => s.id === subjectId);
    addLog('MARKS_PUBLISHED', `Approved and published results for ${subj?.name || subjectId}`, currentUser?.name);
  };

  const editMarkEntry = (updatedMark) => {
    setMarks(prev => prev.map(m => m.id === updatedMark.id ? {
      ...updatedMark,
      total: (Number(updatedMark.internal) || 0) + (Number(updatedMark.midterm) || 0) + (Number(updatedMark.final) || 0)
    } : m));
    addLog('MARK_EDITED', `Edited marks for Roll ${updatedMark.rollNo}`, currentUser?.name);
  };

  // Admin Entities Actions
  const addTeacher = (teacherObj) => {
    const newUserId = `u_${Date.now()}`;
    const newUser = {
      id: newUserId,
      name: teacherObj.name,
      email: teacherObj.email,
      role: 'TEACHER',
      employeeId: teacherObj.employeeId,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces`
    };
    setUsers(prev => [...prev, newUser]);
    addLog('TEACHER_ADDED', `Added new teacher ${teacherObj.name} (${teacherObj.employeeId})`);
  };

  const addStudent = (studentObj) => {
    const newUserId = `u_st_${Date.now()}`;
    const newUser = {
      id: newUserId,
      name: studentObj.name,
      email: studentObj.email || `${studentObj.rollNo}@student.portal.com`,
      role: 'STUDENT',
      rollNo: studentObj.rollNo,
      course: studentObj.course,
      year: studentObj.year,
      semester: studentObj.semester,
      avatar: `https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces`
    };

    const newStudent = {
      id: `st_${Date.now()}`,
      userId: newUserId,
      rollNo: studentObj.rollNo,
      name: studentObj.name,
      course: studentObj.course,
      year: studentObj.year,
      semester: studentObj.semester,
      section: studentObj.section || 'A'
    };

    setUsers(prev => [...prev, newUser]);
    setStudents(prev => [...prev, newStudent]);
    addLog('STUDENT_ADDED', `Added student ${studentObj.name} (Roll: ${studentObj.rollNo})`);
  };

  const addSubject = (subjectObj) => {
    const newSubj = {
      id: `s_${Date.now()}`,
      name: subjectObj.name,
      code: subjectObj.code,
      course: subjectObj.course,
      year: subjectObj.year,
      semester: subjectObj.semester,
      teacherId: subjectObj.teacherId || '',
      maxInternal: Number(subjectObj.maxInternal) || 20,
      maxMidterm: Number(subjectObj.maxMidterm) || 30,
      maxFinal: Number(subjectObj.maxFinal) || 50
    };
    setSubjects(prev => [...prev, newSubj]);
    addLog('SUBJECT_CREATED', `Created subject ${subjectObj.code}: ${subjectObj.name}`);
  };

  const assignTeacherToSubject = (subjectId, teacherId) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, teacherId } : s));
    const subj = subjects.find(s => s.id === subjectId);
    const teacher = users.find(u => u.id === teacherId);
    addLog('SUBJECT_ASSIGNED', `Assigned ${subj?.code} to ${teacher?.name}`);
  };

  const [facultyList, setFacultyList] = useState([
    { id: 'f1', name: 'Dr. Rajesh Sharma', username: 'rajesh_sharma', pass: 'sol_rajesh99', department: 'Dept. of Computer Science', subject: 'Python Programming', status: 'ONLINE', lastActive: 'Today, 09:45 PM', queriedSubject: 'PROGRAMMING FUNDAMENTALS USING PYTHON' },
    { id: 'f2', name: 'Prof. Anita Desai', username: 'anita_desai', pass: 'sol_anita42', department: 'Dept. of Commerce', subject: 'Financial Accounting', status: 'OFFLINE', lastActive: 'Today, 04:12 PM', queriedSubject: 'FINANCIAL ACCOUNTING & REPORTING' },
    { id: 'f3', name: 'Dr. Vikram Malhotra', username: 'vikram_m', pass: 'sol_vikram77', department: 'Dept. of Mathematics', subject: 'Calculus & Algebra', status: 'OFFLINE', lastActive: 'Yesterday, 11:30 AM', queriedSubject: 'CALCULUS AND LINEAR ALGEBRA' },
    { id: 'f4', name: 'Dr. Meenakshi Sundaram', username: 'meenakshi_s', pass: 'sol_meena88', department: 'Dept. of Economics', subject: 'Microeconomics', status: 'ONLINE', lastActive: 'Today, 10:15 PM', queriedSubject: 'INTRODUCTORY MICROECONOMICS' }
  ]);

  const addFacultyMember = (name, department, subject) => {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const newUsername = `${cleanName}_${randomPin}`;
    const newPassword = `sol_${cleanName.slice(0, 4)}${Math.floor(10 + Math.random() * 90)}`;

    const newFaculty = {
      id: `fac_${Date.now()}`,
      name,
      username: newUsername,
      pass: newPassword,
      department: department || 'Dept. of Computer Science',
      subject: subject || 'General Education',
      status: 'ONLINE',
      lastActive: 'Just Now',
      queriedSubject: subject || 'General Education'
    };

    setFacultyList(prev => [newFaculty, ...prev]);
    return newFaculty;
  };

  const approveMarks = (ids) => {
    if (!ids || !ids.length) return;
    setMarks(prev => prev.map(m => ids.includes(m.id) ? { ...m, status: 'PUBLISHED' } : m));
  };

  return (
    <PortalContext.Provider value={{
      currentUser,
      users,
      courses,
      subjects,
      students,
      marks,
      logs,
      facultyList,
      setFacultyList,
      addFacultyMember,
      approveMarks,
      login,
      loginAs,
      logout,
      submitBulkMarks,
      updateMarkStatus,
      bulkApproveMarks,
      editMarkEntry,
      addTeacher,
      addStudent,
      addSubject,
      assignTeacherToSubject
    }}>
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => useContext(PortalContext);
