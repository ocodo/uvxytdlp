import { ConnectingStatusView } from '@/components/ocodo-ui/connecting-status-display';
import { ApiBaseContext } from '@/contexts/api-base-context';
import { createApiFetch } from '@/lib/api-fetch';
import React, {
  useState,
  useMemo,
  type ReactNode,
  useEffect,
} from 'react';

export interface ApiBaseContextType {
  apiBase: string | undefined;
  loading: boolean;
  apiFetch: ReturnType<typeof createApiFetch> | undefined;
}

interface ApiBaseProviderProps {
  children: ReactNode;
}

const ApiBaseProvider: React.FC<ApiBaseProviderProps> = ({ children }) => {
  const [apiBase, setApiBase] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [logoWait, setLogoWait] = useState<boolean>(true)

  useEffect(() => {
    setLoading(true);
    const base = `/api`
    setApiBase(base)
    console.log("ApiBaseProvider: Initialization successful.");
    setLoading(false);
  },[]);

  const apiFetch = useMemo(() => {
    if (!apiBase) {
      return undefined;
    }
    return createApiFetch(apiBase);
  }, [apiBase]);

  const contextValue: ApiBaseContextType = {
    apiBase,
    loading,
    apiFetch,
  };

  if (logoWait || loading) {
    return (
      <ConnectingStatusView ready={!!apiBase} onDone={() => setLogoWait(false)} />
    );
  }

  return (
    <ApiBaseContext.Provider value={contextValue}>
      {children}
    </ApiBaseContext.Provider>
  );
};

export default ApiBaseProvider;
