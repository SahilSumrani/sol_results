import React, { useState, useEffect, useMemo } from 'react';
import { UserCheck, Search, Download, Edit3, Save } from 'lucide-react';
import { apiFetch } from '../../services/apiClient';

const GRADE_POINTS_MAP = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'P': 4,
  'F': 0,
  'AB': 0
};

export const AllStudentsReviewTable = ({ 
  studentsList = [], 
  marksList = [], 
  onUpdateMarks = () => {}, 
  onExportCSV = () => {},
  selectedSubject = null
}) => {
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [filterTerm, setFilterTerm] = useState('');
  
  // Subject & Marks Form State
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
  const [editFormData, setEditFormData] = useState({
    th: '',
    tu: '',
    pr: '',
    netGrade: '',
    gradePoint: 0,
    creditPoint: 0
  });

  const [subjectsList, setSubjectsList] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchSubjects = async () => {
      try {
        const res = await apiFetch('/api/admin/subjects');
        if (res.ok && isMounted) {
          const json = await res.json();
          const data = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
          setSubjectsList(data);
          if (data.length > 0) {
            setSelectedSubjectCode(data[0].code);
          }
        }
      } catch (err) {
        console.warn('Error fetching subjects:', err.message);
      }
    };
    fetchSubjects();
    return () => { isMounted = false; };
  }, []);

  const handleEditClick = (student) => {
    if (!student) return;
    const targetRoll = student.rollNo || student.id || '';
    setEditingStudentId(targetRoll);
    if (student.paperCode) {
      setSelectedSubjectCode(student.paperCode);
    }
    const initialGrade = student.netGrade || 'A';
    setEditFormData({
      th: student.thGrade || student.th || '',
      tu: student.tuGrade || student.tu || '',
      pr: student.prGrade || student.pr || '',
      netGrade: initialGrade,
      gradePoint: student.gradePoint ?? (GRADE_POINTS_MAP[initialGrade] || 0),
      creditPoint: student.creditPoint ?? 0
    });
  };

  const handleGradeChange = (grade) => {
    const calculatedGp = GRADE_POINTS_MAP[grade] ?? 0;
    setEditFormData(prev => ({
      ...prev,
      netGrade: grade,
      gradePoint: calculatedGp
    }));
  };

  const handleSaveMarks = (rollNo) => {
    const activeSubj = subjectsList.find(s => s.code === selectedSubjectCode);
    if (typeof onUpdateMarks === 'function') {
      onUpdateMarks(rollNo, {
        ...editFormData,
        paperCode: activeSubj?.code || selectedSubjectCode || '',
        paperName: activeSubj?.name || selectedSubject?.name || '',
        paperType: activeSubj?.type || 'DSC',
        credit: activeSubj?.credit || 4
      });
    }
    setEditingStudentId(null);
  };

  const safeStudents = useMemo(() => {
    if (!Array.isArray(studentsList)) return [];
    return studentsList;
  }, [studentsList]);

  const filteredStudents = useMemo(() => {
    const query = (filterTerm || '').trim().toLowerCase();
    if (!query) return safeStudents;
    return safeStudents.filter(s => {
      if (!s) return false;
      const name = String(s.name || '').toLowerCase();
      const roll = String(s.rollNo || s.id || '').toLowerCase();
      return name.includes(query) || roll.includes(query);
    });
  }, [safeStudents, filterTerm]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-blue-800" />
            <span>Official Statement of Marks / Multi-Subject Entry System</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Add & update marks across all NEP subjects for official Statement of Marks sheet.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              placeholder="Search student roll no..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button 
            type="button"
            onClick={onExportCSV}
            className="flex items-center space-x-1.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Official Grade Sheet</span>
          </button>
        </div>
      </div>

      {/* Main Student Grade Sheet Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-800 border-collapse">
          <thead className="bg-slate-100 font-bold uppercase text-slate-700 border-b border-slate-300">
            <tr>
              <th className="p-3">Exam Roll No.</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Subject / Paper Name</th>
              <th className="p-3 text-center">Grade (TH)</th>
              <th className="p-3 text-center">Grade (TU)</th>
              <th className="p-3 text-center">Grade (PR)</th>
              <th className="p-3 text-center">Net Grade</th>
              <th className="p-3 text-center">Grade Point</th>
              <th className="p-3 text-center font-extrabold text-blue-900">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, idx) => {
                const roll = String(student.rollNo || student.id || `student-${idx}`);
                const isEditing = editingStudentId === roll;

                return (
                  <tr key={roll} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-red-900">{student.rollNo || student.id || '-'}</td>
                    <td className="p-3 font-bold text-slate-900">{student.name || '-'}</td>
                    
                    {/* Subject Selector Column */}
                    <td className="p-3 font-semibold text-slate-800">
                      {isEditing ? (
                        <select 
                          value={selectedSubjectCode}
                          onChange={(e) => setSelectedSubjectCode(e.target.value)}
                          className="bg-white border border-blue-400 rounded-lg p-1.5 font-bold text-blue-900 text-xs w-full outline-none"
                        >
                          {subjectsList.map(s => (
                            <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{student.paperName || selectedSubject?.name || '-'}</span>
                      )}
                    </td>

                    {/* Grade TH */}
                    <td className="p-3 text-center font-bold">
                      {isEditing ? (
                        <input 
                          type="text"
                          value={editFormData.th || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, th: e.target.value })}
                          className="w-12 bg-white border border-blue-400 rounded-lg p-1 text-center font-bold text-blue-900 outline-none uppercase"
                        />
                      ) : (
                        <span>{student.thGrade || student.th || '-'}</span>
                      )}
                    </td>

                    {/* Grade TU */}
                    <td className="p-3 text-center font-bold">
                      {isEditing ? (
                        <input 
                          type="text"
                          value={editFormData.tu || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, tu: e.target.value })}
                          className="w-12 bg-white border border-blue-400 rounded-lg p-1 text-center font-bold text-blue-900 outline-none uppercase"
                        />
                      ) : (
                        <span>{student.tuGrade || student.tu || '-'}</span>
                      )}
                    </td>

                    {/* Grade PR */}
                    <td className="p-3 text-center font-bold">
                      {isEditing ? (
                        <input 
                          type="text"
                          value={editFormData.pr || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, pr: e.target.value })}
                          placeholder="-"
                          className="w-12 bg-white border border-blue-400 rounded-lg p-1 text-center font-bold text-blue-900 outline-none uppercase"
                        />
                      ) : (
                        <span>{student.prGrade || student.pr || '-'}</span>
                      )}
                    </td>

                    {/* Net Grade */}
                    <td className="p-3 text-center font-extrabold text-blue-900">
                      {isEditing ? (
                        <select 
                          value={editFormData.netGrade || 'A'}
                          onChange={(e) => handleGradeChange(e.target.value)}
                          className="bg-white border border-blue-400 rounded-lg p-1 font-bold text-blue-900 text-xs"
                        >
                          <option value="O">O</option>
                          <option value="A+">A+</option>
                          <option value="A">A</option>
                          <option value="B+">B+</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="P">P</option>
                          <option value="F">F</option>
                        </select>
                      ) : (
                        <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-bold">
                          {student.netGrade || '-'}
                        </span>
                      )}
                    </td>

                    {/* Grade Point */}
                    <td className="p-3 text-center font-bold text-slate-900">
                      {isEditing ? (editFormData.gradePoint ?? '-') : (student.gradePoint ?? '-')}
                    </td>

                    {/* Action Buttons */}
                    <td className="p-3 text-center">
                      {isEditing ? (
                        <button 
                          type="button"
                          onClick={() => handleSaveMarks(roll)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1 rounded-lg flex items-center space-x-1 mx-auto transition-all cursor-pointer shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Paper Mark</span>
                        </button>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => handleEditClick(student)}
                          className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs px-3.5 py-1 rounded-lg flex items-center space-x-1 mx-auto transition-all cursor-pointer shadow-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Update Paper</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="p-6 text-center text-slate-500 font-medium text-xs">
                  No enrolled students found in database matching search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
