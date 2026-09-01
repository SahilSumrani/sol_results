import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { BookOpen, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { TeacherDashboard } from './TeacherDashboard';

export const TeacherLoginPage = () => {
  const { currentUser, login } = usePortal();
  const [email, setEmail] = useState('teacher@sol.du.ac.in');
  const [password, setPassword] = useState('teacher123');
  const [error, setError] = useState('');

  if (currentUser && currentUser.role === 'TEACHER') {
    return <TeacherDashboard />;
  }

  const handleLogin = (e) => {
    e.preventDefault();
    const success = login(email, password, 'TEACHER');
    if (!success) {
      setError('Invalid Teacher credentials! Default: teacher@sol.du.ac.in / teacher123');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 font-sans">
      <div className="bg-white p-8 rounded-2xl border border-slate-300 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-blue-600/20">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Faculty Evaluation Login</h1>
          <p className="text-xs text-slate-500 font-semibold">Teacher & Evaluator Marks Portal</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">Faculty Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@sol.du.ac.in"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Login to Teacher Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        <div className="pt-2 border-t border-slate-200 text-center text-[11px] text-slate-500 font-semibold">
          Default Teacher Login: <span className="font-mono text-slate-800 font-bold">teacher@sol.du.ac.in</span> / <span className="font-mono text-slate-800 font-bold">teacher123</span>
        </div>

      </div>
    </div>
  );
};
