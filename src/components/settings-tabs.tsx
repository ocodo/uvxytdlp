import { AboutUvxYtdlp } from "@/components/about-uvxytdlp"
import { BookmarkletSettingsView } from "@/components/bookmarklet-settings-view"
import { GeneralSettingsView } from "@/components/general-settings-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const SettingsTabs: React.FC = () => {
  return (
    <Tabs defaultValue="about">
      <TabsList>
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="bookmarklet">Bookmarklet</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="about">
        <AboutUvxYtdlp />
      </TabsContent>
      <TabsContent value="bookmarklet">
        <BookmarkletSettingsView />
      </TabsContent>
      <TabsContent value="settings">
        <GeneralSettingsView />
      </TabsContent>
    </Tabs>
  )
}

