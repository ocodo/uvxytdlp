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
import { WavesurferSettingsProvider } from "@/contexts/wavesurfer-settings-provider"
import { OcodoLoaderBanner } from "@/components/ocodo-ui/ocodo-loader-icon"
import { DowloadQueueModal } from "@/components/downloader/download-queue-modal";
import { UvxYtdlpIcon } from "@/components/branding/uvxytdlp-icon"

const AppContent = () => {
  const { apiBase, loading } = useApiBase()
  const { downloadedFiles, isLoading } = useDownloaded()

  if (loading || !apiBase) {
    return undefined
  }
  return (
    <>
      <Heading
        title="uvxytdlp-ui"
      />
      <div className="border rounded-none sm:rounded-xl bg-card/60 backdrop-blur-lg sm:m-4 sm:pt-2 sm:pb-2">
        <div className="sm:px-4 grid grid-cols-1 gap-1">
          <>
            <DownloaderUI />
            <YoutubeSearchUI />
            {
              isLoading
                ?
                <div className="flex flex-row items-center-safe justify-center">
                  <OcodoLoaderBanner message="Fetch Downloads" />
                </div>
                : Array.isArray(downloadedFiles) && downloadedFiles.length > 0
                  ?
                  <DownloadedUI />
                  :
                  <>
                    <div className="p-3 pb-0 text-4xl font-thin tracking-tighter flex flex-row items-center gap-4">
                      <UvxYtdlpIcon className="opacity-30" size={160} strokeWidth={1} /> Your archive has no downloaded content, get some...
                    </div>
                  </>
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
      <HashUrlProvider>
        <ApiBaseProvider>
          <AudioPlayerProvider>
            <VideoPlayerProvider>
              <DownloadedProvider>
                <YoutubeSearchProvider>
                  <YtdlpProvider>
                    <CookiesSettingsProvider>
                      <WavesurferSettingsProvider>
                        <AppContent />
                        <DowloadQueueModal />
                      </WavesurferSettingsProvider>
                    </CookiesSettingsProvider>
                  </YtdlpProvider>
                </YoutubeSearchProvider>
              </DownloadedProvider>
            </VideoPlayerProvider>
          </AudioPlayerProvider>
        </ApiBaseProvider>
      </HashUrlProvider>
    </ThemeProvider >
  )
}

export default App
