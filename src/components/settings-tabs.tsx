import { AboutUvxYtdlp } from "@/components/about-uvxytdlp"
import { BookmarkletSettingsView } from "@/components/bookmarklet-settings-view"
import { CookiesSettingsView } from "@/components/cookies-settings-view"
import { GeneralSettingsView } from "@/components/general-settings-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const SettingsTabs: React.FC = () => {
  return (
    <Tabs defaultValue="settings">
      <TabsList>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="cookies">Cookies</TabsTrigger>
        <TabsTrigger value="bookmarklet">Bookmarklet</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
      </TabsList>
      <TabsContent value="settings">
        <GeneralSettingsView />
      </TabsContent>
      <TabsContent value="cookies">
        <CookiesSettingsView />
      </TabsContent>
      <TabsContent value="bookmarklet">
        <BookmarkletSettingsView />
      </TabsContent>
      <TabsContent value="about">
        <AboutUvxYtdlp />
      </TabsContent>
    </Tabs>
  )
}

