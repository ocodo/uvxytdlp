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
import { isUrlValid } from '@/lib/is-url-valid'
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

  // Progress
  progress: number
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
  const [progress, setProgress] = useState<number>(0)

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
    setProgress(0) // Reset progress at the start of a new download

    try {
      const response = await apiFetch(`/ytdlp`, {
        method: 'POST',
        body: JSON.stringify({
          args: cliArgs,
          url: downloadUrl
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok || !response.body) {
        const errorText = await response.text()
        setLog(prevLog => prevLog + `Error: ${response.status}\n${errorText}`)
        setIsLoading(false)
        setProgress(0) // Reset progress on immediate error
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''

      const progressRegex = /(\d+\.\d+)/

      while (true) {
        const { done, value } = await reader.read()
        console.log(`streaming: ${value}`)
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          console.log(line)
          setLog(prevLog => prevLog + line + '\n')

          const match = line.match(progressRegex)
          if (match && match[1]) {
            const percentage = parseFloat(match[1]) / 100
            setProgress(percentage) // Update progress (0 to 1)
          }
        }
      }

      // Process any remaining buffer after the stream ends
      if (buffer) {
        setLog(prevLog => prevLog + buffer + '\n')
        const match = buffer.match(progressRegex)
        if (match && match[1]) {
          const percentage = parseFloat(match[1]) / 100
          setProgress(percentage)
        }
      }

      // Final actions upon successful stream completion
      fetchDownloadedFiles()
      setProgress(1) // Set to 100% on successful completion
      setLog(prevLog => prevLog + "\nDownload process completed.") // Add a final success message

    } catch (error) {
      console.error("Failed to stream or parse ytdlp output:", error)
      setLog(prevLog => prevLog + `\nNetwork, stream, or parsing error: ${String(error)}`)
      setProgress(0) // Reset or indicate error state
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

    // Progress
    progress,
  }

  return <YtdlpContext.Provider value={value}>{children}</YtdlpContext.Provider>
}
