import {
  type ReactNode,
  useState,
  useEffect,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type FC,
} from 'react'
import {
  formatTemplates,
  getBookmarkletFormat,
  uvxytdlp_format,
  type AudioFormat,
  type MediaFormat,
  type VideoFormat
} from "@/lib/template-formats"
import { isUrlValid } from '@/lib/is-url-valid'
import { useDownloaded } from '@/contexts/downloaded-context'
import { useApiBase } from '@/contexts/api-base-context'
import { useHashUrl } from '@/contexts/hashurl-context'
import { useLocalStorage } from 'usehooks-ts'
import { YtdlpContext } from '@/contexts/ytdlp-context'
import { toast } from 'sonner'
import { flushSync } from 'react-dom'

interface YtdlpProviderProps {
  children: ReactNode
}

interface DisplayableUvxytdlpUrl {
  url: string;
  format: MediaFormat;
  list: boolean;
}

export interface YtdlpContextType {
  inputUrl: string;
  setInputUrl: Dispatch<SetStateAction<string>>;
  hashUrl: string;
  setHashUrl: Dispatch<SetStateAction<string>>;
  startDownload(downloadUrl?: string, downloadFormat?: string): Promise<void>;
  isLoading: boolean;
  log: string;
  setLog: Dispatch<SetStateAction<string>>;
  clearLog(): void;
  showLog: boolean;
  setShowLog(newValue: boolean): void;
  templateCliArg: string;
  setTemplateCliArg: Dispatch<SetStateAction<string>>;
  setVideoFormat: Dispatch<SetStateAction<VideoFormat>>;
  videoFormat: VideoFormat;
  setAudioFormat: Dispatch<SetStateAction<AudioFormat>>;
  audioFormat: AudioFormat;
  setFormat: Dispatch<SetStateAction<MediaFormat>>;
  format: MediaFormat;
  setDefaultFormat: Dispatch<SetStateAction<MediaFormat>>;
  defaultFormat: MediaFormat;
  restrictedFilenames: boolean;
  setRestrictedFilenames: (newValue: boolean) => void;
  progress: number;
  showQueueInput: boolean;
  setShowQueueInput: Dispatch<SetStateAction<boolean>>;
  queueUrls: string[];
  setQueueUrls: Dispatch<SetStateAction<string[]>>;
  addQueueUrl(url: string, format: MediaFormat): void;
  removeQueueUrl(url: string): void;
  displayableUvxytdlpUrl(uvxytdlpUrl: string): DisplayableUvxytdlpUrl;
  downloadQueue(): Promise<void>;
  clearQueue(): void;
}

export const YtdlpProvider: FC<YtdlpProviderProps> = ({ children }) => {
  const [showQueueInput, setShowQueueInput] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>("");
  const [log, setLog] = useState<string>("");
  const [showLog, setShowLog] = useLocalStorage<boolean>('showLog', false);
  const [restrictedFilenames, setRestrictedFilenames] = useLocalStorage<boolean>('restrictedFilenames', false);
  const [templateCliArg, setTemplateCliArg] = useLocalStorage<string>("templateCliArg", "-t mp4");

  const [defaultFormat, setDefaultFormat] = useState<MediaFormat>('mp4');
  const [format, setFormat] = useLocalStorage<MediaFormat>("format", "mp4");
  const [videoFormat, setVideoFormat] = useLocalStorage<VideoFormat>("videoFormat", "mp4");
  const [audioFormat, setAudioFormat] = useLocalStorage<AudioFormat>("audioFormat", "m4a");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const { hashUrl, setHashUrl } = useHashUrl();
  const { apiFetch } = useApiBase();
  const { fetchDownloadedFiles } = useDownloaded();
  const [queueUrls, setQueueUrls] = useLocalStorage<string[]>("queueUrls", []);

  const clearLog = () => setLog("");

  const uvxytdlpUrlHref = (url: string, format: MediaFormat) => {
    const uvxytdlpUrl = new URL(url);
    uvxytdlpUrl.searchParams.append(uvxytdlp_format, format);
    return uvxytdlpUrl.href;
  }

  const displayableUvxytdlpUrl = (
    uvxytdlpUrl: string
  ): DisplayableUvxytdlpUrl => {
    const tempUrl = new URL(uvxytdlpUrl);
    const format = tempUrl.searchParams.get(uvxytdlp_format);

    if (format === null) {
      throw new Error("Invalid uvxytdlp URL: missing format");
    }

    tempUrl.searchParams.delete(uvxytdlp_format);

    return {
      url: tempUrl.href,
      format: format as MediaFormat,
      list: false,
    };
  };

  const removeQueueUrl = (url: string) => {
    setQueueUrls((prev) => prev.filter(
      item => item !== url
    ));
  }

  const addQueueUrl = (url: string, format: MediaFormat) => {
    const uvxytdlpUrl = uvxytdlpUrlHref(url, format)
    setQueueUrls((prev) => {
      if (prev.includes(uvxytdlpUrl)) {
        return prev;
      }
      return [uvxytdlpUrl, ...prev];
    })
  }

  const updateProgress = (newValue: number) => {
    if (newValue > 1) {
      document.title = `uvxytdlp ${newValue.toFixed(0)}%`
    } else {
      document.title = `uvxytdlp`
    }
    setProgress(newValue)
  }

  const clearQueue = async () => {
    toast("Cleared Queue")
    setQueueUrls([])
  }

  const downloadQueue = async () => {
    toast("Download Queue: not implemented, clears queue only")
    setQueueUrls([])
  }

  const startDownload = useCallback(async (downloadUrl: string = "", downloadFormat?: string) => {
    flushSync(async () => {
      if (downloadUrl == "" || !isUrlValid(downloadUrl)) {
        downloadUrl = hashUrl !== "" ? hashUrl : inputUrl
        if (inputUrl !== downloadUrl) {
          setInputUrl(downloadUrl)
        }
        if (!isUrlValid(downloadUrl)) {
          const invalidUrlMessage = `Invalid YouTube URL provided: ${downloadUrl}`
          console.log(invalidUrlMessage)
          toast(invalidUrlMessage)
          setLog(invalidUrlMessage)
          return
        }
      }
      setIsLoading(true)
      setLog("Starting download process...\n")
      setProgress(0)

      try {
        const cliArgs = downloadFormat && formatTemplates[downloadFormat] ? formatTemplates[downloadFormat] : templateCliArg
        if (apiFetch) {
          try {
            const encodedUrl = encodeURIComponent(downloadUrl)
            const response = await apiFetch(`/ytdlp?url=${encodedUrl}&args=${cliArgs} ${restrictedFilenames ? ' --restrict-filenames ' : ''}`)

            if (!response.ok || !response.body) {
              const errorText = await response.text()
              const errorMessage = `Error: ${response.status}\n${errorText}`
              console.log(errorMessage)
              setLog(prevLog => prevLog + errorMessage)
              setIsLoading(false)
              updateProgress(0)
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
                    updateProgress(percentage) // Update progress (0 to 1)
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
            updateProgress(1) // Set to 100% on successful completion (0-1 scale)
            setInputUrl("")
            setHashUrl("")
            setLog(prevLog => prevLog + "\nDownload process completed.") // Add a final success message

          } catch (error) {
            console.error("Failed to stream or parse ytdlp output:", error)
            setLog(prevLog => prevLog + `\nNetwork, stream, or parsing error: ${String(error)}`)
            updateProgress(0) // Reset or indicate error state
          } finally {
            setIsLoading(false)
          }
        }
      } catch {
        toast(`Invalid media format`)
      }
    })
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
    if (!hashUrl) return;

    startDownload(hashUrl, getBookmarkletFormat(hashUrl));
  }, [hashUrl, startDownload]);

  const value = {
    inputUrl,
    setInputUrl,
    hashUrl,
    setHashUrl,
    startDownload,
    isLoading,
    defaultFormat,
    setDefaultFormat,
    format,
    setFormat,
    videoFormat,
    setVideoFormat,
    audioFormat,
    setAudioFormat,
    log,
    setLog,
    clearLog,
    showLog,
    setShowLog,
    templateCliArg,
    setTemplateCliArg,
    restrictedFilenames,
    setRestrictedFilenames,
    setShowQueueInput,
    showQueueInput,
    progress,
    queueUrls,
    setQueueUrls,
    addQueueUrl,
    removeQueueUrl,
    displayableUvxytdlpUrl,
    downloadQueue,
    clearQueue,
  }

  return <YtdlpContext.Provider value={value}>
    {children}
  </YtdlpContext.Provider>
}
