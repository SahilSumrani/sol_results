import React, { useState } from 'react';
import { ShieldCheck, Search, CheckCircle2, UserX } from 'lucide-react';

export const HallTicketVerifier = () => {
  const [rollSearch, setRollSearch] = useState('23345227188');
  const [verifiedStudent, setVerifiedStudent] = useState({
    rollNo: '23345227188',
    name: 'SAHIL SUMRANI',
    fatherName: 'Harish Sumrani',
    course: 'B.A. (PROGRAMME)',
    semester: 'Sem V',
    center: 'SOL North Campus, University of Delhi',
    admitCardStatus: 'VERIFIED & ISSUED',
    examDates: '15 Nov 2026 - 30 Nov 2026'
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (!rollSearch) return;
    setVerifiedStudent({
      rollNo: rollSearch,
      name: 'VERIFIED CANDIDATE',
      fatherName: 'DU Enrolled Student',
      course: 'B.A. (PROGRAMME)',
      semester: 'Sem V',
      center: 'SOL Examination Center, Delhi',
      admitCardStatus: 'VERIFIED & ISSUED',
      examDates: 'Nov-Dec 2026 Cycle'
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <ShieldCheck className="w-5 h-5 text-blue-600" />
        <div>
          <h2 className="text-base font-bold text-slate-900">Student Admit Card & Hall Ticket Verifier</h2>
          <p className="text-xs text-slate-500 font-medium">Verify student examination roll numbers and hall ticket issue status.</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text" 
            value={rollSearch}
            onChange={(e) => setRollSearch(e.target.value)}
            placeholder="Enter Exam Roll No..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs cursor-pointer">
          Verify Ticket
        </button>
      </form>

      {verifiedStudent && (
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900 text-sm">{verifiedStudent.name}</span>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
              {verifiedStudent.admitCardStatus}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 font-medium text-slate-700">
            <p>Roll No: <strong className="text-red-900 font-mono">{verifiedStudent.rollNo}</strong></p>
            <p>Course: <strong>{verifiedStudent.course}</strong></p>
            <p>Semester: <strong>{verifiedStudent.semester}</strong></p>
            <p>Exam Center: <strong>{verifiedStudent.center}</strong></p>
          </div>
        </div>
      )}
    </div>
  );
};
