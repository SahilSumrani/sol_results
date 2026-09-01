import React from 'react';
import { History, Printer } from 'lucide-react';

export const AuditAndPdfModals = ({ 
  auditLogModalOpen, setAuditLogModalOpen, auditLogs,
  pdfPreviewModalOpen, setPdfPreviewModalOpen, teacherProfile 
}) => {
  return (
    <>
      {/* MARKS AUDIT HISTORY MODAL */}
      {auditLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-3xl p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <History className="w-5 h-5 text-blue-600" />
                <span>Complete Marks Audit History Trail</span>
              </h3>
              <button onClick={() => setAuditLogModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs max-h-80 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 font-bold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Date & Time</th>
                    <th className="p-2.5">Submission ID</th>
                    <th className="p-2.5">Roll No.</th>
                    <th className="p-2.5">Field</th>
                    <th className="p-2.5 text-center">Prev</th>
                    <th className="p-2.5 text-center font-bold text-emerald-900">New</th>
                    <th className="p-2.5">Modified By</th>
                    <th className="p-2.5">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono text-[10px] text-slate-500">{log.date}</td>
                      <td className="p-2.5 font-mono font-bold text-blue-800">{log.submissionId}</td>
                      <td className="p-2.5 font-mono font-bold text-red-900">{log.rollNo}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{log.field}</td>
                      <td className="p-2.5 text-center text-slate-400">{log.prevVal}</td>
                      <td className="p-2.5 text-center font-bold text-emerald-800">{log.newVal}</td>
                      <td className="p-2.5 font-bold text-slate-900">{log.user}</td>
                      <td className="p-2.5 text-slate-600">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right pt-2 border-t border-slate-200">
              <button onClick={() => setAuditLogModalOpen(false)} className="px-5 py-2 bg-slate-100 text-xs font-bold text-slate-800 rounded-xl">Close Audit Log</button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL PDF SUMMARY REPORT PREVIEW MODAL */}
      {pdfPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-2xl p-6 space-y-5 font-sans my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900">Official Practical Marks Summary Report</h3>
              <button onClick={() => setPdfPreviewModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-xs font-mono">
              <div className="text-center space-y-1 border-b border-slate-300 pb-3">
                <h2 className="font-black text-base text-slate-900 uppercase">UNIVERSITY EXAMINATION BRANCH</h2>
                <h3 className="font-bold text-xs text-blue-900 uppercase">PRACTICAL & INTERNAL MARKS REPORT</h3>
                <p className="text-[10px] text-slate-500 font-sans">Academic Year: 2026-27 | Semester VIII</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                <p>Subject: <strong>Artificial Intelligence (CS401)</strong></p>
                <p>Program: <strong>B.Tech CSE - 4th Year</strong></p>
                <p>Total Students: <strong>62</strong></p>
                <p>Status: <strong className="text-emerald-700">APPROVED BY HOD</strong></p>
              </div>

              <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                <thead className="bg-slate-200 font-bold">
                  <tr>
                    <th className="p-2 border border-slate-300">Roll No</th>
                    <th className="p-2 border border-slate-300">Student Name</th>
                    <th className="p-2 border border-slate-300 text-center">Marks</th>
                    <th className="p-2 border border-slate-300 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="p-2 border border-slate-300">240101</td><td className="p-2 border border-slate-300">Aman Kumar</td><td className="p-2 border border-slate-300 text-center">35 / 40</td><td className="p-2 border border-slate-300 text-center font-bold">A</td></tr>
                  <tr><td className="p-2 border border-slate-300">240102</td><td className="p-2 border border-slate-300">Rahul Sharma</td><td className="p-2 border border-slate-300 text-center">38 / 40</td><td className="p-2 border border-slate-300 text-center font-bold">A+</td></tr>
                </tbody>
              </table>

              <div className="flex justify-between pt-4 text-[10px] font-sans text-slate-600">
                <p>Submitted By: <strong>{teacherProfile?.name || 'Dr. Rahul Sharma'}</strong></p>
                <p>Approved By: <strong>HOD Computer Science</strong></p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={() => window.print()} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center space-x-1.5">
                <Printer className="w-4 h-4" />
                <span>Print Official PDF</span>
              </button>
              <button onClick={() => setPdfPreviewModalOpen(false)} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
