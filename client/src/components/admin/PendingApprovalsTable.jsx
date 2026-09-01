import React from 'react';
import { Check } from 'lucide-react';

export const PendingApprovalsTable = ({ 
  pendingMarks, 
  selectedIds, 
  handleSelectAll, 
  handleToggleSelect, 
  handleBulkApprove, 
  approveMarks 
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pending Marks Approval Queue</h2>
          <p className="text-xs text-slate-500 font-medium">Review and publish faculty uploaded marks to student portals.</p>
        </div>

        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkApprove}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Approve Selected ({selectedIds.length})</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-800 border-collapse">
          <thead className="bg-slate-50 font-bold uppercase text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-3 text-center">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll} 
                  checked={selectedIds.length === pendingMarks.length && pendingMarks.length > 0} 
                  className="rounded border-slate-300"
                />
              </th>
              <th className="p-3">Roll No.</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Paper Code</th>
              <th className="p-3">Paper Name</th>
              <th className="p-3 text-center">Sem</th>
              <th className="p-3 text-center">Net Grade</th>
              <th className="p-3 text-center">Grade Point</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {pendingMarks.length > 0 ? (
              pendingMarks.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(m.id)} 
                      onChange={() => handleToggleSelect(m.id)} 
                      className="rounded border-slate-300"
                    />
                  </td>
                  <td className="p-3 font-mono font-bold text-red-900">{m.rollNo}</td>
                  <td className="p-3 font-semibold text-slate-900">{m.studentName}</td>
                  <td className="p-3 font-mono text-slate-700">{m.paperCode}</td>
                  <td className="p-3 font-medium text-slate-800">{m.paperName}</td>
                  <td className="p-3 text-center font-semibold">{m.sem}</td>
                  <td className="p-3 text-center font-bold text-blue-800">{m.netGrade}</td>
                  <td className="p-3 text-center font-semibold">{m.gradePoint}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => approveMarks([m.id])}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="p-8 text-center text-slate-500 font-medium">
                  No pending marks queue found. All uploaded marks are published!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
