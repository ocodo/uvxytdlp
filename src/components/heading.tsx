import { Menu } from 'lucide-react'
import { ThemeSwitch } from '@/components/theme-switch'
import { SettingsDialog } from '@/components/settings-dialog'

import type React from 'react'

interface HeadingProps {
  title?: string
  tinyChildren?: React.ReactNode
}

export const Heading: React.FC<HeadingProps> = ({title, tinyChildren}) =>  {
  return (
    <div className='relative'>
      {tinyChildren && (
        <div className="w-full bg-transparent absolute flex items-center justify-end text-foreground/30 top-1 right-20">
          {tinyChildren}
        </div>
      )}
      <header className="flex items-center justify-between p-2">
        <SettingsDialog>
          <div className="p-2 hover:bg-accent cursor-pointer rounded-lg">
            <Menu className="h-4 w-4" />
          </div>
        </SettingsDialog>
        {title && (<div className="font-black tracking-tighter">{title}</div>)}
        <ThemeSwitch className="mr-2" />
      </header>
    </div>
  )
}
