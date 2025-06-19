import { Menu } from 'lucide-react'
import { ThemeSwitch } from '@/components/theme-switch'

interface HeadingProps {
  title?: string
  tinyChildren?: React.ReactNode
}

export function Heading(props: HeadingProps) {
  const { title, tinyChildren } = props

  return (
    <div className='relative'>
      {tinyChildren && (
        <div className="w-full bg-transparent absolute flex items-center justify-end text-foreground/30 top-1 right-20">
          {tinyChildren}
        </div>
      )}
      <header className="flex items-center justify-between p-2">
        <div className="p-2 hover:bg-accent cursor-pointer rounded-lg">
          <Menu className="h-4 w-4" />
        </div>
        {title && (<div className="font-black tracking-tighter">{title}</div>)}
        <ThemeSwitch className="mr-2" />
      </header>
    </div>
  )
}
