import React, { useState } from 'react';
import { UserCheck, CheckCircle, XCircle } from 'lucide-react';

export const ReEvaluationPanel = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchReEvaluations = async () => {
      setLoading(true);
      try {
        const API_BASE = import.meta.env.PROD ? 'https://sol-results.onrender.com' : '';
        const res = await fetch(`${API_BASE}/api/teacher/submissions`);
        if (res.ok) {
          const data = await res.json();
          if (data.students && data.students.length > 0) {
            setQueries(data.students.slice(0, 2).map((s, idx) => ({
              id: `q${idx + 1}`,
              rollNo: s.rollNo,
              name: s.name,
              subject: 'Artificial Intelligence',
              currentGrade: 'B+',
              requestedReview: 'Theory Re-checking requested',
              status: 'PENDING'
            })));
          }
        }
      } catch (err) {
        console.log('Re-evaluation fetch fallback active:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReEvaluations();
  }, []);

  const handleAction = (id, newStatus) => {
    setQueries(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <UserCheck className="w-5 h-5 text-blue-600" />
        <div>
          <h2 className="text-base font-bold text-slate-900">Student Grade Re-Evaluation & Review Panel</h2>
          <p className="text-xs text-slate-500 font-medium">Review and resolve student re-checking requests for theory and internal marks.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-800 border-collapse">
          <thead className="bg-slate-50 font-bold uppercase text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-3">Roll No.</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Subject</th>
              <th className="p-3 text-center">Grade</th>
              <th className="p-3">Review Request</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {queries.map((q) => (
              <tr key={q.id} className="hover:bg-slate-50">
                <td className="p-3 font-mono font-bold text-red-900">{q.rollNo}</td>
                <td className="p-3 font-bold text-slate-900">{q.name}</td>
                <td className="p-3 font-semibold text-slate-800">{q.subject}</td>
                <td className="p-3 text-center font-bold text-blue-800">{q.currentGrade}</td>
                <td className="p-3 text-slate-600">{q.requestedReview}</td>
                <td className="p-3 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    q.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {q.status}
                  </span>
                </td>
                <td className="p-3 text-center space-x-2">
                  {q.status === 'PENDING' ? (
                    <>
                      <button 
                        onClick={() => handleAction(q.id, 'RESOLVED')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1 rounded cursor-pointer"
                      >
                        Approve Change
                      </button>
                      <button 
                        onClick={() => handleAction(q.id, 'REJECTED')}
                        className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-bold text-xs px-2.5 py-1 rounded cursor-pointer"
                      >
                        Keep Grade
                      </button>
                    </>
                  ) : (
                    <span className="text-slate-400 font-semibold">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
