import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { isUrlValid } from '@/lib/is-url-valid'
import { OcodoLoaderIcon } from '@/components/ocodo-ui/ocodo-loader-icon'
import { HeadphonesIcon, VideoIcon } from 'lucide-react'
import { useYtdlpContext } from '@/contexts/ytdlp-context'
import { type FC } from "react"

export const DownloaderInput: FC = () => {
  const {
    inputUrl,
    setInputUrl,
    isLoading,
    audioFormat,
    videoFormat,
    startDownload,
  } = useYtdlpContext()

  return (
    <>
      <div className="flex items-center gap-2">
        <Input
          type="url"
          placeholder="Video Page URL to download..."
          aria-label="Video Page url"
          onChange={(event) => setInputUrl(event.target.value)}
          className="md:flex-1 border-none sm:border-foreground/15 url-input rounded-none sm:rounded-full h-12"
          disabled={isLoading}
          autoFocus
          value={inputUrl}
        />
        {isUrlValid(inputUrl) && isLoading && (
          <div className="ml-0 mt-2 md:mt-0 md:ml-2 flex flex-row items-center gap-x-2 text-primary-foreground">
            <Button
              disabled={true}
              className={`w-42 h-12 cursor-wait rounded-full transition-colors duration-1000`}>
              <OcodoLoaderIcon className="animate-spin" spinnerWidth={10} />
            </Button>
          </div>
        )}
        {isUrlValid(inputUrl) && !isLoading && (
          <div className="ml-0 mt-2 md:mt-0 md:ml-2 flex flex-row items-center gap-x-2 text-primary-foreground">
            <Button
              onClick={() => startDownload(inputUrl, videoFormat)}
              aria-label="Download Video"
              className={`w-20 h-12 cursor-pointer rounded-full transition-colors duration-1000`}>
              <VideoIcon className="h-6 w-6" />
            </Button>
            <Button
              onClick={() => startDownload(inputUrl, audioFormat)}
              aria-label="Download Audio"
              className={`w-20 h-12 cursor-pointer rounded-full transition-colors duration-1000`}>
              <HeadphonesIcon className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
