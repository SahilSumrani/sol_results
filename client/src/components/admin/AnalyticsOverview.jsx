import React from 'react';
import { FileSpreadsheet, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid 
} from 'recharts';

export const AnalyticsOverview = ({ 
  publishedCount, 
  pendingCount, 
  facultyCount, 
  courseWiseData, 
  gradeDistributionData, 
  weeklyTrafficData 
}) => {
  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Evaluated Papers</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{publishedCount + pendingCount}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Published Results</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{publishedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
            <h3 className="text-2xl font-bold text-amber-900 mt-1">{pendingCount}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Faculty Evaluators</span>
            <h3 className="text-2xl font-bold text-purple-900 mt-1">{facultyCount}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Course-Wise Evaluation Volume Bar Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Course-Wise Evaluation Metrics (FY 2026-27)</h3>
            <p className="text-xs text-slate-500 font-medium">Checked papers vs Published results per course</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseWiseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="course" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Bar dataKey="checked" fill="#2563eb" name="Checked Papers" radius={[4, 4, 0, 0]} />
                <Bar dataKey="published" fill="#10b981" name="Published" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DU NEP Grade Breakdown Donut Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-base text-slate-900">Grade Distribution Ratio</h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gradeDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80}>
                  {gradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend fontSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Traffic Queries Area Chart */}
        <div className="lg:col-span-12 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-base text-slate-900">Weekly Portal Traffic Queries</h3>
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrafficData}>
                <defs>
                  <linearGradient id="trafficGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip />
                <Area type="monotone" dataKey="queries" stroke="#7c3aed" strokeWidth={2.5} fillOpacity={1} fill="url(#trafficGrad2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
