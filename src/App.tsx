import { useEffect } from "react"

import { DownloadedUI } from "@/components/downloaded-ui"
import { DownloaderUI } from "@/components/downloader-ui"
import { Heading } from "@/components/heading"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import ApiBaseProvider, { useApiBase } from '@/contexts/api-base-context'
import { DownloadedProvider, useDownloaded } from "@/contexts/downloaded-context"
import { YtdlpProvider } from "@/contexts/ytdlp-service-context"
import { toast } from "sonner"

const AppContent = () => {
  const { apiBase, loading, error } = useApiBase()
  const { downloadedFiles } = useDownloaded()

  if (loading || error || !apiBase) {
    return null
  }

  return (
    <ThemeProvider>
      <Heading title="YouTube Downloader" />
      <div className="border rounded-lg bg-card m-4 pb-2">
        <div className="px-4 py-2 text-lg font-bold">
          Download from YouTube
        </div>
        <div className="px-4 grid grid-cols-1 gap-1">
          <>
            <DownloaderUI />
            {Array.isArray(downloadedFiles) && downloadedFiles.length > 0
              && (<DownloadedUI />)}
          </>
        </div>
      </div>
      <Toaster />
    </ThemeProvider >
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
    <ApiBaseProvider>
      <DownloadedProvider>
        <YtdlpProvider>
          <AppContent />
        </YtdlpProvider>
      </DownloadedProvider>
    </ApiBaseProvider>
  )
}

export default App
