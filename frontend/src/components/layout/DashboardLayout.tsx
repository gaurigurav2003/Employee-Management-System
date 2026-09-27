import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../context/AuthContext';
import { useGatewayConfig } from '../../context/GatewayConfigContext';
import { AlertCircle, Server } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isOnline, gatewayUrl } = useGatewayConfig();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        {/* Gateway connection status reminder */}
        {isOnline === false && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>YARP Gateway Offline:</strong> Requests to <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[11px]">{gatewayUrl}</code> timed out. Make sure your .NET API Gateway is running on port 5000.
              </span>
            </div>
            <span className="font-medium text-amber-700 flex items-center gap-1">
              <Server className="w-3.5 h-3.5" /> Direct REST calls active
            </span>
          </div>
        )}

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
