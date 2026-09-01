import React from 'react';
import { 
  LayoutDashboard, Activity, CheckSquare, Users, GraduationCap, 
  ShieldCheck, Download, LogOut 
} from 'lucide-react';

export const AdminSidebar = ({ 
  activeTab, 
  setActiveTab, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  pendingCount, 
  onOpenExport, 
  onLogout 
}) => {
  const navItems = [
    { id: 'ANALYTICS', label: 'Analytics & Metrics', icon: LayoutDashboard },
    { id: 'EVALUATIONS', label: 'Faculty Evaluation Audit', icon: Activity },
    { id: 'APPROVALS', label: 'Pending Approvals', icon: CheckSquare, badge: pendingCount },
    { id: 'FACULTY', label: 'Faculty & Credentials', icon: Users },
    { id: 'STUDENTS', label: 'Student Master Database', icon: GraduationCap },
    { id: 'AUDIT', label: 'Security Audit Logs', icon: ShieldCheck },
  ];

  return (
    <aside className={`
      fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between transition-transform duration-300 ease-in-out min-h-screen
      ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-3 px-1">
          <img src="/new_logo.png" alt="SOL Logo" className="h-12 w-auto object-contain" />
          <div>
            <h2 className="font-extrabold text-base text-slate-900 leading-tight">School of Open Learning</h2>
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Examination Admin</span>
          </div>
        </div>

        <nav className="space-y-1.5 text-xs font-semibold">
          <p className="px-3 text-[11px] uppercase font-extrabold text-slate-400 tracking-wider mb-2">Admin Control Center</p>
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-extrabold border-l-4 border-blue-600 shadow-2xs' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-5 border-t border-slate-200 space-y-3">
        <button 
          onClick={onOpenExport}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs p-3 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Custom Export Builder</span>
        </button>

        <button 
          onClick={onLogout} 
          className="w-full bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-bold text-xs p-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer border border-slate-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Admin Session</span>
        </button>
      </div>
    </aside>
  );
};
