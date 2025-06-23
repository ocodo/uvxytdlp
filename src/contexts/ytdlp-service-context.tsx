/* eslint-disable react-refresh/only-export-components */
import React, {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { formatTemplates } from "@/lib/template-formats"
import { useDownloaded } from '@/contexts/downloaded-context'
import { useApiBase } from '@/contexts/api-base-context'

interface YtdlpContextType {
  // Core URL State
  inputUrl: string
  setInputUrl: Dispatch<SetStateAction<string>>
  hashUrl: string
  setHashUrl: Dispatch<SetStateAction<string>>

  // Download Actions & Status
  startDownload: () => Promise<void>
  isLoading: boolean

  // Logging
  log: string
  setLog: (log: string) => void
  clearLog: () => void

  // Configuration
  cliArgs: string
  setCliArgs: Dispatch<SetStateAction<string>>
  format: string
  setFormat: Dispatch<SetStateAction<string>>

  // Utilities
  isUrlValid: (url: string | null | undefined) => boolean
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
  const [inputUrl, setInputUrl] = useState<string>("")
  const [hashUrl, setHashUrl] = useState<string>("")
  const [log, setLog] = useState<string>("")
  const [cliArgs, setCliArgs] = useState<string>("-t mp4")
  const [format, setFormat] = useState<string>("mp4")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { fetchDownloadedFiles } = useDownloaded()
  const { apiFetch } = useApiBase()

  function isUrlValid(url: string | null | undefined): url is string {
    if (typeof url !== 'string') {
      return false
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return false
    }
    return true
  }

  const clearLog = () => setLog("")

  const startDownload = useCallback(async () => {
    const downloadUrl = hashUrl != "" ? hashUrl : inputUrl
    setInputUrl("")
    setHashUrl("")
    if (!isUrlValid(downloadUrl)) {
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
          url: downloadUrl
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
  }, [apiFetch, cliArgs, hashUrl, inputUrl, fetchDownloadedFiles])

  useEffect(() => {
    if (Object.keys(formatTemplates).includes(format)) {
      setCliArgs(formatTemplates[format])
    }
  }, [format])

  useEffect(() => {
    if (hashUrl) {
      startDownload()
    }
  }, [hashUrl, setHashUrl, startDownload])

  const value = {
    // Core URL State
    inputUrl,
    setInputUrl,
    hashUrl,
    setHashUrl,

    // Download Actions & Status
    startDownload, // The newly named function
    isLoading,

    // Logging
    log,
    setLog,
    clearLog,

    // Configuration
    cliArgs,
    setCliArgs,
    format,
    setFormat,

    // Utilities
    isUrlValid,
  }

  return <YtdlpContext.Provider value={value}>{children}</YtdlpContext.Provider>
}
