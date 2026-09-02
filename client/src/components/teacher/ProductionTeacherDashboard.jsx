import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, Users, Upload, FileCheck, Clock, 
  Bell, FileText, User, LogOut, CheckCircle, Search, FileSpreadsheet, Download, ShieldAlert, History
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { SubmissionsLogTable } from './SubmissionsLogTable';
import { AuditAndPdfModals } from './AuditAndPdfModals';
import { usePortal } from '../../context/PortalContext';

export const ProductionTeacherDashboard = ({ onLogout }) => {
  // Navigation Flow States: 'dashboard' | 'subjects' | 'select_exam' | 'upload_method' | 'excel_upload' | 'manual_entry' | 'validation' | 'preview_marks' | 'submission_success' | 'submissions_log' | 'classes' | 'students' | 'reports' | 'notifications'
  const [currentStep, setCurrentStep] = useState('dashboard');
  
  // Active Selected Examination Context
  const [selectedSubject, setSelectedSubject] = useState({ code: 'CS401', name: 'Artificial Intelligence', program: 'B.Tech CSE', semester: 'VIII', students: 62, status: 'Pending' });
  const [academicYear, setAcademicYear] = useState('2026–27');
  const [course, setCourse] = useState('B.Tech CSE');
  const [year, setYear] = useState('4th Year');
  const [semester, setSemester] = useState('VIII');
  const [examType, setExamType] = useState('Internal Assessment');
  const [entryMethod, setEntryMethod] = useState('excel');

  // Submission & Validation States
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [lastSubmissionId, setLastSubmissionId] = useState('');

  // Rejection & Audit Correction Modal States
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [selectedRejection, setSelectedRejection] = useState(null);
  const [correctionReason, setCorrectionReason] = useState('Marks verified against physical answer sheets.');
  const [auditLogModalOpen, setAuditLogModalOpen] = useState(false);
  const [pdfPreviewModalOpen, setPdfPreviewModalOpen] = useState(false);

  const { currentUser } = usePortal ? usePortal() : { currentUser: null };

  // Teacher Profile Data
  const teacherProfile = {
    name: currentUser?.name || 'Faculty Member',
    title: 'Assistant Professor',
    department: currentUser?.department || 'Computer Science & Engineering',
    employeeId: currentUser?.employeeId || `EMP-${currentUser?.id || '001'}`,
    academicYear: '2026–27',
    semester: 'Semester VIII'
  };

  // Editable Student Marks Preview Data
  const [previewRows, setPreviewRows] = useState([]);

  // Audit Logs Store
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [submissionsList, setSubmissionsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);

  // Fetch Submissions & Active Assigned Data on Mount / Step Change from MySQL API
  useEffect(() => {
    const fetchTeacherData = async () => {
      setLoading(true);
      try {
        const resSub = await fetch('http://localhost:5000/api/teacher/submissions');
        if (resSub.ok) {
          const data = await resSub.json();
          setSubmissionsList(data);
        }
        const resAssign = await fetch('http://localhost:5000/api/teacher/assignments');
        if (resAssign.ok) {
          const data = await resAssign.json();
          setAssignedSubjects(data.map(item => ({
            code: item.subjectCode,
            name: item.subjectName,
            program: item.course,
            semester: item.semester,
            students: 62,
            status: 'Pending'
          })));
        }
      } catch (err) {
        console.log('Error fetching DB records:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherData();
  }, []);

  const handleSelectSubject = (subj) => {
    setSelectedSubject(subj);
    setCurrentStep('select_exam');
  };

  const handleInlineMarkChange = (rollNo, field, val) => {
    setPreviewRows(prev => prev.map(row => {
      if (row.rollNo === rollNo) {
        const numVal = Number(val || 0);
        const updatedRow = { ...row, [field]: numVal };
        updatedRow.total = Number(updatedRow.internal || 0) + Number(updatedRow.practical || 0);
        return updatedRow;
      }
      return row;
    }));
  };

  const handleFinalSubmitConfirm = () => {
    const newSubId = `SUB-2026-00${Math.floor(100 + Math.random() * 900)}`;
    setLastSubmissionId(newSubId);
    
    setSubmissionsList(prev => [
      { id: newSubId, subject: `${selectedSubject.name} (${selectedSubject.code})`, class: `${selectedSubject.program} - 4th Year`, examType, students: previewRows.length, date: '02 Sept 2026', status: 'Under Review', rejectionReason: null },
      ...prev
    ]);

    setConfirmationModalOpen(false);
    setCurrentStep('submission_success');
  };

  const handleOpenCorrection = (sub) => {
    setSelectedRejection(sub);
    setCorrectionModalOpen(true);
  };

  const handleResubmitCorrection = () => {
    if (!correctionReason.trim()) return alert('Please enter a correction reason');

    const newAudit = {
      id: Date.now(),
      submissionId: selectedRejection.id,
      rollNo: '240104',
      name: 'Mohit Kumar',
      paperCode: selectedRejection.subject,
      field: 'Internal Marks',
      prevVal: '27',
      newVal: '30',
      user: teacherProfile.name,
      reason: correctionReason,
      date: new Date().toLocaleString()
    };

    setAuditLogs(prev => [newAudit, ...prev]);
    setSubmissionsList(prev => prev.map(s => s.id === selectedRejection.id ? { ...s, status: 'Under Review', rejectionReason: null } : s));

    setCorrectionModalOpen(false);
    alert(`Submission ${selectedRejection.id} resubmitted to HOD with Audit Log created.`);
  };

  const handleDownloadDynamicTemplate = () => {
    window.location.href = `http://localhost:5000/api/teacher/template/download?subjectCode=${selectedSubject.code}&subjectName=${selectedSubject.name}`;
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex text-slate-800 font-sans antialiased">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 hidden md:flex border-r border-slate-800 min-h-screen sticky top-0 h-screen">
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-md">
              U
            </div>
            <div>
              <h1 className="font-bold text-sm text-white leading-tight">University ERP</h1>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Examination Portal</p>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-medium">
            <p className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Portal Navigation</p>
            
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'subjects', label: 'My Subjects', icon: BookOpen },
              { id: 'upload_method', label: 'Marks Upload', icon: Upload },
              { id: 'submissions_log', label: 'Submissions History', icon: FileCheck },
              { id: 'classes', label: 'My Classes', icon: Users },
              { id: 'students', label: 'Enrolled Students List', icon: User },
              { id: 'reports', label: 'Reports & Analytics', icon: FileText },
              { id: 'notifications', label: 'Notifications', icon: Bell }
            ].map(item => {
              const Icon = item.icon;
              // Derive active sidebar state strictly from current flow step
              const isActive = 
                currentStep === item.id || 
                (item.id === 'upload_method' && ['select_exam', 'excel_upload', 'manual_entry', 'validation', 'preview_marks', 'submission_success'].includes(currentStep)) ||
                (item.id === 'subjects' && currentStep === 'subjects');

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentStep(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white font-bold shadow-sm' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              RS
            </div>
            <div className="truncate">
              <h4 className="text-xs font-bold text-white truncate">{teacherProfile.name}</h4>
              <p className="text-[10px] text-slate-400 truncate">{teacherProfile.department}</p>
            </div>
          </div>
          <button onClick={onLogout} className="text-slate-400 hover:text-red-400 p-2 rounded-lg cursor-pointer" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. MAIN BODY CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-semibold text-slate-400">Portal</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900 uppercase">{currentStep.replace('_', ' ')}</span>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => setAuditLogModalOpen(true)} className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer">
              <History className="w-4 h-4 text-blue-600" />
              <span>Marks Audit Log ({auditLogs.length})</span>
            </button>

            <button onClick={() => setCurrentStep('notifications')} className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer">
              <Bell className="w-4.5 h-4.5" />
              <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1.5 right-1.5"></span>
            </button>
            <div className="h-5 w-px bg-slate-200"></div>
            <span className="text-xs font-bold text-slate-800">{teacherProfile.name}</span>
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <main className="p-8 space-y-6 flex-1 overflow-y-auto max-w-6xl">
          
          {/* REJECTION ALERT BANNER */}
          {submissionsList.some(s => s.status === 'Correction Required') && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-900">
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <h4 className="font-bold">⚠ Correction Required for Submission SUB-2026-00105</h4>
                  <p className="text-[11px] text-red-700 font-medium">HOD Rejection: Roll No. 240104 and 240145 marks need verification against lab record sheets.</p>
                </div>
              </div>
              <button 
                onClick={() => handleOpenCorrection(submissionsList.find(s => s.status === 'Correction Required'))}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-xs shrink-0"
              >
                View Issues & Edit
              </button>
            </div>
          )}

          {/* DASHBOARD VIEW */}
          {currentStep === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <h2 className="text-xl font-bold text-slate-900">Welcome, {teacherProfile.name}</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{teacherProfile.department} • Academic Year 2026–27</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Assigned Subjects</span>
                  <h3 className="text-2xl font-bold text-slate-900">{assignedSubjects.length}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Students</span>
                  <h3 className="text-2xl font-bold text-slate-900">{studentsList.length > 0 ? studentsList.length : assignedSubjects.length * 30}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Pending Submissions</span>
                  <h3 className="text-2xl font-bold text-amber-600">
                    {submissionsList.filter(s => s.status === 'Correction Required' || s.status === 'Under Review' || s.status === 'CORRECTION REQUIRED' || s.status === 'UNDER REVIEW').length}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Marks Submission Progress</h3>
                  <span className="text-lg font-bold text-blue-700">
                    {submissionsList.length > 0 
                      ? `${Math.round((submissionsList.filter(s => s.status === 'Approved' || s.status === 'Published' || s.status === 'APPROVED').length / submissionsList.length) * 100)}%` 
                      : '100%'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all" 
                    style={{ width: submissionsList.length > 0 ? `${Math.round((submissionsList.filter(s => s.status === 'Approved' || s.status === 'Published' || s.status === 'APPROVED').length / submissionsList.length) * 100)}%` : '100%' }}
                  ></div>
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Quick Actions</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                  <button 
                    onClick={() => setCurrentStep('upload_method')}
                    className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Marks</span>
                  </button>
                  <button 
                    onClick={() => setCurrentStep('preview_marks')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Continue Draft</span>
                  </button>
                  <button 
                    onClick={() => setCurrentStep('submissions_log')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>View Pending</span>
                  </button>
                  <button 
                    onClick={handleDownloadDynamicTemplate}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Download Template</span>
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button onClick={() => setCurrentStep('subjects')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-2xs">
                  Go to Assigned Subjects →
                </button>
              </div>
            </div>
          )}

          {/* MY SUBJECTS LIST */}
          {(currentStep === 'subjects' || currentStep === 'dashboard') && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3">Assigned Subjects</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assignedSubjects.map(sub => (
                  <div key={sub.code} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{sub.code}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sub.status === 'Submitted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sub.status === 'Pending' ? '⚠ Pending' : '✓ Submitted'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{sub.name}</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">{sub.program} • {sub.semester} Semester</p>
                      <p className="text-xs text-slate-600 font-medium">{sub.students} Students</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-right">
                      {sub.status === 'Pending' ? (
                        <button 
                          onClick={() => handleSelectSubject(sub)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-2xs"
                        >
                          [ Upload Marks ]
                        </button>
                      ) : (
                        <button 
                          onClick={() => setCurrentStep('submissions_log')}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                        >
                          [ View Submission ]
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SELECT EXAMINATION STEP */}
          {currentStep === 'select_exam' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="font-bold text-base text-slate-900">Upload Marks — Select Examination</h3>
                <p className="text-xs text-slate-500 font-medium">Configure examination parameters for {selectedSubject.name} ({selectedSubject.code})</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-500 mb-1">Academic Year</label>
                  <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none">
                    <option value="2026–27">2026–27</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Course</label>
                  <select value={course} onChange={(e) => setCourse(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none">
                    <option value="B.Tech CSE">B.Tech CSE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Year / Semester</label>
                  <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none">
                    <option value="VIII">4th Year (Semester VIII)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Exam Type</label>
                  <select value={examType} onChange={(e) => setExamType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none">
                    <option value="Internal Assessment">Internal Assessment</option>
                    <option value="Mid Semester">Mid Semester</option>
                    <option value="End Semester">End Semester</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
                <button onClick={() => setCurrentStep('subjects')} className="px-4 py-2 bg-slate-100 font-bold text-xs text-slate-700 rounded-xl">Back</button>
                <button onClick={() => setCurrentStep('upload_method')} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white rounded-xl shadow-2xs">Continue to Select Method →</button>
              </div>
            </div>
          )}

          {/* SELECT ENTRY METHOD */}
          {currentStep === 'upload_method' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6 text-center">
              <h3 className="font-bold text-base text-slate-900">Select Mark Entry Method</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                <button 
                  onClick={() => { setEntryMethod('excel'); setCurrentStep('excel_upload'); }}
                  className="p-6 bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-500 rounded-2xl transition-all cursor-pointer text-center space-y-2"
                >
                  <FileSpreadsheet className="w-8 h-8 text-blue-600 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-900">Excel Upload</h4>
                  <p className="text-xs text-slate-500 font-medium">Batch upload via .xlsx / .csv</p>
                </button>

                <button 
                  onClick={() => { setEntryMethod('manual'); setCurrentStep('preview_marks'); }}
                  className="p-6 bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-500 rounded-2xl transition-all cursor-pointer text-center space-y-2"
                >
                  <Users className="w-8 h-8 text-blue-600 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-900">Manual Entry</h4>
                  <p className="text-xs text-slate-500 font-medium">Enter marks directly in table grid</p>
                </button>
              </div>
            </div>
          )}

          {/* EXCEL UPLOAD */}
          {currentStep === 'excel_upload' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-base text-slate-900">Drag & Drop Excel File</h3>
                <button 
                  onClick={handleDownloadDynamicTemplate}
                  className="flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all border border-blue-200 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Dynamic Excel Template (.xlsx)</span>
                </button>
              </div>
              
              <div 
                onClick={() => setCurrentStep('validation')}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 rounded-2xl p-10 text-center space-y-3 cursor-pointer"
              >
                <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900">Drag & Drop Excel file here or click to Browse</h4>
                <p className="text-xs text-slate-500 font-medium">Accepted: .xlsx, .xls, .csv</p>
              </div>

              <div className="text-right">
                <button onClick={() => setCurrentStep('validation')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer">
                  Validate File Records →
                </button>
              </div>
            </div>
          )}

          {/* VALIDATION DISPLAY */}
          {currentStep === 'validation' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <h3 className="font-bold text-base text-slate-900">File Validation Result</h3>

              <div className="grid grid-cols-3 gap-3 text-xs font-bold text-center">
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200">✓ 58 Students Detected</div>
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200">✓ 58 Valid Records</div>
                <div className="p-3 bg-slate-100 text-slate-700 rounded-xl border border-slate-200">✕ 0 Errors</div>
              </div>

              <div className="text-right">
                <button onClick={() => setCurrentStep('preview_marks')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer">
                  [ Review Marks Table ] →
                </button>
              </div>
            </div>
          )}

          {/* REVIEW & EDIT MARKS TABLE */}
          {currentStep === 'preview_marks' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-base text-slate-900">Review & Edit Marks</h3>
                <span className="text-xs font-semibold text-slate-500">Subject: {selectedSubject.name}</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 font-bold text-slate-600 uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Roll No.</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3 text-center">Internal</th>
                      <th className="p-3 text-center">Practical</th>
                      <th className="p-3 text-center">Total</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {previewRows.map(row => (
                      <tr key={row.rollNo} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-red-900">{row.rollNo}</td>
                        <td className="p-3 font-bold text-slate-900">{row.name}</td>
                        <td className="p-3 text-center">
                          <input 
                            type="number" 
                            value={row.internal} 
                            onChange={(e) => handleInlineMarkChange(row.rollNo, 'internal', e.target.value)}
                            className="w-16 border border-slate-300 rounded p-1 text-center font-bold text-blue-900 outline-none" 
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input 
                            type="number" 
                            value={row.practical} 
                            onChange={(e) => handleInlineMarkChange(row.rollNo, 'practical', e.target.value)}
                            className="w-16 border border-slate-300 rounded p-1 text-center font-bold text-blue-900 outline-none" 
                          />
                        </td>
                        <td className="p-3 text-center font-bold text-slate-900">{row.total}</td>
                        <td className="p-3 text-center">
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">✓ Valid</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button onClick={() => alert('Draft Saved Successfully!')} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer">
                  Save Draft
                </button>

                <button onClick={() => setConfirmationModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-2xs cursor-pointer">
                  Submit Marks
                </button>
              </div>
            </div>
          )}

          {/* MARKS SUBMISSION PROGRESS */}
          {/* SUBMISSION SUCCESS */}
          {currentStep === 'submission_success' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-900">✓ Marks Submitted Successfully</h3>
                <p className="text-xs text-slate-500 font-medium">Submission ID: <strong className="font-mono text-blue-800">{lastSubmissionId}</strong></p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold">
                Status: 🟡 Under Review (Awaiting Admin Approval)
              </div>

              <button onClick={() => setCurrentStep('submissions_log')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer">
                View Submissions History →
              </button>
            </div>
          )}

          {/* SUBMISSIONS LOG TAB */}
          {currentStep === 'submissions_log' && (
            <SubmissionsLogTable 
              submissionsList={submissionsList}
              handleOpenCorrection={handleOpenCorrection}
              setPdfPreviewModalOpen={setPdfPreviewModalOpen}
            />
          )}

          {/* MY CLASSES TAB */}
          {currentStep === 'classes' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3">My Assigned Classes</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assignedSubjects.length > 0 ? (
                  assignedSubjects.map((subj, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">{subj.program || subj.course || 'B.Tech CSE'}</span>
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">Section {subj.section || 'A'}</span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{subj.name || subj.code}</h4>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">Semester {subj.semester || 'VIII'} • Section {subj.section || 'A'}</p>
                        <p className="text-xs text-blue-700 font-bold mt-1">62 Enrolled Students</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 text-right">
                        <button 
                          onClick={() => setCurrentStep('students')}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl cursor-pointer"
                        >
                          [ View Class Roster ]
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-8 text-center text-slate-500 font-medium">No assigned classes found in MySQL database.</div>
                )}
              </div>
            </div>
          )}

          {/* ENROLLED STUDENTS LIST TAB */}
          {currentStep === 'students' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3">Enrolled Students List</h3>
              
              <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 font-bold text-slate-600 uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Roll No.</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Program</th>
                      <th className="p-3">Semester</th>
                      <th className="p-3 text-center">Section</th>
                      <th className="p-3 text-center">Marks Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {studentsList.length > 0 ? (
                      studentsList.map(s => (
                        <tr key={s.rollNo} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-red-900">{s.rollNo}</td>
                          <td className="p-3 font-bold text-slate-900">{s.name}</td>
                          <td className="p-3 font-semibold text-slate-800">{s.program || 'B.Tech CSE'}</td>
                          <td className="p-3 font-semibold text-slate-700">{s.sem || 'VIII'}</td>
                          <td className="p-3 text-center font-bold">{s.sec || 'A'}</td>
                          <td className="p-3 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Enrolled
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-slate-500 font-medium">No enrolled students found in database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORTS TAB WITH RECHARTS */}
          {currentStep === 'reports' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3">Examination Reports & Performance Charts</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Class Average</span>
                  <h4 className="text-xl font-bold text-slate-900">78%</h4>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pass Rate</span>
                  <h4 className="text-xl font-bold text-emerald-700">100%</h4>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Highest Score</span>
                  <h4 className="text-xl font-bold text-blue-700">98 / 100</h4>
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-xs text-slate-800">Grade Distribution Breakdown (Artificial Intelligence Lab - CS401L)</h4>
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { grade: 'Grade O', students: 18 },
                      { grade: 'Grade A+', students: 24 },
                      { grade: 'Grade A', students: 16 },
                      { grade: 'Grade B+', students: 4 },
                      { grade: 'Grade B', students: 0 },
                      { grade: 'Grade F', students: 0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="grade" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="students" fill="#2563eb" radius={[4, 4, 0, 0]} name="Student Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {currentStep === 'notifications' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3">Examination System Notifications</h3>
              {submissionsList.filter(s => s.status === 'Correction Required' || s.status === 'CORRECTION REQUIRED').map((sub, i) => (
                <div key={i} className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs space-y-1">
                  <h5 className="font-bold text-red-900">⚠ Submission {sub.id} Rejected by Admin / HOD</h5>
                  <p className="text-[11px] text-red-700 font-medium">Reason: {sub.rejectionReason || 'Please verify student marks against physical attendance sheet.'}</p>
                </div>
              ))}
              {submissionsList.filter(s => s.status === 'Approved' || s.status === 'APPROVED' || s.status === 'Published').map((sub, i) => (
                <div key={i} className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
                  <h5 className="font-bold text-blue-900">Your {sub.subjectName || sub.subject || 'Marks'} submission has been approved.</h5>
                  <p className="text-[11px] text-blue-700 font-medium">Approved by System Admin on {new Date(sub.reviewedAt || Date.now()).toLocaleDateString('en-GB')}</p>
                </div>
              ))}
              {submissionsList.length === 0 && (
                <div className="p-8 text-center text-slate-500 font-medium text-xs">No notifications yet. New approval/rejection updates will appear here automatically from MySQL database.</div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* MODALS */}
      {confirmationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-md p-6 space-y-4 font-sans">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-2">Confirm Submission?</h3>
            <p className="text-xs text-slate-600 font-medium">You are about to submit marks for {selectedSubject.name} ({selectedSubject.code}).</p>

            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer pt-2">
              <input type="checkbox" checked={isConfirmed} onChange={(e) => setIsConfirmed(e.target.checked)} className="rounded" />
              <span>☑ I confirm that the entered marks have been verified.</span>
            </label>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
              <button onClick={() => setConfirmationModalOpen(false)} className="px-4 py-2 bg-slate-100 text-xs font-bold text-slate-700 rounded-xl">Cancel</button>
              <button 
                disabled={!isConfirmed}
                onClick={handleFinalSubmitConfirm}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
              >
                Submit Marks
              </button>
            </div>
          </div>
        </div>
      )}

      {correctionModalOpen && selectedRejection && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-xl p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-red-900">Correction Required — {selectedRejection.id}</h3>
              <button onClick={() => setCorrectionModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-red-900">HOD Rejection Reason:</span>
              <p className="text-red-800 font-medium">{selectedRejection.rejectionReason}</p>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900">Edit Specific Flagged Marks:</h4>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-semibold">
                <div>
                  <p className="font-bold text-slate-900">Roll No. 240104 - Mohit Kumar</p>
                  <p className="text-[11px] text-slate-500">Current Internal: <strong className="text-red-900">27 / 30</strong></p>
                </div>
                <input 
                  type="number" 
                  defaultValue={30}
                  className="w-16 bg-white border border-blue-400 rounded p-1 text-center font-bold text-blue-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Correction (Recorded in Audit Trail):</label>
                <textarea 
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
              <button onClick={() => setCorrectionModalOpen(false)} className="px-4 py-2 bg-slate-100 text-xs font-bold text-slate-700 rounded-xl">Cancel</button>
              <button 
                onClick={handleResubmitCorrection}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
              >
                Resubmit to Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT & PDF MODALS */}
      <AuditAndPdfModals 
        auditLogModalOpen={auditLogModalOpen}
        setAuditLogModalOpen={setAuditLogModalOpen}
        auditLogs={auditLogs}
        pdfPreviewModalOpen={pdfPreviewModalOpen}
        setPdfPreviewModalOpen={setPdfPreviewModalOpen}
        teacherProfile={teacherProfile}
      />

    </div>
  );
};
