import { useEffect } from "react"
import { DownloadedUI } from "@/components/downloaded-ui"
import { DownloaderUI } from "@/components/downloader-ui"
import { Heading } from "@/components/heading"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import ApiBaseProvider, { useApiBase } from '@/contexts/api-base-context'
import { DownloadedProvider, useDownloaded } from "@/contexts/downloaded-context"
import { YtdlpProvider } from "@/contexts/ytdlp-context-provider"
import { toast } from "sonner"
import { HashUrlProvider } from "@/contexts/hashurl-context"
import { MDXProvider } from '@mdx-js/react'
import { VideoSettingsProvider } from "@/contexts/video-settings-context"


const AppContent = () => {
  const { apiBase, loading, error } = useApiBase()
  const { downloadedFiles } = useDownloaded()
  if (loading || error || !apiBase) {
    return null
  }
  return (
    <>
      <Heading
        title="uvxytdlp-ui"
      />
      <div className="border rounded-sm bg-card m-4 pt-4 pb-2">
        <div className="px-4 grid grid-cols-1 gap-1">
          <>
            <DownloaderUI />
            {
              Array.isArray(downloadedFiles) && downloadedFiles.length > 0
              &&
              <DownloadedUI />
            }
          </>
        </div>
      </div>
      <Toaster />
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
      const message = "An unexpected error occurred (promise rejection)" + event.reason
      toast.error(message)
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
      <MDXProvider>
        <ApiBaseProvider>
          <DownloadedProvider>
            <HashUrlProvider>
              <YtdlpProvider>
                <VideoSettingsProvider>
                  <AppContent />
                </VideoSettingsProvider>
              </YtdlpProvider>
            </HashUrlProvider>
          </DownloadedProvider>
        </ApiBaseProvider>
      </MDXProvider >
    </ThemeProvider >
  )
}

export default App
