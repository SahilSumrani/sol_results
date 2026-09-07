import React from 'react';
import { Download } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

export const SystemAuditLogs = ({ onOpenExport }) => {
  const { logs, logsPagination, setLogsPagination } = usePortal();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">System Security Audit Logs</h2>
          <p className="text-xs text-slate-500 font-medium">Immutable audit trail of admin publishing, faculty logins, and mark corrections (Paginated).</p>
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
              <th className="p-3">Submission ID</th>
              <th className="p-3">Roll No</th>
              <th className="p-3">Modified By</th>
              <th className="p-3">Previous → New Marks</th>
              <th className="p-3">Correction Reason</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {logs && logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-mono font-bold text-indigo-700">{log.submissionId}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">{log.rollNo}</td>
                  <td className="p-3 font-bold text-slate-800">{log.modifiedBy}</td>
                  <td className="p-3 font-mono text-slate-700">{log.previousValue} → {log.newValue}</td>
                  <td className="p-3 text-slate-700 font-semibold">{log.reason}</td>
                  <td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">RECORDED</span></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-500 font-medium">No audit logs recorded yet in database.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <span>Page {logsPagination.page} of {logsPagination.totalPages || 1} ({logsPagination.total} Total Audit Records)</span>
        <div className="flex space-x-2">
          <button
            disabled={logsPagination.page <= 1}
            onClick={() => setLogsPagination(p => ({ ...p, page: p.page - 1 }))}
            className="px-3 py-1 bg-slate-100 rounded-lg font-bold text-slate-700 disabled:opacity-50 cursor-pointer"
          >
            Previous
          </button>
          <button
            disabled={logsPagination.page >= (logsPagination.totalPages || 1)}
            onClick={() => setLogsPagination(p => ({ ...p, page: p.page + 1 }))}
            className="px-3 py-1 bg-slate-100 rounded-lg font-bold text-slate-700 disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
