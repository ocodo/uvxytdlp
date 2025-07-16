
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { isUrlValid } from '@/lib/is-url-valid'
import { OcodoLoaderIcon } from '@/components/ocodo-loader-icon'
import { YoutubeSearchUI } from '@/components/youtube-search-ui'
import { HeadphonesIcon, VideoIcon } from 'lucide-react'
import { useYtdlpContext } from '@/contexts/ytdlp-context'
import type { FC } from "react"


export const DownloaderInput: FC = () => {
  const {
    setFormat,
    audioFormat,
    videoFormat,
    inputUrl,
    setInputUrl,
    isLoading,
    startDownload,
  } = useYtdlpContext()


  const startVideoDownload = () => {
    setFormat(videoFormat)
    startDownload()
  }

  const startAudioDownload = () => {
    setFormat(audioFormat)
    startDownload()
  }

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
        {isUrlValid(inputUrl) && (
          <div className="ml-0 mt-2 md:mt-0 md:ml-2 flex flex-row items-center gap-x-2 text-primary-foreground">
            <Button
              onClick={() => !isLoading && startVideoDownload()}
              aria-label="Download Video"
              className={`w-20 h-12 rounded-full transition-colors duration-1000 ${isLoading ? "bg-primary/20" : ""}`}>
              {isLoading
                ? <OcodoLoaderIcon className="h-6 w-6 animate-spin" />
                : <VideoIcon className="h-6 w-6" />}
            </Button>
            <Button
              onClick={() => !isLoading && startAudioDownload()}
              aria-label="Download Audio"
              className={`w-20 h-12 rounded-full transition-colors duration-1000 ${isLoading ? "bg-primary/20" : ""}`}>
              {isLoading
                ? <OcodoLoaderIcon className="h-6 w-6 animate-spin" />
                : <HeadphonesIcon className="h-6 w-6" />}
            </Button>
          </div>
        )}
      </div>
      <YoutubeSearchUI />
    </>
  )
}
