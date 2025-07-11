import { XCircleIcon } from "lucide-react";
import { Presto } from "@/components/presto";
import { UrlInputCard } from "@/components/url-input-card";
import { Button } from "@/components/ui/button";
import { IndeterminateProgress } from "./indeterminate-progress";
import { useYtdlpContext } from "@/contexts/ytdlp-context";

export function DownloaderUI() {
  const {
    inputUrl,
    format,
    isLoading,
    log,
    progress,
    showLog,
    setShowLog,
    setInputUrl,
    setFormat,
    startDownload,
  } = useYtdlpContext();

  return (
    <div className="gap-2 grid grid-cols-1">
      <UrlInputCard
        url={inputUrl}
        setUrl={setInputUrl}
        format={format}
        setFormat={setFormat}
        startDownload={startDownload}
        isLoading={isLoading}
      />
      {(isLoading && progress >= 1.01) && <Progress />}
      {(isLoading && progress <= 1) && (
        <IndeterminateProgress />
      )}
      {showLog && log && (
        <div className="border rounded-lg">
          <div className="flex flex-row items-center justify-between">
            <div className="text-md py-2 px-4">log output</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLog(false)}
              aria-label="Hide Log"
            >
              <XCircleIcon className="h-6 w-6" style={{strokeWidth:0.5}} />
            </Button>
          </div>
          <Presto text={log} />
        </div>
      )}
    </div>
  );
}
