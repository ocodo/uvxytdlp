import { useYoutubeSearchContext } from "@/contexts/youtube-search-context"
import { useYtdlpContext } from "@/contexts/ytdlp-context"
import { isUrlValid } from "@/lib/is-url-valid"
import { CopyIcon, HeadphonesIcon, VideoIcon } from "lucide-react";
import { useState, type FC, type RefObject } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ocodo-ui/icon"
import { Img } from "react-image"
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

interface YoutubeSearchResultRowProps extends YoutubeSearchResultRowType {
  searchInput: RefObject<HTMLInputElement | undefined>
}

export const YoutubeSearchResultBox: FC<YoutubeSearchResultRowProps> = (props: YoutubeSearchResultRowProps) => {

  const {
    duration,
    publish_time,
    channel,
    title,
    thumbnails,
    url_suffix,
    searchInput,
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

  const {
    setResults
  } = useYoutubeSearchContext()

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
      if (searchInput.current) {
        searchInput.current.value = ""
      }
      setResults([])
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

  const controlIconClassName = cn(
    "hover:bg-accent/20",
    "p-1 rounded-full",
  )

  return (
    <div className="cursor-pointer bg-background rounded-xl shadow-2xl relative flex flex-col overflow-clip"
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        setShowControls(!showControls)
      }}
    >

      <Img src={thumbnails} className="object-cover" />
      {showControls &&
        <div className="bg-background/30 rounded-full hover:bg-background/80 absolute p-2 top-4 right-4 flex gap-2">
          <Icon
            onClick={downloadVideo}
            Icon={VideoIcon}
            className={controlIconClassName} />
          <Icon
            onClick={downloadAudio}
            Icon={HeadphonesIcon}
            className={controlIconClassName} />
          <Icon
            Icon={CopyIcon}
            onClick={copyYoutubeUrl}
            className={controlIconClassName} />
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
