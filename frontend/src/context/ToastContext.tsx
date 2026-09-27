import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  fieldErrors?: Array<{ field?: string; message: string }>;
  traceId?: string;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string, fieldErrors?: Array<{ field?: string; message: string }>, traceId?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto-remove after 6 seconds for success/info, 9 seconds for error
    const timeoutDuration = toast.type === 'error' ? 9000 : 5000;
    setTimeout(() => {
      removeToast(id);
    }, timeoutDuration);
  }, [removeToast]);

  const success = useCallback((message: string, title: string = 'Success') => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const error = useCallback((message: string, title: string = 'Error', fieldErrors?: Array<{ field?: string; message: string }>, traceId?: string) => {
    showToast({ type: 'error', title, message, fieldErrors, traceId });
  }, [showToast]);

  const warning = useCallback((message: string, title: string = 'Warning') => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  const info = useCallback((message: string, title: string = 'Notice') => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border text-sm transition-all animate-in slide-in-from-bottom-2 ${
              t.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : t.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : t.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-sky-600" />}
            </div>
            <div className="flex-1 min-w-0">
              {t.title && <div className="font-semibold">{t.title}</div>}
              <div className="text-xs sm:text-sm opacity-90 break-words mt-0.5">{t.message}</div>
              {t.fieldErrors && t.fieldErrors.length > 0 && (
                <ul className="mt-2 text-xs space-y-1 bg-white/70 p-2 rounded border border-rose-200">
                  {t.fieldErrors.map((fe, idx) => (
                    <li key={idx} className="flex gap-1.5 text-rose-800">
                      <span className="font-semibold">{fe.field ? `${fe.field}:` : '•'}</span>
                      <span>{fe.message}</span>
                    </li>
                  ))}
                </ul>
              )}
              {t.traceId && (
                <div className="mt-1 font-mono text-[10px] opacity-70">
                  Trace ID: {t.traceId}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-slate-400 hover:text-slate-700 p-0.5"
              aria-label="Close toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
