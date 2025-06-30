import type React from 'react'
import { SettingsView } from '@/components/settings-view'


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
          <SettingsView />
        </div>
      </DialogContent>
    </Dialog>
  )
}