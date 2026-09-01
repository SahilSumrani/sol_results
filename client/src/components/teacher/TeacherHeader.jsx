import React from 'react';
import { Menu, Search, Award } from 'lucide-react';

export const TeacherHeader = ({ 
  currentUser, 
  searchTerm, 
  setSearchTerm, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-64 sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student roll no, paper code, or status..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-slate-800 flex items-center space-x-2">
          <Award className="w-4 h-4 text-blue-600" />
          <span>Faculty: {currentUser?.name || 'Dr. Rajesh Sharma'}</span>
        </div>
      </div>
    </header>
  );
};
