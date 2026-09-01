import React from 'react';
import { UserPlus, Sparkles } from 'lucide-react';

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
  return (
    <div className="space-y-6">
      {/* Faculty Creation Form & Auto Credential Generator */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Register New Faculty Evaluator & Auto-Generate Credentials</h2>
        </div>

        <form onSubmit={handleCreateFaculty} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <input 
            type="text" 
            value={newFacultyName}
            onChange={(e) => setNewFacultyName(e.target.value)}
            placeholder="Faculty Name (e.g. Dr. Sunita Verma)"
            className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium focus:ring-2 focus:ring-blue-600 outline-none"
            required
          />
          <input 
            type="text" 
            value={newFacultyDept}
            onChange={(e) => setNewFacultyDept(e.target.value)}
            placeholder="Department (e.g. Dept. of Commerce)"
            className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium focus:ring-2 focus:ring-blue-600 outline-none"
          />
          <input 
            type="text" 
            value={newFacultySubj}
            onChange={(e) => setNewFacultySubj(e.target.value)}
            placeholder="Assigned Subject (e.g. Financial Accounting)"
            className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium focus:ring-2 focus:ring-blue-600 outline-none"
          />
          <div className="sm:col-span-3 text-right">
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs cursor-pointer"
            >
              Generate Unique Credentials
            </button>
          </div>
        </form>

        {/* Newly Generated Credentials Banner */}
        {generatedCreds && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-900 font-bold">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Unique Credentials Generated Successfully!</span>
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

      {/* Faculty Directory & Real-time Live Log Tracking */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Faculty Live Activity & Login Status</h2>
          <span className="text-xs text-slate-500 font-medium">Real-time portal access logs</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-800 border-collapse">
            <thead className="bg-slate-50 font-bold uppercase text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3">Faculty Name</th>
                <th className="p-3">Unique Username</th>
                <th className="p-3">Department</th>
                <th className="p-3">Subject Evaluating</th>
                <th className="p-3 text-center">Last Active Log</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {facultyList.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{f.name}</td>
                  <td className="p-3 font-mono text-blue-700 font-bold">{f.username}</td>
                  <td className="p-3 font-medium text-slate-600">{f.department}</td>
                  <td className="p-3 font-semibold text-slate-800">{f.queriedSubject || f.subject}</td>
                  <td className="p-3 text-center font-medium text-slate-500">{f.lastActive || 'Today'}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      f.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {f.status || 'OFFLINE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
