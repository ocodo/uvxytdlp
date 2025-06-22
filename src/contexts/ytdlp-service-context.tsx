/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { formatTemplates } from "@/lib/template-formats"
import { useDownloaded } from './downloaded-context' // Import useDownloaded
import { useApiBase } from '@/contexts/api-base-context'

interface YtdlpContextType {
  url: string
  setUrl: (url: string) => void
  log: string
  setLog: (log: string) => void
  cliArgs: string
  setCliArgs: (args: string) => void
  format: string
  setFormat: (format: string) => void
  urlValid: () => boolean
  ytdlpFromURL: () => Promise<void>
  isLoading: boolean
  clearLog: () => void
}

const YtdlpContext = createContext<YtdlpContextType | undefined>(undefined)

export const useYtdlp = (): YtdlpContextType => {
  const context = useContext(YtdlpContext)
  if (!context) {
    throw new Error('useYtdlp must be used within a YtdlpProvider')
  }
  return context
}

interface YtdlpProviderProps {
  children: ReactNode
}

export const YtdlpProvider: React.FC<YtdlpProviderProps> = ({ children }) => {
  const [url, setUrl] = useState<string>("")
  const [log, setLog] = useState<string>("")
  const [cliArgs, setCliArgs] = useState<string>("-t mp4")
  const [format, setFormat] = useState<string>("mp4")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { fetchDownloadedFiles } = useDownloaded()
  const { apiFetch } = useApiBase()
  const urlValid: () => boolean = () => !!url && url.startsWith("https://")

  const clearLog = () => setLog("")

  const ytdlpFromURL = async () => {
    if (!urlValid()) {
      setLog("Invalid YouTube URL provided.")
      return
    }
    setIsLoading(true)
    setLog("Starting download process...\n") // Initial log
    try {
      const response = await apiFetch(`/ytdlp`, {
        method: 'POST',
        body: JSON.stringify({
          args: cliArgs,
          url: url
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const text = await response.text()
      if (response.ok) {
        setLog(prevLog => prevLog + text)
        fetchDownloadedFiles()
      } else {
        setLog(prevLog => prevLog + `Error: ${response.status}\n${text}`)
      }
    } catch (error) {
      console.error("Failed to fetch from ytdlp_from_url:", error)
      setLog(prevLog => prevLog + `Network or server error: ${String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (Object.keys(formatTemplates).includes(format)) {
      setCliArgs(formatTemplates[format])
    }
  }, [format])

  const value = {
    url, setUrl, log, setLog, cliArgs, setCliArgs, format, setFormat,
    urlValid, ytdlpFromURL, isLoading, clearLog,
  }

  return <YtdlpContext.Provider value={value}>{children}</YtdlpContext.Provider>
}
