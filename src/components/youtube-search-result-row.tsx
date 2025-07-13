import { Card, CardContent } from "@/components/ui/card"
import { Image } from "@/components/ui/image"
import { useYoutubeSearchContext } from "@/contexts/youtube-search-context"
import { useYtdlpContext } from "@/contexts/ytdlp-context"
import { isUrlValid } from "@/lib/is-url-valid"
import type { FC, RefObject } from "react"
import { toast } from "sonner"

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
  searchInput: RefObject<HTMLInputElement | null>
}

export const YoutubeSearchResultRow: FC<YoutubeSearchResultRowProps> = (props: YoutubeSearchResultRowProps) => {

  const {
    duration,
    publish_time,
    channel,
    title,
    thumbnails,
    url_suffix,
    searchInput,
  } = props

  const watchRegex = /(\/watch\?v=[^&]+).*/
  const watchSuffix = url_suffix.replace(watchRegex, "$1")
  const youtubeUrl = () => `https://youtube.com${watchSuffix}`

  const {
    setInputUrl,
    startDownload,
  } = useYtdlpContext()

  const {
    setResults
  } = useYoutubeSearchContext()

  const selectVideo = () => {
    const url = youtubeUrl();
    if (isUrlValid(url)) {
      setInputUrl(youtubeUrl())
      if (searchInput.current) {
        searchInput.current.value = ""
      }
      setResults([])
      setTimeout(() => {
        toast(`Downloading ${title}`)
        startDownload()
      }, 1500)
    } else {
      toast(`Error ${url}`)
    }
  }

  return (
    <Card
      className="cursor-pointer p-0 bg-background rounded-none shadow-2xl"
      onClick={selectVideo}
    >
      <CardContent className="p-2">
        <Image
          source={thumbnails} />
        <div className="text-sm font-bold p-2">
          {channel} | <span className="text-xs font-normal">{publish_time} | {duration}</span>
        </div>
        <div className="text-sm p-2">
          {title}
        </div>
      </CardContent>
    </Card>
  )
}
