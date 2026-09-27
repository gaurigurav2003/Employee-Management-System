import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { useGatewayConfig } from '../../context/GatewayConfigContext';
import { Server, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface GatewaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GatewaySettingsModal: React.FC<GatewaySettingsModalProps> = ({ isOpen, onClose }) => {
  const { gatewayUrl, updateGatewayUrl, resetGatewayUrl, isOnline, checkConnection, lastChecked } = useGatewayConfig();
  const [urlInput, setUrlInput] = useState(gatewayUrl);
  const [isTesting, setIsTesting] = useState(false);
  const { success, error } = useToast();

  const handleTest = async () => {
    setIsTesting(true);
    const alive = await checkConnection();
    setIsTesting(false);
    if (alive) {
      success('Connected successfully to YARP API Gateway!', 'Connection OK');
    } else {
      error(`Unable to reach gateway at ${urlInput}. Ensure your .NET gateway is running at http://localhost:5000`, 'Connection Failed');
    }
  };

  const handleSave = () => {
    updateGatewayUrl(urlInput);
    success('Gateway URL configuration updated.');
    onClose();
  };

  const handleReset = () => {
    resetGatewayUrl();
    setUrlInput('http://localhost:5000');
    success('Gateway URL reset to default (http://localhost:5000).');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="YARP API Gateway Configuration"
      subtitle="Routing and microservices endpoint status"
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset Default
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save Changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-lg border bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900">Gateway Status:</span>
                {isOnline === null ? (
                  <span className="text-xs text-slate-500">Checking...</span>
                ) : isOnline ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Reachable
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700">
                    <AlertTriangle className="w-3.5 h-3.5" /> Offline / Unreachable
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {lastChecked ? `Last probe: ${lastChecked.toLocaleTimeString()}` : 'Default target: http://localhost:5000'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            isLoading={isTesting}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Test Ping
          </Button>
        </div>

        <div>
          <Input
            label="Gateway Base URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            helperText="Default: http://localhost:5000. All React requests route strictly through this entry point."
            placeholder="http://localhost:5000"
          />
        </div>

        <div className="rounded-lg border border-slate-200 p-3 bg-white">
          <h4 className="text-xs font-semibold text-slate-800 mb-2">Active Service Routes</h4>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600">
            <div className="p-1.5 rounded bg-slate-50">/api/v1/auth/*</div>
            <div className="p-1.5 rounded bg-slate-50">/api/v1/employees/*</div>
            <div className="p-1.5 rounded bg-slate-50">/api/v1/departments/*</div>
            <div className="p-1.5 rounded bg-slate-50">/api/v1/salaries/*</div>
            <div className="p-1.5 rounded bg-slate-50">/api/v1/leaves/*</div>
            <div className="p-1.5 rounded bg-slate-50">/api/v1/attendance/*</div>
            <div className="p-1.5 rounded bg-slate-50">/api/v1/support-tickets/*</div>
            <div className="p-1.5 rounded bg-slate-50">/api/v1/notifications/*</div>
          </div>
        </div>

        {!isOnline && (
          <div className="p-3 text-xs bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
            <div className="font-semibold mb-1">Backend Connection Notice:</div>
            Please make sure your YARP API Gateway is running on port 5000:
            <code className="block mt-1 p-1 bg-white/70 rounded border border-amber-300 font-mono text-[11px]">
              dotnet run --project backend/api-gateway
            </code>
          </div>
        )}
      </div>
    </Modal>
  );
};
