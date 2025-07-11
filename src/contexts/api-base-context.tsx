/* eslint-disable react-refresh/only-export-components */
import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type ReactNode
} from 'react';

// --- Constants ---
const DEFAULT_BACKEND_PORTS = [5150, 5000, 8000, 4860];
const SERVER_CONFIG_PATH = '/server_config/server.json';
const HEALTH_CHECK_PATH = '/health';
const PROBE_TIMEOUT_MS = 300;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_METHOD_NOT_ALLOWED = 405;

// --- Types ---
interface ApiBaseContextType {
  apiBase: string | null;
  loading: boolean;
  error: string | null;
  retryInitialization: () => void;
  apiFetch: (path: string, options?: RequestInit) => Promise<Response>;
}

const ApiBaseContext = createContext<ApiBaseContextType | undefined>(undefined);

export const useApiBase = () => {
  const context = useContext(ApiBaseContext);
  if (context === undefined) {
    throw new Error('useApiBase must be used within an ApiBaseProvider');
  }
  return context;
};

interface ApiBaseProviderProps {
  children: ReactNode;
}

let _cachedApiBase: string | null = null;
const determineApiBaseUrlInternal = async (): Promise<string> => {
    if (_cachedApiBase) {
        return _cachedApiBase;
    }

    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    const possibleBackendPorts: number[] = [...DEFAULT_BACKEND_PORTS]; // Create a copy to avoid mutating the constant array

    // Attempt to fetch a user-defined port from a configuration file.
    const configUrl = SERVER_CONFIG_PATH;
    try {
        console.debug(`ApiBaseProvider: Attempting to fetch server config from ${SERVER_CONFIG_PATH}`);
        const response = await fetch(configUrl);
        if (response.ok) {
            const config = await response.json();
            if (config && typeof config.port === 'number') {
                console.info(`ApiBaseProvider: Found user-defined port ${config.port} from server.json`);
                if (!possibleBackendPorts.includes(config.port)) {
                    possibleBackendPorts.unshift(config.port);
                }
            } else {
                console.warn(`ApiBaseProvider: server.json found but is malformed, proceeding with default ports.`);
            }
        } else if (response.status === HTTP_STATUS_NOT_FOUND) {
            console.info(`ApiBaseProvider: server.json not found (${HTTP_STATUS_NOT_FOUND}), proceeding with default ports.`);
        } else {
            console.warn(`ApiBaseProvider: Fetching server.json failed with status: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.warn(`ApiBaseProvider: Error fetching server.json:`, error);
    }

    console.info(`ApiBaseProvider: Attempting quick API_BASE check on ${hostname} with ports:`, possibleBackendPorts.join(', '));

    for (const port of possibleBackendPorts) {
        const probeUrl = `${protocol}//${hostname}:${port}${HEALTH_CHECK_PATH}`;
        console.debug(`ApiBaseProvider: Probing: ${probeUrl}`);

        const doProbe = async (method: 'HEAD' | 'GET'): Promise<Response | null> => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    console.warn(`ApiBaseProvider: ${method} probe to ${probeUrl} timed out after ${PROBE_TIMEOUT_MS}ms.`);
                    controller.abort();
                }, PROBE_TIMEOUT_MS);

                const response = await fetch(probeUrl, { method, signal: controller.signal });
                clearTimeout(timeoutId);
                return response;
            } catch (error: unknown) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    console.warn(`ApiBaseProvider: ${method} probe to ${probeUrl} aborted by timeout.`);
                } else if (error instanceof Error) {
                    console.warn(`ApiBaseProvider: ${method} probe to ${probeUrl} failed with error:`, error.message);
                } else {
                    console.warn(`ApiBaseProvider: ${method} probe to ${probeUrl} failed with unknown error.`);
                }
                return null;
            }
        };

        const onSuccessfulProbe = (method: 'HEAD' | 'GET'): string => {
            const baseUrl = `${protocol}//${hostname}:${port}`;
            _cachedApiBase = baseUrl;
            console.info(`ApiBaseProvider: API_BASE successfully determined via ${method}: ${baseUrl}`);
            return baseUrl;
        };

        const headResponse = await doProbe('HEAD');

        if (headResponse?.ok) { // Check for HTTP_STATUS_OK (200-299)
            return onSuccessfulProbe('HEAD');
        }

        if (headResponse?.status === HTTP_STATUS_METHOD_NOT_ALLOWED) { // Check for 405
            console.info(`ApiBaseProvider: HEAD probe to ${probeUrl} returned ${HTTP_STATUS_METHOD_NOT_ALLOWED} (Method Not Allowed). Retrying with GET.`);
            const getResponse = await doProbe('GET');
            if (getResponse?.ok) { // Check for HTTP_STATUS_OK (200-299)
                return onSuccessfulProbe('GET');
            } else if (getResponse) {
                console.warn(`ApiBaseProvider: GET probe to ${probeUrl} returned non-OK status: ${getResponse.status} ${getResponse.statusText}`);
            }
        } else if (headResponse) {
            console.warn(`ApiBaseProvider: HEAD probe to ${probeUrl} returned non-OK status: ${headResponse.status} ${headResponse.statusText}`);
        }
    }

    console.error("ApiBaseProvider: Quick API_BASE check failed. Backend not found on any probed ports.");
    throw new Error("Cannot connect to backend service. Please check URL or backend status.");
};

const StatusDisplay: React.FC<{ children: ReactNode, className?: string }> = ({ children, className }) => (
  <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
    <div className={`bg-card rounded-lg p-8 shadow-lg text-center max-w-sm w-full ${className || ''}`}>
      {children}
    </div>
  </div>
);

const ApiBaseProvider: React.FC<ApiBaseProviderProps> = ({ children }) => {
  const [apiBase, setApiBase] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const initializeApiBase = useCallback(async () => {
    if (apiBase) {
      return;
    }

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
  }, [apiBase]);

  useEffect(() => {
    if (!apiBase) {
      initializeApiBase();
    }
  }, [initializeApiBase, apiBase]);

  const apiFetch = useCallback(async (path: string, options?: RequestInit): Promise<Response> => {
    if (!apiBase) {
      throw new Error("API base URL is not available. Cannot perform fetch.");
    }
    const url = `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`;
    return fetch(url, options);
  }, [apiBase]);

  const contextValue: ApiBaseContextType = {
    apiBase,
    loading,
    error,
    retryInitialization: initializeApiBase,
    apiFetch
  };

  if (loading) {
    return (
      <StatusDisplay className="animate-pulse">
        <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold mt-4">Connecting to Backend...</h2>
        {error && <p className="text-orange-400 mt-2 text-sm">{error.replace('API service not reachable.', 'Searching for API...')}</p>}
        <p className="mt-4 text-xs text-foreground/70">Please wait while the application attempts to locate the backend service.</p>
      </StatusDisplay>
    );
  }

  if (error && !apiBase) {
    return (
      <StatusDisplay>
        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold mt-4 text-red-500">Backend Connection Failed</h2>
        <p className="text-foreground/90 mt-2">{error}</p>
        <p className="text-foreground/70 mt-2 text-sm">
          This can happen if the backend service isn't running or is on a non-standard port. For setup instructions, see the{' '}
          <a
            href="https://github.com/ocodo/uvxytdlp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            project docs.
          </a>.
        </p>
        <button
          onClick={initializeApiBase}
          className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors duration-200"
        >
          Try Again
        </button>
      </StatusDisplay>
    );
  }

  return (
    <ApiBaseContext.Provider value={contextValue}>
      {children}
    </ApiBaseContext.Provider>
  );
};

export default ApiBaseProvider;
