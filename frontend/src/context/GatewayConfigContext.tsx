import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getGatewayUrl, setGatewayUrl, DEFAULT_GATEWAY_URL } from '../api/client';

interface GatewayConfigContextType {
  gatewayUrl: string;
  updateGatewayUrl: (url: string) => void;
  resetGatewayUrl: () => void;
  isOnline: boolean | null; // null = checking, true = reachable, false = unreachable
  lastChecked: Date | null;
  checkConnection: () => Promise<boolean>;
}

const GatewayConfigContext = createContext<GatewayConfigContextType | undefined>(undefined);

export const GatewayConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gatewayUrl, setUrlState] = useState<string>(getGatewayUrl());
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = useCallback(async (): Promise<boolean> => {
  const url = getGatewayUrl();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Only check whether the Gateway itself is reachable.
    // Do NOT call a protected API endpoint such as /api/v1/departments.
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    // Any HTTP response means the Gateway is reachable.
    const alive = response !== null && response !== undefined;

    setIsOnline(alive);
    setLastChecked(new Date());

    return alive;
  } catch {
    setIsOnline(false);
    setLastChecked(new Date());
    return false;
  }
}, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const updateGatewayUrl = (newUrl: string) => {
    setGatewayUrl(newUrl);
    setUrlState(getGatewayUrl());
    checkConnection();
  };

  const resetGatewayUrl = () => {
    setGatewayUrl(DEFAULT_GATEWAY_URL);
    setUrlState(DEFAULT_GATEWAY_URL);
    checkConnection();
  };

  return (
    <GatewayConfigContext.Provider
      value={{
        gatewayUrl,
        updateGatewayUrl,
        resetGatewayUrl,
        isOnline,
        lastChecked,
        checkConnection,
      }}
    >
      {children}
    </GatewayConfigContext.Provider>
  );
};

export function useGatewayConfig() {
  const context = useContext(GatewayConfigContext);
  if (!context) {
    throw new Error('useGatewayConfig must be used within a GatewayConfigProvider');
  }
  return context;
}
