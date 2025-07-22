import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { getMinifiedBookmarklet } from '@/lib/get-bookmarklet'
import { ClipboardCopyIcon, ExternalLink } from 'lucide-react'
import { Icon } from '@/components/ocodo-ui/icon'

interface HasTitle {
  title: string
}

export const YtdlpSupportedSites: React.FC<HasTitle> = ({ title }) => (
  <a
    className='flex flex-row'
    href="https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md"
    target='_blank'
  >{title} <ExternalLink className='w-4 h-4' /></a>
)

export const BookmarkletSettingsView: React.FC = () => {
  const [bookmarkletUrl, setBookmarkletUrl] = useState<string>('')
  const [isHttp, setIsHttp] = useState(false)

  useEffect(() => {
    setIsHttp(window.location.protocol === 'http:')
    setBookmarkletUrl(getMinifiedBookmarklet())
  }, [])

  const handleCopy = async () => {
    if (!bookmarkletUrl) return
    try {
      await navigator.clipboard.writeText(bookmarkletUrl)
      toast.success('Bookmarklet code copied to clipboard!')
    } catch {
      toast.error('Failed to copy code.')
      console.error('Failed to copy bookmarklet URL')
    }
  }

  if (!bookmarkletUrl) return undefined

  return (
    <Card className="max-w-[92%] h-[50vh]">
      <CardContent className='max-[500px] overflow-hidden grid grid-col-auto gap-2'>
        <div className='relative'>
          {!isHttp && (
            <Icon
              Icon={ClipboardCopyIcon}
              className="cursor-pointer absolute top-1 right-1"
              onClick={handleCopy}
            />
          )}
          <pre
            className={`text-wrap overflow-scroll
                        p-2 border-1 border-foreground/30
                        rounded-lg font-bold
                        bg-background text-xs select-all`}
            style={{
              overflowWrap: 'anywhere',
            }}
          >
            {getMinifiedBookmarklet()}
          </pre>
        </div>
        <div className="text-sm">copy/drag to a new bookmark for instant download from <YtdlpSupportedSites title="any yt-dlp compatible site" /></div>
        {isHttp && (
          <div
            className="text-xs">
            (Note: on
            <code className={`font-bold`}> https: </code>
            clipboard copy button is shown)
          </div>
        )}
      </CardContent>
    </Card>
  )
}
