import { useEffect } from "react";
import { Heading } from "@/components/heading"
import { ThemeProvider } from "@/components/theme-provider"
import { YtdlpProvider } from "@/contexts/ytdlp-service-context";
import { Toaster } from "@/components/ui/sonner"
import { DownloaderUI } from "@/components/downloader-ui";
import { DownloadedUI } from "@/components/downloaded-ui";
import { DownloadedProvider, useDownloaded } from "@/contexts/downloaded-context";
import { toast } from "sonner";

function App() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Unhandled error:", event.error);
      toast.error(`An unexpected error occurred: ${event.message}`);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      let message = "An unexpected error occurred (promise rejection)."
      if (event.reason instanceof Error) {
        message = `Error: ${event.reason.message}`;
      } else if (typeof event.reason === 'string') {
        message = event.reason;
      }
      toast.error(message);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    // Cleanup listeners on component unmount
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  const AppContent = () => {
    const { downloadedFiles } = useDownloaded();
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
              {downloadedFiles && downloadedFiles.length > 0
                && (<DownloadedUI />)}
            </>
          </div>
        </div>
        <Toaster />
      </ThemeProvider >
    )
  }

  return (
    <DownloadedProvider>
      <YtdlpProvider>
        <AppContent />
      </YtdlpProvider>
    </DownloadedProvider>
  )
}
export default App
