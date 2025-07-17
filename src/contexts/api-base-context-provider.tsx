import { BackendConnectionFailed } from '@/components/ocodo-ui/backend-connection-failed';
import { ConnectingStatusView } from '@/components/ocodo-ui/connecting-status-display';
import { ApiBaseContext } from '@/contexts/api-base-context';
import { createApiFetch } from '@/lib/api-fetch';
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

const DEFAULT_BACKEND_PORTS = [5150, 5000, 8000, 4860];
const SERVER_CONFIG_PATH = '/server_config/server.json';
const HEALTH_CHECK_PATH = '/health';
const PROBE_TIMEOUT_MS = 300;

export interface ApiBaseContextType {
  apiBase: string | null;
  loading: boolean;
  error: string | null;
  retryInitialization: () => void;
  apiFetch: ReturnType<typeof createApiFetch> | null;
}

interface ApiBaseProviderProps {
  children: ReactNode;
}

let _cachedApiBase: string | null = null;

const determineApiBaseUrlInternal = async (): Promise<string> => {
  if (_cachedApiBase) return _cachedApiBase;

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const ports: number[] = [...DEFAULT_BACKEND_PORTS];

  try {
    const response = await fetch(SERVER_CONFIG_PATH);
    if (response.ok) {
      const config = await response.json();
      if (config?.port && typeof config.port === 'number' && !ports.includes(config.port)) {
        ports.unshift(config.port);
      }
    }
  } catch {
    console.warn("No custom server config found at :", SERVER_CONFIG_PATH);
    console.info("Can be used with Docker deployment style via local mount")
  }

  for (const port of ports) {
    const baseUrl = `${protocol}//${hostname}:${port}`;
    const healthUrl = `${baseUrl}${HEALTH_CHECK_PATH}`;

    const probe = async (method: 'HEAD' | 'GET'): Promise<boolean> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
        const response = await fetch(healthUrl, { method, signal: controller.signal });
        clearTimeout(timeoutId);
        return response.ok;
      } catch {
        return false;
      }
    };

    if (await probe('HEAD') || await probe('GET')) {
      _cachedApiBase = baseUrl;
      return baseUrl;
    }
  }

  throw new Error("Cannot connect to backend service. Please check URL or backend status.");
};

const ApiBaseProvider: React.FC<ApiBaseProviderProps> = ({ children }) => {
  const [apiBase, setApiBase] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [logoWait, setLogoWait] = useState<boolean>(true)

  const initializeApiBase = useCallback(async () => {
    setLoading(true);
    setError(null);
    setApiBase(null);
    _cachedApiBase = null;

    try {
      const base = await determineApiBaseUrlInternal();
      setApiBase(base);
      console.log("ApiBaseProvider: Initialization successful.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Unknown error connecting to backend.");
        console.error("ApiBaseProvider: Initialization failed:", err.message);
      } else {
        setError("An unknown error occurred during API initialization.");
        console.error("ApiBaseProvider: Initialization failed with unknown error.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeApiBase();
  }, [initializeApiBase]);

  const apiFetch = useMemo(() => {
    if (!apiBase) {
      return null;
    }
    return createApiFetch(apiBase);
  }, [apiBase]);

  const contextValue: ApiBaseContextType = {
    apiBase,
    loading,
    error,
    retryInitialization: initializeApiBase,
    apiFetch,
  };

  if (loading || logoWait) {
    return (
      <ConnectingStatusView ready={!!apiBase} onDone={() => setLogoWait(false)} error={error} />
    );
  }

  if (error && !apiBase) {
    return (
      <BackendConnectionFailed error={error} initializeApiBase={initializeApiBase} />
    );
  }

  return (
    <ApiBaseContext.Provider value={contextValue}>
      {children}
    </ApiBaseContext.Provider>
  );
};

export default ApiBaseProvider;
