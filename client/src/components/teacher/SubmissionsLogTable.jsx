import React from 'react';

export const SubmissionsLogTable = ({ submissionsList, handleOpenCorrection, setPdfPreviewModalOpen }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="font-bold text-base text-slate-900">Submissions History & Admin Status</h3>
        <button 
          onClick={() => setPdfPreviewModalOpen(true)}
          className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer"
        >
          <span>Generate PDF Report</span>
        </button>
      </div>
      
      <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 font-bold text-slate-600 uppercase border-b border-slate-200">
            <tr>
              <th className="p-3">Submission ID</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Class</th>
              <th className="p-3">Exam Type</th>
              <th className="p-3 text-center">Students</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {submissionsList.length > 0 ? (
              submissionsList.map(sub => (
                <tr key={sub.id} className={sub.status === 'Correction Required' ? 'bg-red-50/60' : 'hover:bg-slate-50'}>
                  <td className="p-3 font-mono font-bold text-blue-800">{sub.id}</td>
                  <td className="p-3 font-bold text-slate-900">{sub.subjectName || sub.subject || 'Artificial Intelligence Lab'}</td>
                  <td className="p-3 font-semibold text-slate-700">{sub.course || sub.class || 'B.Tech CSE'}</td>
                  <td className="p-3 font-semibold text-slate-600">{sub.examType || 'Practical'}</td>
                  <td className="p-3 text-center font-bold">{sub.totalStudents || sub.students || 0}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      sub.status === 'Approved' || sub.status === 'Published' || sub.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      sub.status === 'Correction Required' || sub.status === 'CORRECTION REQUIRED' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {sub.status === 'Correction Required' || sub.status === 'CORRECTION REQUIRED' ? (
                      <button 
                        onClick={() => handleOpenCorrection(sub)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] px-3 py-1 rounded-lg shadow-2xs cursor-pointer"
                      >
                        Fix & Resubmit
                      </button>
                    ) : (
                      <button onClick={() => setPdfPreviewModalOpen(true)} className="text-blue-700 hover:underline font-bold text-xs">PDF Summary</button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-500 font-medium">No submission logs found in MySQL database.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
