import type React from 'react'
import { SettingsTabs } from '@/components/settings-tabs'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

interface SettingsDialogProps {
  children: React.ReactNode
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({children}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <div className="flex w-full max-w-sm flex-col gap-6">
          <SettingsTabs />
        </div>
      </DialogContent>
    </Dialog>
  )
}
