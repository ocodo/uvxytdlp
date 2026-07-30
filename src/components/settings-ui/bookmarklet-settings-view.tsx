import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { getMinifiedBookmarklet } from '@/lib/get-bookmarklet'
import { ClipboardCopyIcon, ExternalLink } from 'lucide-react'
import { Icon } from '@/components/ocodo-ui/icon'
import { AudioFormats, VideoFormats } from '@/lib/template-formats'

interface HasTitle {
  title: string
}

interface Bookmarklet {
  title: string
  url: string
}

export const YtdlpSupportedSites: React.FC<HasTitle> = ({ title }) => (
  <a
    className="flex flex-row"
    href="https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md"
    target="_blank"
  >
    {title} <ExternalLink className="w-4 h-4" />
  </a>
)

export const BookmarkletSettingsView: React.FC = () => {
  const [bookmarklets, setBookmarklets] = useState<Bookmarklet[]>([])
  const [isHttp, setIsHttp] = useState(false)

  useEffect(() => {
    setIsHttp(window.location.protocol === 'http:')

    const bookmarklet = getMinifiedBookmarklet()

    setBookmarklets([
      {
        title: 'Default download',
        url: bookmarklet,
      },
      ...Object.values(AudioFormats).map((format) => ({
        title: `Audio (${format})`,
        url: `${bookmarklet}&uvxytdlp_format=${format}`,
      })),
      ...Object.values(VideoFormats).map((format) => ({
        title: `Video (${format})`,
        url: `${bookmarklet}&uvxytdlp_format=${format}`,
      })),
    ])
  }, [])

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Bookmarklet code copied to clipboard!')
    } catch {
      toast.error('Failed to copy code.')
      console.error('Failed to copy bookmarklet URL')
    }
  }

  if (!bookmarklets.length) return undefined

  return (
    <Card className="max-w-[92%] h-[50vh]">
      <CardContent className="max-[500px] overflow-y-auto grid grid-col-auto gap-2">
        {bookmarklets.map(({ title, url }) => (
          <div key={title} className="relative">
            {!isHttp && (
              <Icon
                Icon={ClipboardCopyIcon}
                className="cursor-pointer absolute top-1 right-1"
                onClick={() => handleCopy(url)}
              />
            )}

            <div className="text-sm font-bold">
              {title}
            </div>

            <pre
              className={`text-wrap overflow-scroll
                          p-2 border-1 border-foreground/30
                          rounded-lg font-bold
                          bg-background text-xs select-all`}
              style={{
                overflowWrap: 'anywhere',
              }}
            >
              {url}
            </pre>
          </div>
        ))}

        <div className="text-sm">
          Copy/drag to a new bookmark for instant download from{' '}
          <YtdlpSupportedSites title="any yt-dlp compatible site" />
        </div>

        {isHttp && (
          <div className="text-xs">
            (Note: on
            <code className="font-bold"> https: </code>
            clipboard copy button is shown)
          </div>
        )}
      </CardContent>
    </Card>
  )
}