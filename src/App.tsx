import { Heading } from "@/components/heading"
import { ThemeProvider } from "@/components/theme-provider"
import { YtdlpProvider } from "@/contexts/ytdlp-service-context";
import { Toaster } from "@/components/ui/sonner"
import { DownloaderUI } from "@/components/downloader-ui";

function App() {
  return (
    <YtdlpProvider>
      <ThemeProvider>
        <Heading title="YouTube Downloader" />
        <DownloaderUI />
        <Toaster />
      </ThemeProvider>
    </YtdlpProvider>
  )
}
export default App
