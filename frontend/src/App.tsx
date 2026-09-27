import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { GatewayConfigProvider } from './context/GatewayConfigContext';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeePage } from './pages/EmployeePage';
import { DepartmentPage } from './pages/DepartmentPage';
import { LeavePage } from './pages/LeavePage';
import { AttendancePage } from './pages/AttendancePage';
import { SalaryPage } from './pages/SalaryPage';
import { SupportPage } from './pages/SupportPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <ToastProvider>
      <GatewayConfigProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Workspace Routes inside DashboardLayout */}
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/employees" element={<EmployeePage />} />
                <Route path="/employees/:id" element={<EmployeePage />} />
                <Route path="/departments" element={<DepartmentPage />} />
                <Route path="/departments/:id" element={<DepartmentPage />} />
                <Route path="/leaves" element={<LeavePage />} />
                <Route path="/leaves/:id" element={<LeavePage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/salaries" element={<SalaryPage />} />
                <Route path="/salaries/:id" element={<SalaryPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/support/:id" element={<SupportPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </GatewayConfigProvider>
    </ToastProvider>
  );
}
