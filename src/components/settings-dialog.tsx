import type React from 'react'
import { SettingsTabs } from '@/components/settings-tabs'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Description } from '@radix-ui/react-dialog'

interface SettingsDialogProps {
  children: React.ReactNode
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({children}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='p-4' >
        <Description style={{display:'none'}}>Settings</Description>
        <DialogTitle style={{display:'none'}}>App Settings</DialogTitle>
        <div className=''>
          <SettingsTabs />
        </div>
      </DialogContent>
    </Dialog>
  )
}
