import { Presto } from "@/components/presto";
import { UrlInputCard } from "@/components/url-input-card";
import { useYtdlp } from "@/contexts/ytdlp-service-context";
import { Button } from "./ui/button";
import { XCircleIcon } from "lucide-react";

export function DownloaderUI() {
  const {
    url, setUrl, log, format, setFormat, urlValid, ytdlpFromURL, isLoading, clearLog
  } = useYtdlp();

  return (
    <div className="gap-2 grid grid-cols-1">
      <UrlInputCard
        url={url}
        setUrl={setUrl}
        format={format}
        setFormat={setFormat}
        urlValid={urlValid}
        ytdlpFromURL={ytdlpFromURL}
        isLoading={isLoading}
      />
      {log && (
        <div className="border rounded-lg">
          <div className="flex flex-row items-center justify-between">
            <div className="text-md py-2 px-4">Download Log</div>
            <Button variant="ghost" size="icon" onClick={clearLog} aria-label="Clear log">
              <XCircleIcon className="h-6 w-6" />
            </Button>
          </div>
          <Presto text={log} />
        </div>
      )}
    </div>
  )
}
