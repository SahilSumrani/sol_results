import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Upload, CheckCircle2, AlertTriangle, XCircle, FileSpreadsheet, Eye, Send, RotateCcw } from 'lucide-react';
import { usePortal } from '../context/PortalContext';

export const TeacherMarksUpload = ({ selectedSubject, onCloseSuccess }) => {
  const { students, marks, submitBulkMarks } = usePortal();

  const [uploadedData, setUploadedData] = useState(null);
  const [validatedRows, setValidatedRows] = useState([]);
  const [hasErrors, setHasErrors] = useState(false);
  const [errorSummary, setErrorSummary] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter students for the current subject's course/year/semester
  const classStudents = students.filter(
    s => s.course === (selectedSubject?.course || 'B.A. (PROGRAMME)') && 
         s.year === (selectedSubject?.year || '2026') && 
         s.semester === (selectedSubject?.semester || 'V')
  );

  // Download Pre-filled Excel Template
  const handleDownloadTemplate = () => {
    const templateData = classStudents.map(s => {
      const existing = marks.find(m => m.studentId === s.id && m.subjectId === selectedSubject?.id);
      return {
        'Roll No.': s.rollNo,
        'Student Name': s.name,
        'Internal Marks (Max 20)': existing ? existing.internal : '',
        'Midterm Marks (Max 30)': existing ? existing.midterm : '',
        'Final Marks (Max 50)': existing ? existing.final : ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 24 },
      { wch: 22 },
      { wch: 22 },
      { wch: 20 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Marks Upload Template');
    XLSX.writeFile(workbook, `${selectedSubject.code}_Marks_Template.xlsx`);
  };

  // Process uploaded Excel / CSV File
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const rawJson = XLSX.utils.sheet_to_json(ws);

        validateUploadedMarks(rawJson);
      } catch (err) {
        alert('Invalid file format. Please upload a valid Excel (.xlsx) or CSV file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Detailed Verification & Rule Checks
  const validateUploadedMarks = (rawJson) => {
    let globalHasError = false;
    const errorsList = [];

    const processed = rawJson.map((row, index) => {
      const rowNum = index + 2;
      const rollNo = String(row['Roll No.'] || row['Roll No'] || row['roll_no'] || '').trim();
      const studentName = row['Student Name'] || row['Name'] || '';
      
      const internal = Number(row['Internal Marks (Max 20)'] ?? row['Internal'] ?? row['internal']);
      const midterm = Number(row['Midterm Marks (Max 30)'] ?? row['Midterm'] ?? row['midterm']);
      const final = Number(row['Final Marks (Max 50)'] ?? row['Final'] ?? row['final']);

      const rowErrors = [];

      // Check 1: Empty Roll No
      if (!rollNo) {
        rowErrors.push('Missing Roll Number');
      } else {
        // Check 2: Roll Number exists in course class
        const validStudent = classStudents.find(s => String(s.rollNo) === rollNo);
        if (!validStudent) {
          rowErrors.push(`Roll No. ${rollNo} not enrolled in this class/course`);
        }
      }

      // Check 3: Range Validations
      if (isNaN(internal) || internal < 0 || internal > selectedSubject.maxInternal) {
        rowErrors.push(`Internal marks must be 0 - ${selectedSubject.maxInternal}`);
      }

      if (isNaN(midterm) || midterm < 0 || midterm > selectedSubject.maxMidterm) {
        rowErrors.push(`Midterm marks must be 0 - ${selectedSubject.maxMidterm}`);
      }

      if (isNaN(final) || final < 0 || final > selectedSubject.maxFinal) {
        rowErrors.push(`Final marks must be 0 - ${selectedSubject.maxFinal}`);
      }

      if (rowErrors.length > 0) {
        globalHasError = true;
        errorsList.push(`Row ${rowNum} (${studentName || rollNo}): ${rowErrors.join('; ')}`);
      }

      const total = (internal || 0) + (midterm || 0) + (final || 0);

      return {
        rollNo,
        studentName,
        internal: isNaN(internal) ? 0 : internal,
        midterm: isNaN(midterm) ? 0 : midterm,
        final: isNaN(final) ? 0 : final,
        total,
        isValid: rowErrors.length === 0,
        errors: rowErrors
      };
    });

    // Check 4: Duplicate roll numbers check in spreadsheet
    const rollSet = new Set();
    processed.forEach((r, idx) => {
      if (r.rollNo) {
        if (rollSet.has(r.rollNo)) {
          r.isValid = false;
          r.errors.push(`Duplicate Roll No. ${r.rollNo}`);
          globalHasError = true;
          errorsList.push(`Row ${idx + 2}: Duplicate Roll No. ${r.rollNo}`);
        }
        rollSet.add(r.rollNo);
      }
    });

    setValidatedRows(processed);
    setHasErrors(globalHasError);
    setErrorSummary(errorsList);
    setUploadedData(true);
  };

  const handleSubmit = () => {
    if (hasErrors) {
      alert('Please fix validation errors before submitting.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      submitBulkMarks(validatedRows, selectedSubject);
      setIsSubmitting(false);
      onCloseSuccess();
    }, 600);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-6 text-slate-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-blue-100 text-blue-800 font-mono px-2 py-0.5 rounded border border-blue-200 font-bold">
              {selectedSubject?.code || 'CS401L'}
            </span>
            <h2 className="text-xl font-bold text-slate-900">{selectedSubject?.name || 'Artificial Intelligence Lab'}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Course: <strong className="text-slate-800">{selectedSubject?.course || 'B.Tech CSE'}</strong> | Year: <strong className="text-slate-800">{selectedSubject?.year || '2026'}</strong> | Semester: <strong className="text-slate-800">{selectedSubject?.semester || 'VIII'}</strong>
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-slate-300"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>Download Excel Template</span>
        </button>
      </div>

      {/* Upload Drop Zone */}
      {!uploadedData ? (
        <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 transition-all rounded-2xl p-10 text-center bg-slate-50 relative group">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          <div className="w-16 h-16 bg-blue-100 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all shadow-sm">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Click or drag Excel/CSV file to upload</h3>
          <p className="text-xs text-slate-500 mt-1">Supports .xlsx, .xls, and .csv files formatted per template guidelines</p>
          <div className="mt-4 inline-flex items-center text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Max Limits: Internal ({selectedSubject?.maxInternal || 20}), Midterm ({selectedSubject?.maxMidterm || 30}), Final ({selectedSubject?.maxFinal || 50})
          </div>
        </div>
      ) : (
        /* Validation Results Preview Table */
        <div className="space-y-4">
          
          {/* Summary Alert */}
          {hasErrors ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 text-red-700">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <h4 className="font-bold text-red-900">Validation Errors Detected! ({errorSummary.length} issues)</h4>
                <p className="text-xs mt-1 text-red-600">Please modify your spreadsheet and re-upload to continue.</p>
                <ul className="list-disc list-inside mt-2 text-xs space-y-1 max-h-32 overflow-y-auto">
                  {errorSummary.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-emerald-800">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-900">Validation Passed Successfully!</h4>
                  <p className="text-xs text-emerald-700">All {validatedRows.length} student entries comply with marks constraints.</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                Ready for Submission
              </span>
            </div>
          )}

          {/* Validation Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white max-h-80">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Internal ({selectedSubject.maxInternal})</th>
                  <th className="px-4 py-3">Midterm ({selectedSubject.maxMidterm})</th>
                  <th className="px-4 py-3">Final ({selectedSubject.maxFinal})</th>
                  <th className="px-4 py-3">Total (100)</th>
                  <th className="px-4 py-3">Validation Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {validatedRows.map((row, idx) => (
                  <tr key={idx} className={`hover:bg-slate-50 ${!row.isValid ? 'bg-red-50/50' : ''}`}>
                    <td className="px-4 py-3">
                      {row.isValid ? (
                        <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <XCircle className="w-3 h-3 mr-1" /> Error
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{row.rollNo || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{row.studentName || 'N/A'}</td>
                    <td className="px-4 py-3">{row.internal}</td>
                    <td className="px-4 py-3">{row.midterm}</td>
                    <td className="px-4 py-3">{row.final}</td>
                    <td className="px-4 py-3 font-extrabold text-blue-600">{row.total}</td>
                    <td className="px-4 py-3 text-xs text-red-600 font-semibold">
                      {row.errors.length > 0 ? row.errors.join(', ') : 'Verified'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => { setUploadedData(null); setValidatedRows([]); setHasErrors(false); }}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 text-xs font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-upload Excel File</span>
            </button>

            <button
              disabled={hasErrors || isSubmitting}
              onClick={handleSubmit}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                hasErrors || isSubmitting
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Marks for Admin Approval'}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
