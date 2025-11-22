import { useYtdlpContext } from "@/contexts/ytdlp-context"
import { isUrlValid } from "@/lib/is-url-valid"
import { CopyIcon, HeadphonesIcon, VideoIcon } from "lucide-react";
import { useState, type FC } from "react"
import { toast } from "sonner"
import { Icon } from "@/components/ocodo-ui/icon"
import { Img } from "react-image"
import { controlIconClassName } from "@/lib/style";
import { cn } from "@/lib/utils";
interface YoutubeSearchResultRowType {
  id: string
  title: string
  thumbnails: string[]
  long_desc: string
  channel: string
  duration: string
  views: string
  publish_time: string
  url_suffix: string
}

export const YoutubeSearchResultBox: FC<YoutubeSearchResultRowType> = (props: YoutubeSearchResultRowType) => {

  const {
    duration,
    publish_time,
    channel,
    title,
    thumbnails,
    url_suffix
  } = props

  const [showControls, setShowControls] = useState<boolean>(false)

  const watchRegex = /(\/watch\?v=[^&]+).*/
  const watchSuffix = url_suffix.replace(watchRegex, "$1")
  const youtubeUrl = () => `https://youtube.com${watchSuffix}`

  const {
    setInputUrl,
    startDownload,
    videoFormat,
    audioFormat,
    format,
    setFormat,
  } = useYtdlpContext()

  const downloadVideo = () => {
    setFormat(videoFormat)
    downloadContent()
  }
  const downloadAudio = () => {
    setFormat(audioFormat)
    downloadContent()
  }

  const downloadContent = () => {
    const url = youtubeUrl();
    if (isUrlValid(url)) {
      setInputUrl(url)
      setTimeout(() => {
        toast(`Downloading ${format} / ${title} / ${url}`)
        startDownload(url)
      }, 500)
    } else {
      toast(`Error ${url}`)
    }
  }

  const copyYoutubeUrl = async () => {
    const link = youtubeUrl()
    if (link == "") return
    try {
      await navigator.clipboard.writeText(link)
      toast.success(`${link} copied to clipboard`)
    } catch {
      toast.error(`Failed to copy ${link}`)
      console.error(`Failed to copy ${link}`)
    }
  }

  return (
    <div className="cursor-pointer bg-background rounded-xl shadow-xl hover:shadow-2xl relative flex flex-col overflow-clip"
      onMouseEnter={(e) => {
        e.stopPropagation()
        e.preventDefault()
        setShowControls(true)
      }}
      onMouseLeave={(e) => {
        e.stopPropagation()
        e.preventDefault()
        setShowControls(false)
      }}
    >

      <Img src={thumbnails} className="object-cover" />
      {showControls &&
        <div className="bg-background/30 rounded-full hover:bg-foreground/70 absolute p-2 top-2 right-2 flex gap-2 transition-all duration-500">
          <Icon
            onClick={downloadVideo}
            Icon={VideoIcon}
            className={cn(controlIconClassName, "text-background/60 hover:text-background")} />
          <Icon
            onClick={downloadAudio}
            Icon={HeadphonesIcon}
            className={cn(controlIconClassName, "text-background/60 hover:text-background")} />
          <Icon
            Icon={CopyIcon}
            onClick={copyYoutubeUrl}
            className={cn(controlIconClassName, "text-background/60 hover:text-background")} />
        </div>
      }
      <div className="px-4 py-2">
        <div className="text-sm font-bold p-2">
          {channel} | <span className="text-xs font-normal">{publish_time} | {duration}</span>
        </div>
        <div className="text-sm p-2">
          {title}
        </div>
      </div>
    </div >
  )
}
