import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { BookmarkletSettingsView } from '@/components/bookmarklet-settings-view'

export const BookmarkletSettingsCard: React.FC = () => {
  return (
    <Card>
      <CardContent className='max-[500px] overflow-hidden'>
        <BookmarkletSettingsView />
      </CardContent>
    </Card>
  )
}
