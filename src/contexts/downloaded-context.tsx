/* eslint-disable react-refresh/only-export-components */
import { config } from '@/lib/config';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface DownloadedFile {
  name: string;
  size: number;
  mtime: string; // ISO 8601 string
}

interface DownloadedContextType {
  downloadedFiles: DownloadedFile[];
  fetchDownloadedFiles: () => Promise<void>;
  // You might want to add loading/error states here too
  // isLoading: boolean;
  // error: Error | null;
}

const DownloadedContext = createContext<DownloadedContextType | undefined>(undefined);

export const DownloadedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [downloadedFiles, setDownloadedFiles] = useState<DownloadedFile[]>([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<Error | null>(null);

  const fetchDownloadedFiles = async () => {
    // setIsLoading(true);
    // setError(null);
    try {
      const response = await fetch(`${config.API_BASE}/downloaded`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: DownloadedFile[] = await response.json();
      setDownloadedFiles(data);
    } catch (err) {
      console.error('Failed to fetch downloaded files:', err);
      // setError(err as Error);
      setDownloadedFiles([]); // Clear list on error or keep previous?
    } finally {
      // setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloadedFiles()
  }, [])

  return (
    <DownloadedContext.Provider value={{ downloadedFiles, fetchDownloadedFiles }}>
      {children}
    </DownloadedContext.Provider>
  );
};

export const useDownloaded = () => {
  const context = useContext(DownloadedContext);
  if (context === undefined) {
    throw new Error('useDownloaded must be used within a DownloadedProvider');
  }
  return context;
};
