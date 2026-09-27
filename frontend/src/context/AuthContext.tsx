import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole, UserSession } from '../types';
import { authApi } from '../api/authApi';
import { employeeApi } from '../api/employeeApi';
import { setOnUnauthorized, setOnForbidden } from '../api/client';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, rememberMe?: boolean, previewRole?: UserRole) => Promise<UserSession>;
  logout: () => void;
  setUserRolePreview: (role: UserRole) => void;
  isAdmin: boolean;
  isHR: boolean;
  isManager: boolean;
  isEmployee: boolean;
  isSupport: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { warning, error: toastError } = useToast();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('ems_auth_token');
    sessionStorage.removeItem('ems_auth_token');
    localStorage.removeItem('ems_user_session');
    sessionStorage.removeItem('ems_user_session');
    setUser(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      handleLogout();
      warning('Your session has expired. Please sign in again.', 'Session Expired');
    });

    setOnForbidden((message) => {
      toastError(
        message || 'You do not have authorization to perform this operation (403 Forbidden).',
        'Access Denied'
      );
    });
  }, [handleLogout, warning, toastError]);

  // Load existing session on initial load
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('ems_auth_token') || sessionStorage.getItem('ems_auth_token');
      const storedSession = localStorage.getItem('ems_user_session') || sessionStorage.getItem('ems_user_session');

      if (storedToken && storedSession) {
        const parsed = JSON.parse(storedSession) as UserSession;
        // Check if token expired
        const jwt = parseJwt(storedToken);
        if (jwt && jwt.exp && jwt.exp * 1000 < Date.now()) {
          handleLogout();
        } else {
          setUser(parsed);
        }
      }
    } catch {
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  const login = async (
    username: string,
    password: string,
    rememberMe: boolean = false,
    previewRole?: UserRole
  ): Promise<UserSession> => {
    const response = await authApi.login({ username, password });

    // Handle token format: response could be { token: string }, { accessToken: string }, or a raw string
    let token = '';
    let serverRole: string | undefined = undefined;
    let employeeId = '';
    let userId = '';

    if (typeof response === 'string') {
      token = response;
    } else if (response && typeof response === 'object') {
      token = response.token || response.accessToken || response.jwt || '';
      serverRole = response.role;
      employeeId = response.employeeId || response.employee_id || '';
      userId = response.userId || response.user_id || '';
    }

    if (!token) {
      throw new Error('Authentication response did not contain a valid JWT token.');
    }

    // Parse claims from JWT
    const claims = parseJwt(token) || {};
    const claimRole =
      serverRole ||
      claims['role'] ||
      claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      claims['Role'] ||
      previewRole ||
      'Employee';

    // Normalize role string to valid UserRole
    let finalRole: UserRole = 'Employee';
    const lowerRole = String(claimRole).toLowerCase();
    if (lowerRole.includes('admin')) finalRole = 'Admin';
    else if (lowerRole.includes('hr')) finalRole = 'HR';
    else if (lowerRole.includes('manager')) finalRole = 'Manager';
    else if (lowerRole.includes('support')) finalRole = 'Support';
    else finalRole = 'Employee';

    // If user explicitly picked a preview role on login screen for testing, allow it
    if (previewRole) {
      finalRole = previewRole;
    }

    const resolvedUserId =
      userId ||
      claims['sub'] ||
      claims['userId'] ||
      claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      'user-' + Math.random().toString(36).substring(2, 7);

    let resolvedEmployeeId =
  employeeId ||
  claims['employeeId'] ||
  claims['EmployeeId'] ||
  claims['emp_id'] ||
  '';

if (!resolvedEmployeeId && finalRole === 'Employee') {
  sessionStorage.setItem('ems_auth_token', token);

  try {
    const employee = await employeeApi.getMe();
    resolvedEmployeeId = employee.employeeId;
  } catch {
    sessionStorage.removeItem('ems_auth_token');
    throw new Error('Unable to retrieve employee profile after login.');
  }
}
    const session: UserSession = {
      token,
      userId: resolvedUserId,
      employeeId: resolvedEmployeeId,
      username: username || claims['unique_name'] || claims['email'] || 'User',
      email: claims['email'] || (username.includes('@') ? username : undefined),
      role: finalRole,
      expiry: claims.exp ? new Date(claims.exp * 1000).toISOString() : undefined,
    };

    if (rememberMe) {
      localStorage.setItem('ems_auth_token', token);
      localStorage.setItem('ems_user_session', JSON.stringify(session));
      sessionStorage.removeItem('ems_auth_token');
      sessionStorage.removeItem('ems_user_session');
    } else {
      sessionStorage.setItem('ems_auth_token', token);
      sessionStorage.setItem('ems_user_session', JSON.stringify(session));
      localStorage.removeItem('ems_auth_token');
      localStorage.removeItem('ems_user_session');
    }

    setUser(session);
    return session;
  };

  const setUserRolePreview = (newRole: UserRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    if (localStorage.getItem('ems_user_session')) {
      localStorage.setItem('ems_user_session', JSON.stringify(updated));
    } else {
      sessionStorage.setItem('ems_user_session', JSON.stringify(updated));
    }
  };

  const isAdmin = user?.role === 'Admin';
  const isHR = user?.role === 'HR';
  const isManager = user?.role === 'Manager';
  const isEmployee = user?.role === 'Employee';
  const isSupport = user?.role === 'Support';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout: handleLogout,
        setUserRolePreview,
        isAdmin,
        isHR,
        isManager,
        isEmployee,
        isSupport,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
