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
  deleteFile: (fileName: string) => Promise<void>;
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

  const deleteFile = async (fileName: string) => {
    try {
      const response = await fetch(`${config.API_BASE}downloaded/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      // Optionally, you can check the response body for a success message
      // const data = await response.json();
      // console.log('File deleted successfully:', data.message);
      await fetchDownloadedFiles(); // Refresh the list after successful deletion
    } catch (err) {
      console.error(`Failed to delete file ${fileName}:`, err);
      // setError(err as Error); // Consider setting an error state to show in UI
      // Optionally, re-fetch files even on error to ensure UI consistency,
      // or provide specific error feedback to the user.
    }
  };

  useEffect(() => {
    fetchDownloadedFiles()
  }, [])

  return (
    <DownloadedContext.Provider value={{ downloadedFiles, fetchDownloadedFiles, deleteFile }}>
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
