import React from 'react';
import { Download } from 'lucide-react';

export const FacultyEvaluationAudit = ({ facultyEvaluationProgress, onOpenExport }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Faculty Evaluation Audit & Progress</h2>
          <p className="text-xs text-slate-500 font-medium">Track checked papers count, verified status, and subject assignments per faculty.</p>
        </div>
        <button onClick={onOpenExport} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer">
          <Download className="w-3.5 h-3.5" />
          <span>Export Evaluation Report</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-800 border-collapse">
          <thead className="bg-slate-50 font-bold uppercase text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-3">Faculty Evaluator</th>
              <th className="p-3">Subject Evaluating</th>
              <th className="p-3 text-center">Checked Papers</th>
              <th className="p-3 text-center">Verified Results</th>
              <th className="p-3 text-center">Pending Review</th>
              <th className="p-3 text-center">Progress %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {facultyEvaluationProgress && facultyEvaluationProgress.length > 0 ? (
              facultyEvaluationProgress.map((f, idx) => {
                const checkedCount = f.checked || 1;
                const percent = Math.round(((f.verified || 0) / checkedCount) * 100);
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{f.name}</td>
                    <td className="p-3 font-semibold text-slate-800">{f.subject}</td>
                    <td className="p-3 text-center font-bold text-blue-700">{f.checked}</td>
                    <td className="p-3 text-center font-bold text-emerald-700">{f.verified}</td>
                    <td className="p-3 text-center font-bold text-amber-700">{f.pending}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="font-bold text-[11px] text-slate-700">{percent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-500 font-medium">No faculty evaluation progress recorded yet in MySQL database.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
