import { Heading } from "@/components/heading"
import { ThemeProvider } from "@/components/theme-provider"
import { YtdlpProvider } from "@/contexts/ytdlp-service-context";
import { Toaster } from "@/components/ui/sonner"
import { DownloaderUI } from "@/components/downloader-ui";
import { DownloadedUI } from "@/components/downloaded-ui";
import { DownloadedProvider } from "@/contexts/downloaded-context";

function App() {
  return (
    <DownloadedProvider>
      <YtdlpProvider>
        <ThemeProvider>
          <Heading title="YouTube Downloader" />
          <DownloaderUI />
          <DownloadedUI />
          <Toaster />
        </ThemeProvider>
      </YtdlpProvider>
    </DownloadedProvider>
  )
}
export default App
