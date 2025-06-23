/* eslint-disable react-refresh/only-export-components */
import React, {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { formatTemplates } from "@/lib/template-formats"
import { useDownloaded } from '@/contexts/downloaded-context'
import { useHashUrl } from '@/contexts/hashurl-context'
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
  ytdlpFromURL: (urlOverride?: string) => Promise<void>
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
  const { url: hashUrl, setUrl: setHashUrl } = useHashUrl()

  const isUrlValid = (urlToTest: string | null | undefined): urlToTest is string =>
    !!urlToTest && (urlToTest.startsWith("https://") || urlToTest.startsWith("http://"));

  const urlValid: () => boolean = useCallback(() => isUrlValid(url), [url])

  const clearLog = () => setLog("")

  const ytdlpFromURL = useCallback(async (urlOverride?: string) => {
    const downloadUrl = urlOverride ?? url
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
  }, [apiFetch, cliArgs, url, fetchDownloadedFiles])

  useEffect(() => {
    if (Object.keys(formatTemplates).includes(format)) {
      setCliArgs(formatTemplates[format])
    }
  }, [format])

  useEffect(() => {
    if (hashUrl) {
      setUrl(hashUrl)
      ytdlpFromURL(hashUrl)
      setHashUrl(null)
    }
  }, [hashUrl, setHashUrl, ytdlpFromURL])

  const value = {
    url, setUrl, log, setLog, cliArgs, setCliArgs, format, setFormat,
    urlValid, ytdlpFromURL, isLoading, clearLog,
  }

  return <YtdlpContext.Provider value={value}>{children}</YtdlpContext.Provider>
}
