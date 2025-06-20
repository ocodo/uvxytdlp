/* eslint-disable react-refresh/only-export-components */
import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type ReactNode
} from 'react';

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

const PROBE_TIMEOUT_MS = 300;
const HEALTH_CHECK_PATH = '/downloaded';

const determineApiBaseUrlInternal = async (): Promise<string> => {
    if (_cachedApiBase) {
        return _cachedApiBase;
    }

    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    const possibleBackendPorts: number[] = [
        5150,
        5000,
    ];

    console.info(`ApiBaseProvider: Attempting quick API_BASE check on ${hostname} with ports:`, possibleBackendPorts.join(', '));

    for (const port of possibleBackendPorts) {
        const probeUrl = `${protocol}//${hostname}:${port}${HEALTH_CHECK_PATH}`;
        console.debug(`ApiBaseProvider: Probing: ${probeUrl}`);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.warn(`ApiBaseProvider: Probe to ${probeUrl} timed out after ${PROBE_TIMEOUT_MS}ms.`);
                controller.abort();
            }, PROBE_TIMEOUT_MS);

            const response = await fetch(probeUrl, { method: 'HEAD', signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                _cachedApiBase = `${protocol}//${hostname}:${port}`;
                console.info(`ApiBaseProvider: API_BASE successfully determined: ${_cachedApiBase}`);
                return _cachedApiBase;
            } else {
                console.warn(`ApiBaseProvider: Probe to ${probeUrl} returned non-OK status: ${response.status} ${response.statusText}`);
            }
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                console.warn(`ApiBaseProvider: Probe to ${probeUrl} aborted by timeout.`);
            } else if (error instanceof Error) {
                console.warn(`ApiBaseProvider: Probe to ${probeUrl} failed with error:`, error.message);
            } else {
                console.warn(`ApiBaseProvider: Probe to ${probeUrl} failed with unknown error.`);
            }
        }
    }

    console.error("ApiBaseProvider: Quick API_BASE check failed. Backend not found on 5150 or 5000.");
    throw new Error("Cannot connect to backend service. Please check URL or backend status.");
};


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
      setLoading(false);
      console.log("ApiBaseProvider: Initialization successful.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Unknown error connecting to backend.");
        console.error("ApiBaseProvider: Initialization failed:", err.message);
      } else {
        setError("An unknown error occurred during API initialization.");
        console.error("ApiBaseProvider: Initialization failed with unknown error.");
      }
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    if (!apiBase) {
      initializeApiBase();
    }
  }, [initializeApiBase, apiBase]);

  const retryInitialization = useCallback(() => {
    if (!apiBase) {
      initializeApiBase();
    }
  }, [apiBase, initializeApiBase])


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
    retryInitialization,
    apiFetch
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
        <div className="bg-card rounded-lg p-8 shadow-lg text-center max-w-sm w-full animate-pulse">
          <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold mt-4">Connecting to Backend...</h2>
          {error && <p className="text-orange-400 mt-2 text-sm">{error.replace('API service not reachable.', 'Searching for API...')}</p>}
          <p className="mt-4 text-xs text-foreground/70">Please wait while the application attempts to locate the backend service.</p>
        </div>
      </div>
    );
  }

  if (error && !apiBase) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
        <div className="bg-card rounded-lg p-8 shadow-lg text-center max-w-sm w-full">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold mt-4 text-red-500">Backend Connection Failed</h2>
          <p className="text-foreground/90 mt-2">{error}</p>
          <p className="text-foreground/70 mt-2 text-sm">This usually means the backend service isn't running or is on a different port.</p>
          <button
            onClick={retryInitialization}
            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ApiBaseContext.Provider value={contextValue}>
      {children}
    </ApiBaseContext.Provider>
  );
};

export default ApiBaseProvider;
