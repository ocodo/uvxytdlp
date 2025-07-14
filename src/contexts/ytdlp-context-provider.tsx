import React, {
  type ReactNode,
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
import { useHashUrl } from '@/contexts/hashurl-context'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { YtdlpContext } from '@/contexts/ytdlp-context'

interface YtdlpProviderProps {
  children: ReactNode
}

export interface YtdlpContextType {
  // Core URL State
  inputUrl: string
  setInputUrl: Dispatch<SetStateAction<string>>
  hashUrl: string
  setHashUrl: Dispatch<SetStateAction<string>>

  // Download Actions & Status
  startDownload: (downloadUrl?: string) => Promise<void>
  isLoading: boolean

  // Logging
  log: string
  setLog: Dispatch<SetStateAction<string>>
  clearLog: () => void
  showLog: boolean
  setShowLog: (newValue: boolean) => void

  // Configuration
  templateCliArg: string
  setTemplateCliArg: Dispatch<SetStateAction<string>>
  format: string
  setFormat: Dispatch<SetStateAction<string>>

  // restrictedFilenames
  restrictedFilenames: boolean
  setRestrictedFilenames: (newValue: boolean) => void

  // Progress
  progress: number
}

export const YtdlpProvider: React.FC<YtdlpProviderProps> = ({ children }) => {
  const [inputUrl, setInputUrl] = useState<string>("")
  const [log, setLog] = useState<string>("")
  const [showLog, setShowLog] = useLocalStorage<boolean>('showLog', false)
  const [restrictedFilenames, setRestrictedFilenames] = useLocalStorage<boolean>('restrictedFilenames', false)
  const [templateCliArg, setTemplateCliArg] = useState<string>("-t mp4")
  const [format, setFormat] = useState<string>("mp4")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const { hashUrl, setHashUrl } = useHashUrl()
  const { apiFetch } = useApiBase()
  const { fetchDownloadedFiles } = useDownloaded()

  const clearLog = () => setLog("")

  const startDownload = useCallback(async (downloadUrl: string = "") => {
    if (downloadUrl == "" || !isUrlValid(downloadUrl)) {
      downloadUrl = hashUrl !== "" ? hashUrl : inputUrl
      if (inputUrl !== downloadUrl) {
        setInputUrl(downloadUrl)
      }
      if (!isUrlValid(downloadUrl)) {
        const invalidUrlMessage = `Invalid YouTube URL provided: ${downloadUrl}`
        console.log(invalidUrlMessage)
        setLog(invalidUrlMessage)
        return
      }
    }
    setIsLoading(true)
    setLog("Starting download process...\n")
    setProgress(0)

    if (apiFetch) {
      try {
        const encodedUrl = encodeURIComponent(downloadUrl)
        const response = await apiFetch(`/ytdlp?url=${encodedUrl}&args=${templateCliArg} ${restrictedFilenames ? ' --restrict-filenames ' : ''}`)

        if (!response.ok || !response.body) {
          const errorText = await response.text()
          const errorMessage = `Error: ${response.status}\n${errorText}`
          console.log(errorMessage)
          setLog(prevLog => prevLog + errorMessage)
          setIsLoading(false)
          setProgress(0)
          return
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          const chunkString = decoder.decode(value, { stream: true })
          if (done) break

          buffer += chunkString
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            console.log(line)
            if (line.startsWith(`{ "percent": `)) {
              try {
                const progressLineJson = JSON.parse(line)
                const percentage = progressLineJson.percent
                console.log(`parsed percentage: ${percentage}`)
                setProgress(percentage) // Update progress (0 to 1)
              } catch (jsonError) {
                console.error("Failed to parse progress JSON:", jsonError, "Line:", line);
              }
            } else {
              setLog(prevLog => prevLog + line + '\n')
            }
          }
        }

        // Process any remaining buffer after the stream ends
        if (buffer) {
          setLog(prevLog => prevLog + buffer + '\n')
        }

        // Final actions upon successful stream completion
        fetchDownloadedFiles()
        setProgress(1) // Set to 100% on successful completion (0-1 scale)
        setInputUrl("")
        setHashUrl("")
        setLog(prevLog => prevLog + "\nDownload process completed.") // Add a final success message

      } catch (error) {
        console.error("Failed to stream or parse ytdlp output:", error)
        setLog(prevLog => prevLog + `\nNetwork, stream, or parsing error: ${String(error)}`)
        setProgress(0) // Reset or indicate error state
      } finally {
        setIsLoading(false)
      }
    }
  }, [
    apiFetch,
    templateCliArg,
    setHashUrl,
    hashUrl,
    inputUrl,
    fetchDownloadedFiles,
    restrictedFilenames
  ])

  useEffect(() => {
    if (Object.keys(formatTemplates).includes(format)) {
      setTemplateCliArg(formatTemplates[format])
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
    startDownload,
    isLoading,

    // Logging
    log,
    setLog,
    clearLog,
    showLog,
    setShowLog,

    // Configuration
    templateCliArg,
    setTemplateCliArg,
    format,
    setFormat,
    restrictedFilenames,
    setRestrictedFilenames,

    // Progress
    progress,
  }

  return <YtdlpContext.Provider value={value}>
    {children}
  </YtdlpContext.Provider>
}
