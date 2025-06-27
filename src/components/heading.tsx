import { Menu } from 'lucide-react'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SettingsView } from '@/components/settings-view'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

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
              <Tabs defaultValue="settings">
                <TabsList>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="bookmarklet">Bookmarklet</TabsTrigger>
                </TabsList>
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account</CardTitle>
                      <CardDescription>
                        Make changes to your account here. Click save when you&apos;re
                        done.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="tabs-demo-name">Name</Label>
                        <Input id="tabs-demo-name" defaultValue="Pedro Duarte" />
                      </div>
                      <div className="grid gap- 3">
                        <Label htmlFor="tabs-demo-username">Username</Label>
                        <Input id="tabs-demo-username" defaultValue="@peduarte" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Save changes</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="bookmarklet">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bookmarklet</CardTitle>
                      <CardDescription>
                        Generate a bookmarklet for your uvxytdlp ui
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <SettingsView className='overflow-hidden max-[500px]:' />
                    </CardContent>
                    <CardFooter>
                      <Button>Save</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
        {title && (<div className="font-black tracking-tighter">{title}</div>)}
        <ThemeSwitch className="mr-2" />
      </header>
    </div>
  )
}
