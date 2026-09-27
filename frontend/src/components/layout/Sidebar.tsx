import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Clock,
  DollarSign,
  LifeBuoy,
  User,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout, isAdmin, isHR, isManager } = useAuth();
  const navigate = useNavigate();

  // Role-based navigation rules (Section 9.3)
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      visible: true,
    },
    {
      label: 'Employees',
      path: '/employees',
      icon: Users,
      visible: isAdmin || isHR || isManager,
    },
    {
      label: 'Departments',
      path: '/departments',
      icon: Building2,
      visible: true, // all authenticated can view
    },
    {
      label: 'Leave',
      path: '/leaves',
      icon: CalendarCheck,
      visible: true,
    },
    {
      label: 'Attendance',
      path: '/attendance',
      icon: Clock,
      visible: true,
    },
    {
      label: 'Payroll',
      path: '/salaries',
      icon: DollarSign,
      visible: true,
    },
    {
      label: 'Support',
      path: '/support',
      icon: LifeBuoy,
      visible: true,
    },
    {
      label: 'Profile',
      path: '/profile',
      icon: User,
      visible: true,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs tracking-wider">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            EMS
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Enterprise</span>
          </div>
          <p className="text-[11px] text-slate-400">Employee Management</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      {/* Bottom section: Help Card & Logout */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2 mb-1.5">
            <LifeBuoy className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-bold text-slate-900">Need help?</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2.5">
            Submit a ticket or view your open requests.
          </p>
          <button
            onClick={() => navigate('/support')}
            className="w-full text-xs font-medium py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            Get support
          </button>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
