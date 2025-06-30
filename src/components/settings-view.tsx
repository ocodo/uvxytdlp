import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getBookmarklet, getMinifiedBookmarklet } from '@/lib/get-bookmarklet'
import { cn } from '@/lib/utils'
import { ClipboardCopyIcon } from 'lucide-react'

interface BookmarkletSettingsViewProps {
  className?: string
}

export const BookmarkletSettingsView: React.FC<BookmarkletSettingsViewProps> = ({ className }) => {
  const [bookmarkletUrl, setBookmarkletUrl] = useState<string>('')
  const [isHttp, setIsHttp] = useState(false)
  const [showSource, setShowSource] = useState(false)

  const sourceTextColor = "text-cyan-300"

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
    <div className={cn("flex flex-wrap gap-2", className)} >
      <div className="text-lg font-bold">Instant download bookmarklet</div>
      <div>Copy the bookmarklet into a bookmark, when you are viewing a video page, clicking the bookmark will open the page url in uvxytdlp and begin download</div>
      <div className="text-sm">bookmarklet (copy this)</div>
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
        <pre className={`max-w-3/5 overflow-scroll p-2 border-1 border-foreground/30 rounded-lg ${sourceTextColor} bg-foreground/10`}>
          {getMinifiedBookmarklet()}
        </pre>
      </div>
      {showSource
        ? (<Button onClick={() => setShowSource(false)} >Hide Source</Button>)
        : (<Button onClick={() => setShowSource(true)} >View Source</Button>)
      }
      {showSource &&
        <pre className={`overflow-scroll p-2 border-1 border-foreground/30 rounded-lg ${sourceTextColor} bg-foreground/10`}>
          javascript:{getBookmarklet()}
        </pre>
      }
      {isHttp && (
        <div className="text-sm">Hosting on <code className={`font-bold ${sourceTextColor}`}>https://</code> permits clipboard </div>
      )}
    </div>
  )
}
