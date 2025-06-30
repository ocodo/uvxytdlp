import { Menu } from 'lucide-react'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { BookmarkletSettingsView } from '@/components/settings-view'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

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
        <Dialog>
          <DialogTrigger asChild>
            <div className="p-2 hover:bg-accent cursor-pointer rounded-lg">
              <Menu className="h-4 w-4" />
            </div>
          </DialogTrigger>
          <DialogContent>
            <div className="flex w-full max-w-sm flex-col gap-6">
              <SettingsView />
            </div>
          </DialogContent>
        </Dialog>
        {title && (<div className="font-black tracking-tighter">{title}</div>)}
        <ThemeSwitch className="mr-2" />
      </header>
    </div>
  )
}


export function SettingsView() {
  return (
    <Tabs defaultValue="settings">
      <TabsList>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="bookmarklet">Bookmarklet</TabsTrigger>
      </TabsList>
      <TabsContent value="settings">
        <GeneralSettingsCard />
      </TabsContent>
      <TabsContent value="bookmarklet">
        <BookmarkletSettingsCard />
      </TabsContent>
    </Tabs>
  )
}

function BookmarkletSettingsCard() {
  return (
    <Card>
      <CardContent className='max-[500px] overflow-hidden'>
        <BookmarkletSettingsView />
      </CardContent>
    </Card>
  )
}

function GeneralSettingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <Switch />
        <Label>show log</Label>
      </CardContent>
    </Card>
  )
}
