/* eslint-disable react-refresh/only-export-components */
import { useApiBase } from '@/contexts/api-base-context'
import { useThrottle } from '@/hooks/use-throttle '
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface DownloadedFile {
  name: string
  size: number
  mtime: string
}

interface DownloadedContextType {
  downloadedFiles: DownloadedFile[]
  fetchDownloadedFiles: () => Promise<void>
  deleteFile: (fileName: string) => Promise<void>
  isLoading: boolean
  error: Error | null
}


const DownloadedContext = createContext<DownloadedContextType | undefined>(undefined)

export const DownloadedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [downloadedFiles, setDownloadedFiles] = useState<DownloadedFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { apiFetch } = useApiBase()

  const fetchDownloadedFiles = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiFetch(`/downloaded`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: DownloadedFile[] = await response.json()
      setDownloadedFiles(data)
    } catch (err) {
      console.error('Failed to fetch downloaded files:', err)
      setError(err as Error)
      setDownloadedFiles([])
    } finally {
      setIsLoading(false)
    }
  }

  const throttledFetchDownloadedFiles = useThrottle( fetchDownloadedFiles, 1000 )

  const deleteFile = async (fileName: string) => {
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

  useEffect(() => {
    throttledFetchDownloadedFiles()
  })

  return (
    <DownloadedContext.Provider value={{ downloadedFiles, fetchDownloadedFiles, deleteFile, isLoading, error }}>
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
