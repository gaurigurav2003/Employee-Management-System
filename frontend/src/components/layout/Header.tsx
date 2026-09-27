import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGatewayConfig } from '../../context/GatewayConfigContext';
import { GatewaySettingsModal } from '../common/GatewaySettingsModal';
import { Server, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../../types';

export const Header: React.FC = () => {
  const { user, setUserRolePreview } = useAuth();
  const { isOnline, gatewayUrl } = useGatewayConfig();
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get current section from path
  const currentPath = location.pathname.split('/')[1] || 'dashboard';
  const pageTitle = currentPath.charAt(0).toUpperCase() + currentPath.slice(1);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const roles: UserRole[] = ['Admin', 'HR', 'Manager', 'Employee', 'Support'];

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Breadcrumbs / Title */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace</span>
          <span className="text-slate-300">/</span>
          <h1 className="text-sm font-bold text-slate-900 capitalize">{pageTitle}</h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* YARP Gateway Status button */}
          <button
            onClick={() => setIsGatewayModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
            title="Click to configure YARP Gateway URL"
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gateway:5000</span>
            {isOnline ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            )}
          </button>

          {/* Role Preview Switcher (As permitted in Wireframe 1 & SRS notes) */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <label htmlFor="role-select" className="text-[11px] font-medium text-slate-500 mr-1 hidden md:inline">
              Role:
            </label>
            <select
              id="role-select"
              value={user?.role || 'Employee'}
              onChange={(e) => setUserRolePreview(e.target.value as UserRole)}
              className="text-xs font-semibold text-slate-800 bg-transparent border-none focus:ring-0 cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>


          {/* User Profile Pill */}
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 pl-2 py-1 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
              {getInitials(user?.username)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {user?.username || 'User'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium capitalize">
                {user?.role}
              </div>
            </div>
          </div>
        </div>
      </header>

      <GatewaySettingsModal
        isOpen={isGatewayModalOpen}
        onClose={() => setIsGatewayModalOpen(false)}
      />
    </>
  );
};
