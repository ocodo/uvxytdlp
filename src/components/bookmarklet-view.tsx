import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getBookmarklet, getMinifiedBookmarklet } from '@/lib/get-bookmarklet'
import { cn } from '@/lib/utils'
import { ClipboardCopyIcon } from 'lucide-react'

interface BookmarkletViewProps {
  className?: string
}

export const BookmarkletView: React.FC<BookmarkletViewProps> = ({ className }) => {
  const [bookmarkletUrl, setBookmarkletUrl] = useState<string>('')
  const [isHttp, setIsHttp] = useState(false)

  useEffect(() => {
    setIsHttp(window.location.protocol === 'http:')
    setBookmarkletUrl(getMinifiedBookmarklet())
  }, [])

  const handleCopy = () => {
    if (!bookmarkletUrl) return
    navigator.clipboard.writeText(bookmarkletUrl)
      .then(() => toast.success('Bookmarklet code copied to clipboard!'))
      .catch(err => {
        toast.error('Failed to copy code.')
        console.error('Failed to copy bookmarklet URL: ', err)
      })
  }

  if (!bookmarkletUrl) return null

  return (
    <div className={cn(className)} >
      <>
        <div className="text-lg font-bold">Instant download bookmarklet</div>
        <div>Copy the bookmarklet into a bookmark, when you are viewing a video page, clicking the bookmark will open the page url in uvxytdlp and begin download</div>
        <div className="text-sm my-2">bookmarklet (copy this)</div>
        <div className='relative'>
          {!isHttp && (
            <Button
              className="cursor-copy absolute top-2 right-2"
              variant="ghost"
              size="icon"
              onClick={handleCopy} >
              <ClipboardCopyIcon />
            </Button>
          )}
          <pre className="overflow-scroll p-4 mt-3 border-1 border-foreground/30 rounded-lg text-cyan-600 bg-foreground/10">
            {getMinifiedBookmarklet()}
          </pre>
        </div>

        <div className="text-sm my-2">source</div>
        <pre className="overflow-scroll p-4 mt-3 border-1 border-foreground/30 rounded-lg text-cyan-600 bg-foreground/10">
          javascript:{getBookmarklet()}
        </pre>
        {isHttp && (
          <div className="text-sm my-3">Hosting on <code className="font-bold text-cyan-600">https://</code> gives uvxytdlp-ui use of clipboard</div>
        )}
      </>
    </div>
  )
}
