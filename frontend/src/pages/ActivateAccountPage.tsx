import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Layers, Eye, EyeOff, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

type PageState = 'form' | 'success' | 'error';

export const ActivateAccountPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageState, setPageState] = useState<PageState>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    if (!token) {
      setPageState('error');
      setErrorMessage('No activation token found in the URL. Please use the full activation link provided.');
    }
  }, [token]);

  const validatePassword = (pw: string): string => {
    if (pw.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(pw)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(pw)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(pw)) return 'Password must contain at least one number.';
    if (!/[^A-Za-z0-9]/.test(pw)) return 'Password must contain at least one special character.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError('');

    const pwError = validatePassword(password);
    if (pwError) {
      setFieldError(pwError);
      return;
    }

    if (password !== confirmPassword) {
      setFieldError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.activateAccount({ token, password, confirmPassword });
      setPageState('success');
    } catch (err: any) {
      setPageState('error');
      setErrorMessage(
        err.message ||
        'Failed to activate account. The token may be invalid, expired, or already used.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-slate-900 text-base flex items-center gap-1.5">
              EMS
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-500 font-mono">.NET 9</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">ACCOUNT ACTIVATION</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {/* ── Success state ─────────────────────────────────────────────── */}
          {pageState === 'success' && (
            <div className="text-center space-y-5">
              <div className="flex justify-center">
                <CheckCircle className="w-14 h-14 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Account Activated!</h2>
                <p className="text-sm text-slate-500 mt-2">
                  Your account has been activated successfully. You can now log in with your new password.
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
            </div>
          )}

          {/* ── Error state ────────────────────────────────────────────────── */}
          {pageState === 'error' && (
            <div className="text-center space-y-5">
              <div className="flex justify-center">
                <AlertTriangle className="w-14 h-14 text-rose-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Activation Failed</h2>
                <p className="text-sm text-slate-500 mt-2">{errorMessage}</p>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                If your link has expired, contact your administrator to generate a new activation link.
              </div>
              <Link to="/login" className="block">
                <Button variant="outline" size="md" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}

          {/* ── Form state ─────────────────────────────────────────────────── */}
          {pageState === 'form' && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Set Your Password</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose a strong password to activate your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, upper, lower, number, special"
                  required
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <Input
                  label="Confirm Password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                {/* Password requirements hint */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-0.5">
                  <div className="font-semibold text-slate-600 mb-1">Password requirements:</div>
                  <div className={password.length >= 8 ? 'text-emerald-600' : ''}>• At least 8 characters</div>
                  <div className={/[A-Z]/.test(password) ? 'text-emerald-600' : ''}>• One uppercase letter</div>
                  <div className={/[a-z]/.test(password) ? 'text-emerald-600' : ''}>• One lowercase letter</div>
                  <div className={/[0-9]/.test(password) ? 'text-emerald-600' : ''}>• One number</div>
                  <div className={/[^A-Za-z0-9]/.test(password) ? 'text-emerald-600' : ''}>• One special character</div>
                </div>

                {fieldError && (
                  <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                    {fieldError}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Activate Account
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Already activated?{' '}
          <Link to="/login" className="text-slate-700 font-semibold hover:underline">
            Go to Login
          </Link>
        </p>
      </div>
    </div>
  );
};
