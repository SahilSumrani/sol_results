import React from 'react';
import { Download } from 'lucide-react';

export const SystemAuditLogs = ({ onOpenExport }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">System Security Audit Logs</h2>
          <p className="text-xs text-slate-500 font-medium">Immutable audit trail of admin publishing, faculty logins, and mark uploads.</p>
        </div>
        <button 
          onClick={onOpenExport}
          className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl border border-slate-300 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Log</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-800 border-collapse">
          <thead className="bg-slate-50 font-bold uppercase text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">User</th>
              <th className="p-3">Action Event</th>
              <th className="p-3">Event Details</th>
              <th className="p-3 text-center">Security Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            <tr className="hover:bg-slate-50">
              <td className="p-3 font-mono text-slate-500">Today, 10:15 PM</td>
              <td className="p-3 font-bold text-slate-900">System Admin</td>
              <td className="p-3 font-semibold text-blue-700">MARKS_PUBLISHED</td>
              <td className="p-3 text-slate-700">Approved 34 student paper grades for Roll 23345227188</td>
              <td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">VERIFIED</span></td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="p-3 font-mono text-slate-500">Today, 09:45 PM</td>
              <td className="p-3 font-bold text-slate-900">Dr. Rajesh Sharma</td>
              <td className="p-3 font-semibold text-purple-700">FACULTY_LOGIN</td>
              <td className="p-3 text-slate-700">Logged in via unique ID rajesh_sharma</td>
              <td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">VERIFIED</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
