import React from 'react';
import { Download } from 'lucide-react';

export const StudentDirectory = ({ onOpenExport }) => {
  const [students, setStudents] = React.useState([]);

  React.useEffect(() => {
    const fetchDirectory = async () => {
      try {
        const API_BASE = 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/admin/students`);
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (err) {
        console.log('StudentDirectory fetch error:', err.message);
      }
    };
    fetchDirectory();
  }, []);

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
            {students && students.length > 0 ? (
              students.map((st, idx) => (
                <tr key={st.rollNo || idx} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-red-900">{st.rollNo || `24010${st.id}`}</td>
                  <td className="p-3 font-semibold text-slate-900">{st.name}</td>
                  <td className="p-3 font-mono text-slate-700">23SOLNBAPR{String(st.rollNo || st.id).slice(-6)}</td>
                  <td className="p-3 font-medium text-slate-800">{st.course || st.program || 'B.Tech CSE'}</td>
                  <td className="p-3 text-center font-bold text-blue-800">{st.sem || 'VIII'}</td>
                  <td className="p-3 text-center">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">ENROLLED</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-500 font-medium">No students registered yet in MySQL database.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
