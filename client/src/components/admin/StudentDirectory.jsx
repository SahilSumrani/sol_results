import React from 'react';
import { Download } from 'lucide-react';

export const StudentDirectory = ({ onOpenExport }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Enrolled Student Master Directory</h2>
          <p className="text-xs text-slate-500 font-medium">DU NEP B.A. Programme Student Database.</p>
        </div>
        <button onClick={onOpenExport} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer">
          <Download className="w-3.5 h-3.5" />
          <span>Export Student List (CSV)</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-800 border-collapse">
          <thead className="bg-slate-50 font-bold uppercase text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-3">Roll No.</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Enrollment No.</th>
              <th className="p-3">Course Name</th>
              <th className="p-3 text-center">Semester</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr className="hover:bg-slate-50">
              <td className="p-3 font-mono font-bold text-red-900">23345227188</td>
              <td className="p-3 font-semibold text-slate-900">SAHIL SUMRANI</td>
              <td className="p-3 font-mono text-slate-700">23SOLNBAPR037644</td>
              <td className="p-3 font-medium text-slate-800">B.A. (PROGRAMME)</td>
              <td className="p-3 text-center font-bold text-blue-800">V</td>
              <td className="p-3 text-center">
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">PASSED</span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="p-3 font-mono font-bold text-red-900">23345227189</td>
              <td className="p-3 font-semibold text-slate-900">SIMRAN KAPOOR</td>
              <td className="p-3 font-mono text-slate-700">23SOLNBAPR037645</td>
              <td className="p-3 font-medium text-slate-800">B.A. (PROGRAMME)</td>
              <td className="p-3 text-center font-bold text-blue-800">V</td>
              <td className="p-3 text-center">
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">PASSED</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
