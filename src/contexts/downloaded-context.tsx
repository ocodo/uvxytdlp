/* eslint-disable react-refresh/only-export-components */
import { useApiBase } from '@/contexts/api-base-context'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useThrottle } from '@/hooks/use-throttle'
import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react'

export interface DownloadedFileType {
  name: string
  size: number
  mtime: string
}

export interface DownloadedPayload {
  files: DownloadedFileType[]
  errors: string[]
}

export const ViewTypes = {list: 'list', grid: 'grid'}
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
  const [viewType, setViewType] = useLocalStorage<ViewType>('downloadedContentViewType','list')
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

  const searchResults = (query: string) => {
    return downloadedFiles.filter(file => file.name.toLowerCase().includes(query.toLowerCase()))
  }

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
