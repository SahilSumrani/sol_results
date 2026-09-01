import React from 'react';
import { PortalProvider, usePortal } from './context/PortalContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { TeacherLoginPage } from './pages/TeacherLoginPage';

const MainContent = () => {
  // Simple Path Router (/admin, /teacher, /)
  const path = window.location.pathname.toLowerCase();

  if (path.startsWith('/admin')) {
    return <AdminLoginPage />;
  }

  if (path.startsWith('/teacher')) {
    return <TeacherLoginPage />;
  }

  // Default Student Marksheet Portal View (Home /)
  return <StudentDashboard />;
};

export function App() {
  return (
    <PortalProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
        <Navbar />
        
        <main className="flex-1 w-full">
          <MainContent />
        </main>

        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs font-semibold text-slate-700 shadow-inner">
          <p>© 2026 School of Open Learning, University of Delhi • Academic Examination & Grading Portal</p>
        </footer>
      </div>
    </PortalProvider>
  );
}

export default App;
