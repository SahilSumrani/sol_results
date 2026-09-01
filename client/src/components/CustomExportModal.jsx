import React, { useState } from 'react';

export const CustomExportModal = ({ isOpen, onClose, onExport }) => {
  const [selectedFy, setSelectedFy] = useState('2025-26');
  const [selectedCourse, setSelectedCourse] = useState('B.A. (PROGRAMME)');
  const [selectedSem, setSelectedSem] = useState('V');
  const [fields, setFields] = useState({
    rollNo: true,
    studentName: true,
    enrollmentNo: true,
    course: true,
    semester: true,
    paperCode: true,
    paperName: true,
    netGrade: true,
    status: true
  });

  if (!isOpen) return null;

  const toggleField = (key) => {
    setFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownload = () => {
    const activeFields = Object.keys(fields).filter(k => fields[k]);
    onExport({ fy: selectedFy, course: selectedCourse, sem: selectedSem, fields: activeFields });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-lg p-6 space-y-5 font-sans">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="font-extrabold text-base text-slate-900">Custom Data Export Builder</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Financial Year</label>
            <select value={selectedFy} onChange={(e) => setSelectedFy(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-900">
              <option value="2025-26">2025-26</option>
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Course</label>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-900">
              <option value="B.A. (PROGRAMME)">B.A. (Prog)</option>
              <option value="B.COM (HONS)">B.Com (Hons)</option>
              <option value="B.A. (HONS) ENGLISH">B.A. English</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Semester</label>
            <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-900">
              <option value="V">Semester V</option>
              <option value="IV">Semester IV</option>
              <option value="III">Semester III</option>
              <option value="I">Semester I</option>
            </select>
          </div>
        </div>

        {/* Checkbox List */}
        <div className="space-y-2">
          <label className="block font-bold text-xs text-slate-800">Select Columns to Include in CSV Export:</label>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {Object.keys(fields).map((key) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={fields[key]} 
                  onChange={() => toggleField(key)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">Cancel</button>
          <button onClick={handleDownload} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm">
            Generate & Download CSV Report
          </button>
        </div>

      </div>
    </div>
  );
};
