import React, { useState } from 'react';
import { Check, X, Eye, AlertCircle, FileText } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

export const PendingApprovalsTable = () => {
  const { submissions, reviewSubmission } = usePortal();
  const [inspectSubmission, setInspectSubmission] = useState(null);
  const [inspectMarks, setInspectMarks] = useState([]);
  const [rejectingSubId, setRejectingSubId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loadingMarks, setLoadingMarks] = useState(false);

  const reviewQueue = submissions.filter(s => s.status === 'UNDER REVIEW' || s.status === 'SUBMITTED');

  const handleOpenReview = async (sub) => {
    setInspectSubmission(sub);
    setLoadingMarks(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/submission/${sub.id}/marks`);
      if (res.ok) {
        const data = await res.json();
        setInspectMarks(data);
      } else {
        setInspectMarks([]);
      }
    } catch (err) {
      setInspectMarks([]);
    }
    setLoadingMarks(false);
  };

  const handleApprove = async (id) => {
    await reviewSubmission(id, 'APPROVE');
    setInspectSubmission(null);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Mandatory Rejection Reason is required!');
      return;
    }
    await reviewSubmission(rejectingSubId, 'REJECT', rejectionReason);
    setRejectingSubId(null);
    setRejectionReason('');
    setInspectSubmission(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Admin Approval Queue
            </h2>
            <p className="text-xs text-slate-500 font-medium">Review and publish teacher uploaded marks to student portals.</p>
          </div>
          <div className="bg-amber-50 text-amber-800 text-xs px-3 py-1.5 rounded-full font-semibold border border-amber-200 self-start sm:self-auto">
            {reviewQueue.length} Pending Approvals
          </div>
        </div>

        {reviewQueue.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {reviewQueue.map((sub) => (
              <div key={sub.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50 hover:bg-white transition-all space-y-4 shadow-2xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-indigo-100 text-indigo-800 font-mono text-xs px-2 py-0.5 rounded-md font-bold">
                      {sub.subjectCode}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{sub.subjectName}</h3>
                    <p className="text-xs text-slate-600 font-medium">{sub.teacherName} • ({sub.teacherEmail || 'Teacher'})</p>
                  </div>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                    UNDER REVIEW
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs border-y border-slate-200 py-3 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Course / Sem</span>
                    <span className="font-semibold text-slate-800">{sub.course} • Sem {sub.semester} (Sec {sub.section || 'A'})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Students</span>
                    <span className="font-semibold text-slate-800">{sub.totalStudents} Enrolled</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Max Marks</span>
                    <span className="font-semibold text-slate-800">{sub.maxMarks || 40} Marks ({sub.examType || 'Practical'})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleOpenReview(sub)}
                    className="flex items-center space-x-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Review Marks</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setRejectingSubId(sub.id)}
                      className="flex items-center space-x-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border border-red-200"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(sub.id)}
                      className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 font-medium">
            No pending submissions in approval queue. All marks are published!
          </div>
        )}
      </div>

      {/* Review Marks Modal */}
      {inspectSubmission && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{inspectSubmission.subjectCode} - {inspectSubmission.subjectName}</h3>
                <p className="text-xs text-slate-500">{inspectSubmission.teacherName} • {inspectSubmission.course} • Sem {inspectSubmission.semester} • Section {inspectSubmission.section || 'A'}</p>
              </div>
              <button onClick={() => setInspectSubmission(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
              {loadingMarks ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium">Loading marks data...</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-600">
                    <tr>
                      <th className="p-3">Roll No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3 text-center">Marks Obtained</th>
                      <th className="p-3 text-center">Max Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {inspectMarks.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-indigo-900">{m.rollNo}</td>
                        <td className="p-3 font-semibold text-slate-800">{m.studentName || m.name}</td>
                        <td className="p-3 text-center font-bold text-emerald-700">{m.prObt || m.thObt || m.marks}</td>
                        <td className="p-3 text-center font-medium text-slate-500">{inspectSubmission.maxMarks || 40}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setRejectingSubId(inspectSubmission.id)}
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Reject Submission
              </button>
              <button
                onClick={() => handleApprove(inspectSubmission.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-2xs"
              >
                Approve & Publish Result
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Rejection Reason Modal */}
      {rejectingSubId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Reject Submission & Request Correction</h3>
            </div>
            <p className="text-xs text-slate-600">
              Please provide a mandatory clear reason for rejection so the faculty teacher can verify and correct marks.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder='e.g., "Roll No. 240104 marks need verification against lab record."'
              rows={3}
              className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setRejectingSubId(null); setRejectionReason(''); }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Reject & Send to Teacher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

