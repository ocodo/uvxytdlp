import { XCircleIcon } from "lucide-react";
import { Presto } from "@/components/ocodo-ui/presto";
import { DownloaderInput } from "@/components/downloader/downloader-input";
import { Button } from "@/components/ui/button";
import { IndeterminateProgress } from "../ocodo-ui/indeterminate-progress";
import { useYtdlpContext } from "@/contexts/ytdlp-context";
import { Progress } from "@/components/ui/progress";

export function DownloaderUI() {
  const {
    isLoading,
    log,
    progress,
    showLog,
    setShowLog,
  } = useYtdlpContext();

  return (
    <div className="gap-2 grid grid-cols-1">
      <DownloaderInput />
      {/* Show indeterminate progress while main download
        / addtional track downloads spin up */}
      {isLoading &&
        <div onClick={(e) => {
          e.preventDefault()
          setShowLog(true)
        }}>
          {progress <= 1 && (<IndeterminateProgress />)}
          {progress >= 3 && (<Progress value={progress} max={100} />)}
        </div>
      }
      {
        showLog && log && (
          <div className="border rounded-lg">
            <div className="flex flex-row items-center justify-between">
              <div className="text-md py-2 px-4">log output</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLog(false)}
                aria-label="Hide Log"
              >
                <XCircleIcon className="h-6 w-6" style={{ strokeWidth: 0.5 }} />
              </Button>
            </div>
            <Presto text={log} />
          </div>
        )
      }
    </div >
  );
}
