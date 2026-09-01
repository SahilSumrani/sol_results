import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export const TeacherAnalyticsCharts = () => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('B.A. (Prog)');

  const courseWiseDataMap = {
    'ALL': [
      { course: 'B.A. (Prog)', checked: 1420, verified: 1380, avgTheory: 58 },
      { course: 'B.Com (Hons)', checked: 980, verified: 920, avgTheory: 64 },
      { course: 'B.A. English', checked: 1150, verified: 1150, avgTheory: 60 },
      { course: 'B.A. Pol Sci', checked: 860, verified: 810, avgTheory: 54 }
    ],
    'B.A. (Prog)': [
      { course: 'Sem I (Python)', checked: 420, verified: 400, avgTheory: 58 },
      { course: 'Sem III (DBMS)', checked: 380, verified: 370, avgTheory: 62 },
      { course: 'Sem V (ML & AI)', checked: 350, verified: 340, avgTheory: 55 },
      { course: 'Sem VII (Data Science)', checked: 270, verified: 270, avgTheory: 60 }
    ],
    'B.Com (Hons)': [
      { course: 'Sem I (Accounting)', checked: 300, verified: 280, avgTheory: 65 },
      { course: 'Sem III (Corporate Law)', checked: 320, verified: 300, avgTheory: 62 },
      { course: 'Sem V (Auditing)', checked: 360, verified: 340, avgTheory: 66 }
    ],
    'B.A. English': [
      { course: 'Sem I (Fluency)', checked: 400, verified: 400, avgTheory: 61 },
      { course: 'Sem III (Literature)', checked: 380, verified: 380, avgTheory: 59 },
      { course: 'Sem V (Poetry)', checked: 370, verified: 370, avgTheory: 63 }
    ]
  };

  const activeData = courseWiseDataMap[selectedCourseFilter] || courseWiseDataMap['ALL'];

  return (
    <div className="space-y-6">
      
      {/* Dynamic Dropdown Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Real-Time Course Evaluation Analytics</h2>
          <p className="text-xs text-slate-500 font-medium">Select any course from the dropdown below to update chart metrics dynamically in real-time.</p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-700">Select Course:</label>
          <select 
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-xs text-blue-900 outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="ALL">All Enrolled Courses</option>
            <option value="B.A. (Prog)">B.A. (PROGRAMME)</option>
            <option value="B.Com (Hons)">B.COM (HONS)</option>
            <option value="B.A. English">B.A. (HONS) ENGLISH</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Real-Time Dynamic Course Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-base text-slate-900">
            {selectedCourseFilter === 'ALL' ? 'Overall Course Evaluation Volume' : `${selectedCourseFilter} Semester Breakdown`}
          </h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="course" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Bar dataKey="checked" fill="#2563eb" name="Total Evaluated" radius={[4, 4, 0, 0]} />
                <Bar dataKey="verified" fill="#10b981" name="Admin Verified" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Real-Time Subject Average Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-base text-slate-900">Average Theory Score (Out of 75)</h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="course" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Bar dataKey="avgTheory" fill="#7c3aed" name="Avg Theory Marks" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
