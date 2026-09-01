import React from 'react';
import { usePortal } from '../context/PortalContext';
import { LogOut } from 'lucide-react';

export const Navbar = () => {
  const { currentUser, logout } = usePortal();

  // If user is on Admin or Teacher portal, don't show duplicate top navbar
  if (currentUser && currentUser.role !== 'STUDENT') {
    return null;
  }

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: SOL Logo & Header branding */}
        <div className="flex items-center space-x-3">
          <img 
            src="/new_logo.png" 
            alt="School of Open Learning SOL Logo" 
            className="h-12 w-auto object-contain"
          />
          <div>
            <h1 className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight font-serif">
              School of Open Learning
            </h1>
            <p className="text-[11px] text-blue-800 font-semibold uppercase tracking-wider">
              Results (Semester/Annual Examination)
            </p>
          </div>
        </div>

      </div>
    </header>
  );
};
