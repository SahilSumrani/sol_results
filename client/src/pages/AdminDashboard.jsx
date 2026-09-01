import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { CustomExportModal } from '../components/CustomExportModal';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AnalyticsOverview } from '../components/admin/AnalyticsOverview';
import { FacultyEvaluationAudit } from '../components/admin/FacultyEvaluationAudit';
import { PendingApprovalsTable } from '../components/admin/PendingApprovalsTable';
import { FacultyDirectory } from '../components/admin/FacultyDirectory';
import { StudentDirectory } from '../components/admin/StudentDirectory';
import { SystemAuditLogs } from '../components/admin/SystemAuditLogs';

export const AdminDashboard = () => {
  const { marks, approveMarks, facultyList, addFacultyMember, students, logout, currentUser } = usePortal();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ANALYTICS'); // ANALYTICS | EVALUATIONS | APPROVALS | FACULTY | STUDENTS | AUDIT
  const [selectedIds, setSelectedIds] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Faculty Creation Modal State
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyDept, setNewFacultyDept] = useState('');
  const [newFacultySubj, setNewFacultySubj] = useState('');
  const [generatedCreds, setGeneratedCreds] = useState(null);

  // Calculations
  const pendingCount = marks.filter(m => m.status === 'PENDING').length;
  const publishedCount = marks.filter(m => m.status === 'PUBLISHED').length;

  // Real-time Analytics Data Arrays
  const weeklyTrafficData = [
    { day: 'Mon', queries: 4200, published: 120 },
    { day: 'Tue', queries: 5800, published: 340 },
    { day: 'Wed', queries: 8900, published: 510 },
    { day: 'Thu', queries: 12400, published: 890 },
    { day: 'Fri', queries: 15600, published: 1200 },
    { day: 'Sat', queries: 9800, published: 620 },
    { day: 'Sun', queries: 6400, published: 290 }
  ];

  const facultyEvaluationProgress = [
    { name: 'Dr. Rajesh Sharma', checked: 1420, verified: 1380, pending: 40, subject: 'Python Programming' },
    { name: 'Prof. Anita Desai', checked: 980, verified: 920, pending: 60, subject: 'Financial Accounting' },
    { name: 'Dr. Vikram Malhotra', checked: 1150, verified: 1150, pending: 0, subject: 'Calculus & Algebra' },
    { name: 'Dr. Meenakshi Sundaram', checked: 860, verified: 810, pending: 50, subject: 'Microeconomics' }
  ];

  const gradeDistributionData = [
    { name: 'O Grade', value: 38, color: '#2563eb' },
    { name: 'A+ Grade', value: 45, color: '#7c3aed' },
    { name: 'A Grade', value: 30, color: '#059669' },
    { name: 'B+ Grade', value: 16, color: '#ea580c' },
    { name: 'F/ER Fail', value: 4, color: '#ef4444' }
  ];

  const courseWiseData = [
    { course: 'B.A. (Prog)', checked: 24500, published: 23800 },
    { course: 'B.Com (Hons)', checked: 18200, published: 17900 },
    { course: 'B.A. English', checked: 12400, published: 12100 },
    { course: 'B.A. Pol Sci', checked: 16800, published: 16200 }
  ];

  const pendingMarks = marks.filter(m => 
    m.status === 'PENDING' && 
    (m.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     m.rollNo.includes(searchTerm) || 
     m.paperName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(pendingMarks.map(m => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    approveMarks(selectedIds);
    setSelectedIds([]);
  };

  const handleCreateFaculty = (e) => {
    e.preventDefault();
    if (!newFacultyName.trim()) return;
    const creds = addFacultyMember(newFacultyName, newFacultyDept, newFacultySubj);
    setGeneratedCreds(creds);
    setNewFacultyName('');
    setNewFacultyDept('');
    setNewFacultySubj('');
  };

  const handleExportData = (exportConfig) => {
    alert(`Downloading Custom CSV Report:\nFinancial Year: FY ${exportConfig.fy}\nCourse: ${exportConfig.course}\nSemester: ${exportConfig.sem}\nFields: ${exportConfig.fields.join(', ')}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] flex font-sans text-slate-800 antialiased">
      
      {/* Modular Sidebar Component */}
      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        pendingCount={pendingCount}
        onOpenExport={() => setExportModalOpen(true)}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Modular Header Component */}
        <AdminHeader 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onOpenExport={() => setExportModalOpen(true)}
        />

        {/* Tab Views Container */}
        <main className="p-6 space-y-6 overflow-y-auto flex-1">
          {activeTab === 'ANALYTICS' && (
            <AnalyticsOverview 
              publishedCount={publishedCount}
              pendingCount={pendingCount}
              facultyCount={facultyList.length}
              courseWiseData={courseWiseData}
              gradeDistributionData={gradeDistributionData}
              weeklyTrafficData={weeklyTrafficData}
            />
          )}

          {activeTab === 'EVALUATIONS' && (
            <FacultyEvaluationAudit 
              facultyEvaluationProgress={facultyEvaluationProgress}
              onOpenExport={() => setExportModalOpen(true)}
            />
          )}

          {activeTab === 'APPROVALS' && (
            <PendingApprovalsTable 
              pendingMarks={pendingMarks}
              selectedIds={selectedIds}
              handleSelectAll={handleSelectAll}
              handleToggleSelect={handleToggleSelect}
              handleBulkApprove={handleBulkApprove}
              approveMarks={approveMarks}
            />
          )}

          {activeTab === 'FACULTY' && (
            <FacultyDirectory 
              facultyList={facultyList}
              newFacultyName={newFacultyName}
              setNewFacultyName={setNewFacultyName}
              newFacultyDept={newFacultyDept}
              setNewFacultyDept={setNewFacultyDept}
              newFacultySubj={newFacultySubj}
              setNewFacultySubj={setNewFacultySubj}
              generatedCreds={generatedCreds}
              setGeneratedCreds={setGeneratedCreds}
              handleCreateFaculty={handleCreateFaculty}
            />
          )}

          {activeTab === 'STUDENTS' && (
            <StudentDirectory 
              onOpenExport={() => setExportModalOpen(true)}
            />
          )}

          {activeTab === 'AUDIT' && (
            <SystemAuditLogs 
              onOpenExport={() => setExportModalOpen(true)}
            />
          )}
        </main>

      </div>

      {/* Modular Export Builder Modal */}
      <CustomExportModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExportData}
      />

    </div>
  );
};
