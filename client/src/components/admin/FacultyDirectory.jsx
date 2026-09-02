import React, { useState } from 'react';
import { UserPlus, Sparkles, BookOpen, Check } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

export const FacultyDirectory = ({ 
  facultyList, 
  newFacultyName, 
  setNewFacultyName, 
  newFacultyDept, 
  setNewFacultyDept, 
  newFacultySubj, 
  setNewFacultySubj, 
  generatedCreds, 
  setGeneratedCreds, 
  handleCreateFaculty 
}) => {
  const { assignTeacherToSubject } = usePortal();
  const [assigningFaculty, setAssigningFaculty] = useState(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [course, setCourse] = useState('B.Tech CSE');
  const [semester, setSemester] = useState('VIII');
  const [section, setSection] = useState('A');

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assigningFaculty || !subjectCode || !subjectName) return;

    await assignTeacherToSubject({
      teacherId: assigningFaculty.id,
      teacherEmail: assigningFaculty.email || 'teacher@sol.du.ac.in',
      teacherName: assigningFaculty.name,
      subjectCode,
      subjectName,
      course,
      semester,
      section
    });

    alert(`Subject ${subjectCode} (${subjectName}) assigned to ${assigningFaculty.name}! Saved to DB.`);
    setAssigningFaculty(null);
    setSubjectCode('');
    setSubjectName('');
  };

  return (
    <div className="space-y-6">
      {/* Faculty Creation Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2">
          <UserPlus className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Register New Teacher & Auto-Generate Credentials</h2>
        </div>

        <form onSubmit={handleCreateFaculty} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <input 
            type="text" 
            value={newFacultyName}
            onChange={(e) => setNewFacultyName(e.target.value)}
            placeholder="Faculty Name (e.g. Dr. Rahul Sharma)"
            className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
            required
          />
          <input 
            type="text" 
            value={newFacultyDept}
            onChange={(e) => setNewFacultyDept(e.target.value)}
            placeholder="Department (e.g. Computer Science & Engineering)"
            className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
          />
          <input 
            type="text" 
            value={newFacultySubj}
            onChange={(e) => setNewFacultySubj(e.target.value)}
            placeholder="Initial Subject (e.g. Artificial Intelligence Lab)"
            className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
          />
          <div className="sm:col-span-3 text-right">
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs cursor-pointer"
            >
              Register Teacher
            </button>
          </div>
        </form>

        {generatedCreds && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-900 font-bold">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Teacher Created Successfully!</span>
              </div>
              <button onClick={() => setGeneratedCreds(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="flex items-center space-x-6 font-mono text-slate-800 pt-1">
              <p>Faculty: <span className="font-bold text-slate-900">{generatedCreds.name}</span></p>
              <p>Username: <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">{generatedCreds.username}</span></p>
              <p>Password: <span className="font-bold text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">{generatedCreds.pass}</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Faculty List & Assign Subject Button */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Teachers & Assigned Classes / Subjects</h2>
            <p className="text-xs text-slate-500 font-medium">Assign subjects and sections to teachers to grant mark entry access.</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-800 border-collapse">
            <thead className="bg-slate-50 font-bold uppercase text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3">Faculty Name</th>
                <th className="p-3">Employee ID / Email</th>
                <th className="p-3">Department</th>
                <th className="p-3">Assigned Subject</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {facultyList.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{f.name}</td>
                  <td className="p-3 font-mono text-indigo-700 font-bold">{f.email || f.username || 'teacher@sol.du.ac.in'}</td>
                  <td className="p-3 font-medium text-slate-600">{f.department}</td>
                  <td className="p-3 font-semibold text-slate-800">{f.subject || 'No Subject Assigned'}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setAssigningFaculty(f)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-bold border border-indigo-200 cursor-pointer flex items-center space-x-1 mx-auto text-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Assign Subject</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject Assignment Modal */}
      {assigningFaculty && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
              Assign Subject to {assigningFaculty.name}
            </h3>

            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Code</label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="e.g. CS401L"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Name</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence Lab"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Course</label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Semester</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Section</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAssigningFaculty(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

