import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { ProductionTeacherDashboard } from '../components/teacher/ProductionTeacherDashboard';
import { ProductionMarksUploadModule } from '../components/teacher/ProductionMarksUploadModule';

export const TeacherDashboard = () => {
  const { logout } = usePortal();
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard | upload

  if (currentView === 'upload') {
    return (
      <div className="w-full min-h-screen bg-slate-50 p-6">
        <ProductionMarksUploadModule onBack={() => setCurrentView('dashboard')} />
      </div>
    );
  }

  return (
    <ProductionTeacherDashboard onLogout={logout} />
  );
};
