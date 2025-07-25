import { useEffect } from "react"
import { DownloadedUI } from "@/components/downloaded/downloaded-ui"
import { DownloaderUI } from "@/components/downloader/downloader-ui"
import { Heading } from "@/components/ocodo-ui/heading"
import { ThemeProvider } from "@/contexts/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { useApiBase } from '@/contexts/api-base-context'
import { DownloadedProvider, useDownloaded } from "@/contexts/downloaded-context"
import { YtdlpProvider } from "@/contexts/ytdlp-context-provider"
import { toast } from "sonner"
import { HashUrlProvider } from "@/contexts/hashurl-context"
import { CookiesSettingsProvider } from "@/contexts/cookie-settings-context-provider"
import { YoutubeSearchProvider } from "@/contexts/youtube-search-context-provider"
import ApiBaseProvider from "@/contexts/api-base-context-provider"
import { AudioPlayerProvider } from "@/contexts/audio-player-context-provider"
import { YoutubeSearchUI } from "@/components/downloader/youtube-search-ui"
import { VideoPlayerProvider } from "@/contexts/video-player-context-provider"

const AppContent = () => {
  const { apiBase, loading, error } = useApiBase()
  const { downloadedFiles } = useDownloaded()
  if (loading || error || !apiBase) {
    return undefined
  }
  return (
    <>
      <Heading
        title="uvxytdlp-ui"
      />
      <div className="border rounded-none sm:rounded-lg bg-card sm:m-4 sm:pt-2 sm:pb-2">
        <div className="sm:px-4 grid grid-cols-1 gap-1">
          <>
            <DownloaderUI />
            <YoutubeSearchUI />
            {
              Array.isArray(downloadedFiles) && downloadedFiles.length > 0
              &&
              <DownloadedUI />
            }
          </>
        </div>
      </div>
      <Toaster
        position="bottom-center"
        theme='dark'
        richColors />
    </>
  )
}

function App() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Unhandled error:", event.error)
      toast.error(`An unexpected error occurred: ${event.message}`)
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason)
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  return (
    <ThemeProvider>
      <ApiBaseProvider>
        <AudioPlayerProvider>
          <VideoPlayerProvider>
            <DownloadedProvider>
              <HashUrlProvider>
                <YoutubeSearchProvider>
                  <YtdlpProvider>
                    <CookiesSettingsProvider>
                      <AppContent />
                    </CookiesSettingsProvider>
                  </YtdlpProvider>
                </YoutubeSearchProvider>
              </HashUrlProvider>
            </DownloadedProvider>
          </VideoPlayerProvider>
        </AudioPlayerProvider>
      </ApiBaseProvider>
    </ThemeProvider >
  )
}

export default App
