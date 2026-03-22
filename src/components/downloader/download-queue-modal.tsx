import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useYtdlpContext } from "@/contexts/ytdlp-context"
import { CircleX, Minus, Plus } from "lucide-react"
import { useState } from "react"

export const DowloadQueueModal = () => {
  const { showQueueInput, setShowQueueInput, queueUrls, addQueueUrl, removeQueueUrl } = useYtdlpContext()

  const [newUrl, setNewUrl] = useState<string | undefined>();

  if (!showQueueInput) {
    return
  }

  return (
    showQueueInput &&
    <>
      <div className="backdrop-blur-lg w-screen h-screen fixed top-0 left-0">
      </div>
      <div className={`bg-card p-5 top-0 left-1/6 w-2/3 h-2/3 fixed drop-shadow-lg rounded-b-lg`}>
        <div className={`flex flex-row items-center justify-between`}>
          <div className={`text-3xl font-black tracking-tighter`}>Download Queue</div>
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
            <Button
              onClick={() => newUrl && addQueueUrl(newUrl)}
              aria-label="Remove url"
              className={`w-6 h-6 cursor-pointer rounded-full transition-colors duration-1000`}>
              <Plus />
            </Button>
          </div>
          {queueUrls.length > 0 &&
            <div className="flex flex-col gap-2">
              {
                queueUrls.map(url =>
                  <div className="flex flex-row items-center gap-2">
                    <div key={url}>{url}</div>
                    <Button
                      onClick={() => removeQueueUrl(url)}
                      aria-label="Remove url"
                      className={`w-6 h-6 cursor-pointer rounded-full transition-colors duration-1000`}>
                      <Minus />
                    </Button>
                  </div>
                )
              }
            </div>
          }
        </div>
      </div>
    </>
  )

}
