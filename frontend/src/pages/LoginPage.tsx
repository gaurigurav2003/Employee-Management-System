import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useGatewayConfig } from '../context/GatewayConfigContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Eye, EyeOff, Layers, Server, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const { login } = useAuth();
  const { error: toastError, success } = useToast();
  const { isOnline, gatewayUrl } = useGatewayConfig();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toastError('Please enter both username/email and password.', 'Validation Error');
      return;
    }

    setIsLoading(true);
    try {
      const session = await login(username.trim(), password, rememberMe);
      success('Logged in successfully. Welcome back!', 'Authentication Successful');

      // Redirect based on role from JWT/server — no client-side role override
      const role = session.role;
      if (role === 'Admin') navigate('/dashboard');
      else if (role === 'HR') navigate('/dashboard');
      else if (role === 'Manager') navigate('/dashboard');
      else if (role === 'Employee') navigate('/dashboard');
      else if (role === 'Support') navigate('/dashboard');
      else navigate('/dashboard');
    } catch (err: any) {
      toastError(
        err.message || 'Invalid username or password. Please try again.',
        'Authentication Failed',
        err.errors,
        err.traceId
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Panel - Dark Hero Area */}
      <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle geometric background element */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-slate-800/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-slate-800/40 rounded-full blur-2xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center font-bold text-sm shadow-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-base flex items-center gap-1.5">
              EMS
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">.NET 9</span>
            </div>
            <div className="text-[11px] text-slate-400">PEOPLE OPERATIONS</div>
          </div>
        </div>

        {/* Center Headline */}
        <div className="relative z-10 my-16">
          <div className="text-xs font-mono text-slate-400 mb-4 tracking-widest uppercase">
            01 / PEOPLE OPERATIONS
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Work feels <br />
            <span className="italic font-serif font-normal text-slate-300">better here.</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-sm leading-relaxed">
            One considered workspace for every person, team, and important moment.
          </p>
        </div>

        {/* Bottom Metric Counters */}
        <div className="relative z-10 pt-8 border-t border-slate-800 grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">248</div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">Employees</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">94%</div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">Attendance</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">12</div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">Departments</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="md:w-7/12 flex flex-col justify-center items-center p-8 md:p-16 bg-slate-50/50">
        <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-xs">
          {/* Header */}
          <div className="mb-8">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block mb-2">
              EMPLOYEE MANAGEMENT SYSTEM
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to access your workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email or username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="name@company.com"
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-slate-700 hover:text-slate-900 font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Gateway indicator */}
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono text-[11px] truncate max-w-[200px]">{gatewayUrl}</span>
              </div>
              <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${isOnline ? 'text-emerald-700' : 'text-slate-500'}`}>
                {isOnline ? 'Connected' : 'Waiting for gateway'}
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Log in
            </Button>
          </form>

          {/* Help footer */}
          <p className="text-center text-xs text-slate-500 mt-6">
            Need access?{' '}
            <button
              onClick={() => alert('User accounts are created and managed by administrators. Contact your system administrator for access.')}
              className="text-slate-900 font-semibold hover:underline"
            >
              Contact your administrator
            </button>
          </p>
        </div>
      </div>

      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Password Recovery"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            In accordance with system security specifications, account credentials and password recovery are managed through your authorized administrator.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
            <strong>Need help logging in?</strong>
            <p className="mt-1">
              Please contact your EMS administrator at <span className="font-mono text-slate-900">admin@company.com</span> or contact internal IT Support.
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => setIsForgotModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
