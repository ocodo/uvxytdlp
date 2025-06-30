import { BookmarkletSettingsCard } from "@/components/bookmarklet-settings-card"
import { GeneralSettingsCard } from "@/components/general-settings-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const SettingsView: React.FC = () => {
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
