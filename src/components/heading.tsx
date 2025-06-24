import { Menu } from 'lucide-react'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { BookmarkletView } from '@/components/bookmarklet-view'
import { getBookmarklet, getMinifiedBookmarklet } from '@/lib/get-bookmarklet'

interface HeadingProps {
  title?: string
  tinyChildren?: React.ReactNode
}
export function Heading(props: HeadingProps) {
  const { title, tinyChildren } = props

  const isHttps = window.location.protocol === 'https:'

  return (
    <div className='relative'>
      {tinyChildren && (
        <div className="w-full bg-transparent absolute flex items-center justify-end text-foreground/30 top-1 right-20">
          {tinyChildren}
        </div>
      )}
      <header className="flex items-center justify-between p-2">
        <Dialog>
          <DialogTrigger asChild>
            <div className="p-2 hover:bg-accent cursor-pointer rounded-lg">
              <Menu className="h-4 w-4" />
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            {isHttps
            ? <BookmarkletView />
            :
             <div className="overflow-hidden">
               <div className="text-lg font-bold">Instant download bookmarklet</div>
               <div>Copy the bookmarklet into a bookmark, when you are viewing a video page, clicking the bookmark will open the page url in uvxytdlp and begin download</div>
               <div className="text-sm my-2">minified (copy this version)</div>
               <pre className="overflow-scroll p-4 mt-3 border-1 border-foreground/30 rounded-lg text-cyan-600 bg-foreground/10">
                 {getMinifiedBookmarklet()}
               </pre>
               <div className="text-sm my-2">unminified source</div>
               <pre className="overflow-scroll p-4 mt-3 border-1 border-foreground/30 rounded-lg text-cyan-600 bg-foreground/10">
                 {getBookmarklet()}
               </pre>
               <div className="text-sm mt-2">Hosting on <code className="font-bold text-cyan-600">https://</code> gives uvxytdlp-ui use of clipboard</div>
             </div>
            }
          </DialogContent>
        </Dialog>
        {title && (<div className="font-black tracking-tighter">{title}</div>)}
        <ThemeSwitch className="mr-2" />
      </header>
    </div>
  )
}
