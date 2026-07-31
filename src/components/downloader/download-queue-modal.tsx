import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useYtdlpContext } from "@/contexts/ytdlp-context";
import { isUrlValid } from "@/lib/is-url-valid";
import { CircleX, HeadphonesIcon, Minus, VideoIcon } from "lucide-react";
import { useState } from "react";
import { smallLinkText, extBadgeClasses, actionButtonClasses, thinIconStyle } from "@/lib/style";
import { cn } from "@/lib/utils";

export const DowloadQueueModal = () => {
  const {
    showQueueInput,
    setShowQueueInput,
    queueUrls,
    addQueueUrl,
    removeQueueUrl,
    audioFormat,
    videoFormat,
    displayableUvxytdlpUrl,
    downloadQueue,
    clearQueue,
  } = useYtdlpContext()

  const [newUrl, setNewUrl] = useState<string | undefined>();

  if (!showQueueInput) {
    return
  }

  return (
    showQueueInput &&
    <>
      <div
        className="backdrop-blur-lg w-screen h-screen fixed top-0 left-0"
        onClick={() => setShowQueueInput(false)}
      >
      </div>
      <div className={`bg-card/70 border border-t-0 p-5 top-0 left-1/6 w-2/3 h-2/3 fixed drop-shadow-lg rounded-b-lg`}>
        <div className={`flex flex-row items-center justify-between`}>
          <div className={`text-2xl pb-3 font-black tracking-tighter`}>Download Queue</div>
          <CircleX
            className={`stroke-1 cursor-pointer`}
            onClick={() => setShowQueueInput(false)} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center justify-between">
            <Input
              type="url"
              placeholder="Video Page URL to add..."
              aria-label="Video Page url"
              onChange={(event) => setNewUrl(event.target.value)}
              className="md:flex-1 border-none sm:border-foreground/15 url-input rounded-none sm:rounded-full h-12"
              autoFocus
              value={newUrl}
            />
            {isUrlValid(newUrl) && (
              <div className="ml-0 mt-2 md:mt-0 md:ml-2 flex flex-row items-center gap-x-2 text-primary-foreground">
                <CircleX
                  className={`cursor-pointer`}
                  style={thinIconStyle}
                  onClick={() => setNewUrl("")} />
                <Button
                  onClick={() => addQueueUrl(newUrl!, videoFormat)}
                  aria-label="Download Video"
                  className={`w-20 h-12 cursor-pointer rounded-full transition-colors duration-1000`}>
                  <VideoIcon className="h-6 w-6" />
                </Button>
                <Button
                  onClick={() => addQueueUrl(newUrl!, audioFormat)}
                  aria-label="Download Audio"
                  className={`w-20 h-12 cursor-pointer rounded-full transition-colors duration-1000`}>
                  <HeadphonesIcon className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>
          {queueUrls.length === 0 &&
            <>
              <div className="flex flex-col items-center justify-center h-70">
                <div className="text-lg">
                  Add yt-dlp compatible urls to download
                </div>
              </div>
            </>
          }
          {queueUrls.length > 0 &&
            <div className="flex flex-col gap-2 items-center">
              {
                queueUrls.map(url => {
                  const { url: displayableUrl, format } = displayableUvxytdlpUrl(url);
                  return (
                    <div className="even:bg-transparent odd:bg-foreground/5 p-2">
                      <div className="flex flex-row items-center justify-between gap-2">
                        <div className="flex flex-row items-center gap-2">
                          <div className={extBadgeClasses}>{format}</div>
                          {
                            displayableUrl.includes('list=') &&
                            <div className={extBadgeClasses}>playlist</div>
                          }
                          <div className={smallLinkText} key={url}>{displayableUrl}</div>
                        </div>
                        <Button
                          onClick={() => removeQueueUrl(url)}
                          aria-label="Remove url"
                          className={`w-6 h-6 cursor-pointer rounded-full transition-colors duration-1000`}>
                          <Minus />
                        </Button>
                      </div>
                    </div>
                  )
                }
                )
              }
              <div className="flex flex-row items-center gap-2">
                <div
                  className={cn(actionButtonClasses, "px-3 w-fit")}
                  onClick={() => { downloadQueue() }}>
                  Start Downloading
                </div>
                <div
                  className={cn(actionButtonClasses, "px-3 w-fit")}
                  onClick={() => { clearQueue() }}>
                  Clear Queue
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </>
  )

}
