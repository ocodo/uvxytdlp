import { LogsIcon, XCircleIcon } from "lucide-react";
import { Presto } from "@/components/ocodo-ui/presto";
import { DownloaderInput } from "@/components/downloader/downloader-input";
import { IndeterminateProgress } from "../ocodo-ui/indeterminate-progress";
import { useYtdlpContext } from "@/contexts/ytdlp-context";
import { Progress } from "@/components/ui/progress";
import { thinIconStyle } from "@/lib/icon-style";

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
        <div className="flex items-center gap-4">
          {progress >= 3
            ? <Progress value={progress} max={100} />
            : <IndeterminateProgress />}
          <div
            className="hover:bg-foreground/20 cursor-pointer p-2 rounded-full transition-all duration-500"
            onClick={(e) => {
              e.preventDefault()
              setShowLog(!showLog)
            }}>
            {
              showLog
                ? <XCircleIcon style={thinIconStyle} />
                : <LogsIcon style={thinIconStyle} />
            }
          </div>
        </div>
      }
      {
        showLog && log && (
          <div className="border rounded-lg">
            <div className="flex flex-row items-center justify-between gap-2 p-2">
              <div className="text-md py-2 px-4">log output</div>
              <div className="rounded-full bg-foreground/20 cursor-pointer"
                onClick={() => setShowLog(false)}
              >
                <XCircleIcon className="h-6 w-6" style={thinIconStyle} />
              </div>
            </div>
            <Presto text={log} />
          </div>
        )
      }
    </div >
  );
}
