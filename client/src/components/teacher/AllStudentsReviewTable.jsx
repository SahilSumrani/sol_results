import React, { useState } from 'react';
import { 
  UserCheck, Search, Download, Edit3, Save, Layers, Plus 
} from 'lucide-react';

export const AllStudentsReviewTable = ({ 
  studentsList, 
  marksList, 
  onUpdateMarks, 
  onExportCSV,
  selectedSubject
}) => {
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [filterTerm, setFilterTerm] = useState('');
  
  // Subject & Marks Form State
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('2342011101');
  const [editFormData, setEditFormData] = useState({
    th: 'B+',
    tu: 'O',
    pr: '',
    netGrade: 'B+',
    gradePoint: 7,
    creditPoint: 28
  });

  const [subjectsList, setSubjectsList] = useState([]);

  React.useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/subjects');
        if (res.ok) {
          const data = await res.json();
          setSubjectsList(data);
          if (data.length > 0) setSelectedSubjectCode(data[0].code);
        }
      } catch (err) {
        console.log('Error fetching subjects:', err.message);
      }
    };
    fetchSubjects();
  }, []);

  const handleEditClick = (student) => {
    setEditingStudentId(student.rollNo);
  };

  const handleSaveMarks = (rollNo) => {
    const activeSubj = subjectsList.find(s => s.code === selectedSubjectCode);
    onUpdateMarks(rollNo, {
      ...editFormData,
      paperCode: activeSubj.code,
      paperName: activeSubj.name,
      paperType: activeSubj.type,
      credit: activeSubj.credit
    });
    setEditingStudentId(null);
  };

  const filteredStudents = studentsList.filter(s => 
    s.name.toLowerCase().includes(filterTerm.toLowerCase()) || 
    s.rollNo.includes(filterTerm)
  );

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-blue-800" />
            <span>Official Statement of Marks / Multi-Subject Entry System</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Add & update marks across all 34 NEP subjects for official DU Statement of Marks sheet.</p>
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
            onClick={onExportCSV}
            className="flex items-center space-x-1.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Official Grade Sheet</span>
          </button>
        </div>
      </div>

      {/* Main Student Grade Sheet Table (Matches Official DU Marksheet Format) */}
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
            {filteredStudents.map((student) => {
              const isEditing = editingStudentId === student.rollNo;

              return (
                <React.Fragment key={student.rollNo}>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-red-900">{student.rollNo}</td>
                    <td className="p-3 font-bold text-slate-900">{student.name}</td>
                    
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
                        <span>{student.paperName || selectedSubject?.name || 'Artificial Intelligence Lab'}</span>
                      )}
                    </td>

                    {/* Grade TH */}
                    <td className="p-3 text-center font-bold">
                      {isEditing ? (
                        <input 
                          type="text"
                          value={editFormData.th}
                          onChange={(e) => setEditFormData({ ...editFormData, th: e.target.value })}
                          className="w-12 bg-white border border-blue-400 rounded-lg p-1 text-center font-bold text-blue-900 outline-none uppercase"
                        />
                      ) : (
                        <span>{student.thGrade || 'A'}</span>
                      )}
                    </td>

                    {/* Grade TU */}
                    <td className="p-3 text-center font-bold">
                      {isEditing ? (
                        <input 
                          type="text"
                          value={editFormData.tu}
                          onChange={(e) => setEditFormData({ ...editFormData, tu: e.target.value })}
                          className="w-12 bg-white border border-blue-400 rounded-lg p-1 text-center font-bold text-blue-900 outline-none uppercase"
                        />
                      ) : (
                        <span>{student.tuGrade || 'O'}</span>
                      )}
                    </td>

                    {/* Grade PR */}
                    <td className="p-3 text-center font-bold">
                      {isEditing ? (
                        <input 
                          type="text"
                          value={editFormData.pr}
                          onChange={(e) => setEditFormData({ ...editFormData, pr: e.target.value })}
                          placeholder="-"
                          className="w-12 bg-white border border-blue-400 rounded-lg p-1 text-center font-bold text-blue-900 outline-none uppercase"
                        />
                      ) : (
                        <span>{student.prGrade || '-'}</span>
                      )}
                    </td>

                    {/* Net Grade */}
                    <td className="p-3 text-center font-extrabold text-blue-900">
                      {isEditing ? (
                        <select 
                          value={editFormData.netGrade}
                          onChange={(e) => setEditFormData({ ...editFormData, netGrade: e.target.value })}
                          className="bg-white border border-blue-400 rounded-lg p-1 font-bold text-blue-900 text-xs"
                        >
                          <option value="O">O</option>
                          <option value="A+">A+</option>
                          <option value="A">A</option>
                          <option value="B+">B+</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                        </select>
                      ) : (
                        <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-bold">{student.netGrade || 'A'}</span>
                      )}
                    </td>

                    {/* Grade Point */}
                    <td className="p-3 text-center font-bold text-slate-900">7</td>

                    {/* Action Buttons */}
                    <td className="p-3 text-center">
                      {isEditing ? (
                        <button 
                          onClick={() => handleSaveMarks(student.rollNo)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1 rounded-lg flex items-center space-x-1 mx-auto transition-all cursor-pointer shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Paper Mark</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleEditClick(student)}
                          className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs px-3.5 py-1 rounded-lg flex items-center space-x-1 mx-auto transition-all cursor-pointer shadow-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Update Paper</span>
                        </button>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
