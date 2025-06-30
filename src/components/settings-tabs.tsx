import { BookmarkletSettingsView } from "@/components/bookmarklet-settings-view"
import { GeneralSettingsView } from "@/components/general-settings-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const SettingsTabs: React.FC = () => {
  return (
    <Tabs defaultValue="settings">
      <TabsList>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="bookmarklet">Bookmarklet</TabsTrigger>
      </TabsList>
      <TabsContent value="settings">
        <GeneralSettingsView />
      </TabsContent>
      <TabsContent value="bookmarklet">
        <BookmarkletSettingsView />
      </TabsContent>
    </Tabs>
  )
}
