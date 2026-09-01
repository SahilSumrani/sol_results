import React, { useState } from 'react';
import { 
  Users, Upload, LayoutDashboard, LogOut 
} from 'lucide-react';

export const TeacherSidebar = ({ 
  activeTab, 
  setActiveTab, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  onLogout 
}) => {
  const navItems = [
    { id: 'STUDENTS', label: 'Enrolled Students & Marksheet', icon: Users },
    { id: 'ANALYTICS', label: 'Evaluation Analytics & Graphs', icon: LayoutDashboard },
    { id: 'UPLOAD', label: 'Excel Marks Upload', icon: Upload },
  ];

  return (
    <aside className={`
      fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between transition-transform duration-300 ease-in-out min-h-screen
      ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-3 px-1 border-b border-slate-200 pb-4">
          <img src="/new_logo.png" alt="SOL Logo" className="h-10 w-auto object-contain" />
          <div>
            <h2 className="font-bold text-xs text-slate-900 leading-tight">School of Open Learning</h2>
            <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">Faculty Portal</span>
          </div>
        </div>

        {/* Navigation - Clean & Simple 3 Tabs Only */}
        <nav className="space-y-1 text-xs font-medium">
          <p className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Faculty Options</p>
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 shadow-2xs' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-5 border-t border-slate-200">
        <button 
          onClick={onLogout} 
          className="w-full bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-bold text-xs p-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer border border-slate-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Faculty</span>
        </button>
      </div>
    </aside>
  );
};
