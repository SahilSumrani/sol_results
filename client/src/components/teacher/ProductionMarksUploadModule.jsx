import React, { useState } from 'react';
import { 
  Upload, Download, AlertTriangle, CheckCircle2, XCircle, FileSpreadsheet, ArrowLeft, RefreshCw, Save 
} from 'lucide-react';

export const ProductionMarksUploadModule = ({ onBack }) => {
  const [activeMethod, setActiveMethod] = useState('excel'); // excel | manual
  const [uploadStep, setUploadStep] = useState(1); // 1: select, 2: upload/validate, 3: preview
  
  // Selection States
  const [academicYear, setAcademicYear] = useState('2026–27');
  const [course, setCourse] = useState('B.Tech');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('4th Year');
  const [semester, setSemester] = useState('VIII');
  const [subject, setSubject] = useState('Artificial Intelligence (CS401)');
  const [examType, setExamType] = useState('Internal Assessment');
  const [maxMarks, setMaxMarks] = useState(30);
  const [passingMarks, setPassingMarks] = useState(12);

  // File Validation State
  const [fileUploaded, setFileUploaded] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Editable Student Preview Data (TanStack Style Table Grid)
  const [previewRows, setPreviewRows] = useState([
    { id: '1', select: true, rollNo: '240101', name: 'Aman Kumar', internal: 24, practical: 18, total: 42, grade: 'A', status: 'Valid', errorMsg: null },
    { id: '2', select: true, rollNo: '240102', name: 'Priya Sharma', internal: 28, practical: 20, total: 48, grade: 'O', status: 'Valid', errorMsg: null },
    { id: '3', select: true, rollNo: '240145', name: 'Rohan Verma', internal: 35, practical: 15, total: 50, grade: 'F', status: 'Invalid', errorMsg: 'Marks cannot exceed maximum marks of 30.' },
    { id: '4', select: true, rollNo: '240146', name: 'Sneha Gupta', internal: 22, practical: 16, total: 38, grade: 'B+', status: 'Valid', errorMsg: null }
  ]);

  const handleFileUpload = (e) => {
    e.preventDefault();
    setFileUploaded(true);
    // Simulate File Parse & Zod Validation
    setValidationResult({
      detected: 58,
      valid: 55,
      missing: 2,
      invalid: 1,
      errors: [
        { row: 14, rollNo: '240145', msg: 'Marks (35) cannot exceed maximum marks of 30.' }
      ]
    });
  };

  const handleInlineMarksEdit = (id, newMarks) => {
    const numericMarks = Number(newMarks);
    setPreviewRows(prev => prev.map(row => {
      if (row.id === id) {
        const isExceeded = numericMarks > maxMarks;
        return {
          ...row,
          internal: numericMarks,
          status: isExceeded ? 'Invalid' : 'Valid',
          errorMsg: isExceeded ? `Marks cannot exceed ${maxMarks}.` : null
        };
      }
      return row;
    }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Upload Student Marks</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Upload, review and submit marks for your assigned subjects.</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* STEP 1: SELECT EXAMINATION CONFIGURATION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider text-blue-900">Step 1 — Select Examination</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-500 mb-1">Academic Year</label>
            <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold outline-none">
              <option value="2026–27">2026–27</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Course</label>
            <select value={course} onChange={(e) => setCourse(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold outline-none">
              <option value="B.Tech">B.Tech</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold outline-none">
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Year / Semester</label>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold outline-none">
              <option value="VIII">4th Year (Semester VIII)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold outline-none">
              <option value="Artificial Intelligence (CS401)">Artificial Intelligence (CS401)</option>
              <option value="Machine Learning (CS402)">Machine Learning (CS402)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Examination Type</label>
            <select value={examType} onChange={(e) => setExamType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold outline-none">
              <option value="Internal Assessment">Internal Assessment</option>
              <option value="Mid Semester">Mid Semester</option>
              <option value="End Semester">End Semester</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-6 pt-2 border-t border-slate-100 text-xs font-bold text-slate-700">
          <span>Max Marks: <strong className="text-blue-700">{maxMarks}</strong></span>
          <span>Passing Marks: <strong className="text-emerald-700">{passingMarks}</strong></span>
        </div>
      </div>

      {/* STEP 2: SELECT ENTRY METHOD (TABS) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider text-blue-900">Step 2 — Select Mark Entry Method</h3>
          
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button 
              onClick={() => setActiveMethod('excel')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeMethod === 'excel' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Excel Upload
            </button>
            <button 
              onClick={() => setActiveMethod('manual')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeMethod === 'manual' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Manual Entry
            </button>
          </div>
        </div>

        {/* EXCEL UPLOAD TAB */}
        {activeMethod === 'excel' && (
          <div className="space-y-6">
            {!fileUploaded ? (
              <div 
                onClick={handleFileUpload}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 rounded-2xl p-10 text-center space-y-3 cursor-pointer transition-all"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Drag & drop your Excel file here</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Accepted: .xlsx, .xls, .csv (Max 10 MB)</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs cursor-pointer">
                  Browse File
                </button>
              </div>
            ) : (
              /* EXCEL VALIDATION RESULT */
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Marks_Upload_CS401.xlsx Parsed Successfully</h4>
                      <p className="text-[11px] text-slate-500 font-semibold">{validationResult.detected} Records Detected</p>
                    </div>
                  </div>
                  <button onClick={() => setFileUploaded(false)} className="text-xs font-bold text-blue-700 hover:underline">Re-upload</button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                  <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200">
                    ✓ {validationResult.valid} Valid Records
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200">
                    ⚠ {validationResult.missing} Missing Marks
                  </div>
                  <div className="p-3 bg-red-50 text-red-900 rounded-xl border border-red-200">
                    ✕ {validationResult.invalid} Critical Error
                  </div>
                </div>

                {validationResult.errors.map((err, i) => (
                  <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center justify-between">
                    <span><strong>Row {err.row}</strong> (Roll: {err.rollNo}): {err.msg}</span>
                    <span className="font-bold uppercase text-[10px] bg-red-200 px-2 py-0.5 rounded">Error</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-blue-700">
                <Download className="w-4 h-4" />
                <span>Download Official Excel Template (.xlsx)</span>
              </button>
            </div>
          </div>
        )}

        {/* MANUAL ENTRY TAB */}
        {activeMethod === 'manual' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium">Directly enter student marks into the grid below. Draft autosaves every 15 seconds.</p>
          </div>
        )}
      </div>

      {/* MARKS PREVIEW & EDITABLE GRID TABLE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="font-extrabold text-sm text-slate-900">Review Marks Before Final Submission</h3>
          <span className="text-xs font-bold text-slate-500">Draft saved 12 seconds ago</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-800 border-collapse">
            <thead className="bg-slate-50 font-bold uppercase text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3 w-10 text-center"><input type="checkbox" className="rounded" defaultChecked /></th>
                <th className="p-3">Roll No.</th>
                <th className="p-3">Student Name</th>
                <th className="p-3 text-center">Internal Marks (Max 30)</th>
                <th className="p-3 text-center">Practical</th>
                <th className="p-3 text-center">Total</th>
                <th className="p-3 text-center">Grade</th>
                <th className="p-3 text-center">Validation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {previewRows.map((row) => (
                <tr key={row.id} className={row.status === 'Invalid' ? 'bg-red-50/50' : 'hover:bg-slate-50'}>
                  <td className="p-3 text-center"><input type="checkbox" className="rounded" defaultChecked={row.select} /></td>
                  <td className="p-3 font-mono font-bold text-red-900">{row.rollNo}</td>
                  <td className="p-3 font-bold text-slate-900">{row.name}</td>

                  {/* Inline Cell Edit for Marks */}
                  <td className="p-3 text-center">
                    <input 
                      type="number"
                      value={row.internal}
                      onChange={(e) => handleInlineMarksEdit(row.id, e.target.value)}
                      className={`w-16 border rounded p-1 text-center font-bold outline-none ${
                        row.status === 'Invalid' ? 'border-red-500 text-red-900 bg-red-100' : 'border-slate-300 text-blue-900 bg-white'
                      }`}
                    />
                  </td>

                  <td className="p-3 text-center font-bold text-slate-700">{row.practical}</td>
                  <td className="p-3 text-center font-bold text-slate-900">{row.total}</td>
                  <td className="p-3 text-center"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">{row.grade}</span></td>
                  
                  <td className="p-3 text-center">
                    {row.status === 'Valid' ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Valid</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full" title={row.errorMsg}>
                        {row.errorMsg}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer">
            Save Draft
          </button>

          <button 
            onClick={() => alert('Marks Submitted Successfully! Submission ID: SUB-2026-00182')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs cursor-pointer"
          >
            Submit Marks
          </button>
        </div>
      </div>

    </div>
  );
};
