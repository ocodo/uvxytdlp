/* eslint-disable react-refresh/only-export-components */
import { useApiBase } from '@/contexts/api-base-context'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useThrottle } from '@/hooks/use-throttle'
import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react'
import { normalizeUnicodeText as tr } from 'normalize-unicode-text'
import { levenshtein } from '@/lib/levenshtein'
import '@/lib/smallcaps-to-ascii';

export interface DownloadedFileType {
  name: string
  size: number
  mtime: string
  title?: string
  description?: string
  duration: string
}

export interface DownloadedPayload {
  files: DownloadedFileType[]
  errors: string[]
}

export const ViewTypes = { list: 'list', grid: 'grid' }
export type ViewType = typeof ViewTypes[keyof typeof ViewTypes];

interface DownloadedContextType {
  downloadedFiles: DownloadedFileType[]
  fetchDownloadedFiles: () => Promise<void>
  deleteFile: (fileName: string) => Promise<void>
  browserDownloadFile: (fileName: string) => void
  viewType: ViewType
  setViewType: (newValue: ViewType) => void
  isLoading: boolean
  error: Error | undefined
  searchResults: (query: string) => DownloadedFileType[]
}

const DownloadedContext = createContext<DownloadedContextType | undefined>(undefined)

export const DownloadedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [downloadedFiles, setDownloadedFiles] = useState<DownloadedFileType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewType, setViewType] = useLocalStorage<ViewType>('downloadedContentViewType', 'list')
  const [error, setError] = useState<Error | undefined>(undefined)
  const { apiFetch, apiBase } = useApiBase()

  const fetchDownloadedFiles = useCallback(async () => {
    setIsLoading(true)
    setError(undefined)
    if (apiFetch) {
      try {
        const response = await apiFetch(`/downloaded`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        if (data.errors?.length > 0) {
          console.log("errors in dowloaded files")
          console.table(data.errors)
        }
        setDownloadedFiles(data.files)
      } catch (err) {
        console.error('Failed to fetch downloaded files:', err)
        setError(err as Error)
        setDownloadedFiles([])
      } finally {
        setIsLoading(false)
      }
    }
  }, [apiFetch])

  const throttledFetchDownloadedFiles = useThrottle(fetchDownloadedFiles, 1000)

  const searchResults = (query: string, levenshteinThreshold: number = 3) => {
    const normalizedQuery = tr(query.trim());
    if (!normalizedQuery) {
      // Sort by mtime descending if no query
      return [...downloadedFiles].sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
    }

    const queryWords = normalizedQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return downloadedFiles
      .map(file => {
        const normalizedName = tr(file.name).toLocaleLowerCase().smallCapsToAscii();

        // Calculate Levenshtein scores for each query word and each word in the file name
        const levenshteinScores = normalizedName.split(' ').reduce((scores: number[], nw) => {
          queryWords.forEach(qw => {
            const distance = levenshtein(qw, nw);  // Fuzzy match using Levenshtein distance
            if (distance <= levenshteinThreshold) {
              // Calculate the "fuzziness" score: closer matches give higher scores
              scores.push(levenshteinThreshold - distance);
            }
          });
          return scores;
        }, []);

        // Fuzziness score based on Levenshtein distances (weight it more if needed)
        const levUp = levenshteinScores.reduce((acc, lev_s) => acc + lev_s, 0);

        // Calculate direct word matches (for exact matches)
        const wordMatchScore = queryWords.reduce((acc: number, word: string) =>
          normalizedName.includes(word) ? acc + 1 : acc, 0);

        // Combine fuzzy match (levUp) and exact word matches (wordMatchScore)
        const score = levUp + wordMatchScore;

        return { file, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || new Date(b.file.mtime).getSeconds() - new Date(a.file.mtime).getSeconds())
      .map(item => item.file);
  };


  const deleteFile = useCallback(async (fileName: string) => {
    if (apiFetch) {
      try {
        const response = await apiFetch(`downloaded/${encodeURIComponent(fileName)}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
        }
        setDownloadedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
      } catch (err) {
        console.error(`Failed to delete file ${fileName}:`, err)
      }
    }
  }, [apiFetch])

  const browserDownloadFile = async (fileName: string) => {
    const url = `${apiBase}/download/${fileName}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  useEffect(() => {
    throttledFetchDownloadedFiles()
  }, [throttledFetchDownloadedFiles])

  return (
    <DownloadedContext.Provider value={{
      downloadedFiles,
      fetchDownloadedFiles,
      deleteFile,
      browserDownloadFile,
      isLoading,
      error,
      searchResults,
      viewType,
      setViewType,
    }}>
      {children}
    </DownloadedContext.Provider>
  )
}

export const useDownloaded = () => {
  const context = useContext(DownloadedContext)
  if (context === undefined) {
    throw new Error('useDownloaded must be used within a DownloadedProvider')
  }
  return context
}
