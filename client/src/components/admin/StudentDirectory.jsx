import React from 'react';
import { Download } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

export const StudentDirectory = ({ onOpenExport }) => {
  const { students, studentsPagination, setStudentsPagination } = usePortal();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Enrolled Student Master Directory</h2>
          <p className="text-xs text-slate-500 font-medium">DU Student Database (Paginated).</p>
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
              <th className="p-3">Course Name</th>
              <th className="p-3 text-center">Semester</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students && students.length > 0 ? (
              students.map((st, idx) => (
                <tr key={st.rollNo || idx} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-red-900">{st.rollNo || '-'}</td>
                  <td className="p-3 font-semibold text-slate-900">{st.name}</td>
                  <td className="p-3 font-medium text-slate-800">{st.course || '-'}</td>
                  <td className="p-3 text-center font-bold text-blue-800">{st.semester || '-'}</td>
                  <td className="p-3 text-center">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">ENROLLED</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500 font-medium">No students registered yet in database.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <span>Page {studentsPagination.page} of {studentsPagination.totalPages || 1} ({studentsPagination.total} Total Enrolled Students)</span>
        <div className="flex space-x-2">
          <button
            disabled={studentsPagination.page <= 1}
            onClick={() => setStudentsPagination(p => ({ ...p, page: p.page - 1 }))}
            className="px-3 py-1 bg-slate-100 rounded-lg font-bold text-slate-700 disabled:opacity-50 cursor-pointer"
          >
            Previous
          </button>
          <button
            disabled={studentsPagination.page >= (studentsPagination.totalPages || 1)}
            onClick={() => setStudentsPagination(p => ({ ...p, page: p.page + 1 }))}
            className="px-3 py-1 bg-slate-100 rounded-lg font-bold text-slate-700 disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
