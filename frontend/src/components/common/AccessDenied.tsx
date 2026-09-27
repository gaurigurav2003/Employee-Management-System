import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

export const AccessDenied: React.FC<{ message?: string; returnPath?: string }> = ({
  message = 'You do not have the required permissions to access this screen.',
  returnPath = '/dashboard',
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Access Restricted (403)</h2>
      <p className="text-sm text-slate-500 max-w-md mb-6">{message}</p>
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button variant="primary" size="sm" onClick={() => navigate(returnPath)}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};
