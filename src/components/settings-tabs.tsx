import { AboutUvxYtdlp } from "@/components/about-uvxytdlp"
import { BookmarkletSettingsView } from "@/components/bookmarklet-settings-view"
import { CookiesSettingsView } from "@/components/cookies-settings-view"
import { GeneralSettingsView } from "@/components/general-settings-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UvxYtdlpIcon } from "@/components/uvxytdlp-icon"

export const SettingsTabs: React.FC = () => {
  return (
    <Tabs defaultValue="settings">
      <TabsList>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="cookies">Cookies</TabsTrigger>
        <TabsTrigger value="bookmarklet">Short cut</TabsTrigger>
        <TabsTrigger value="about">
          <UvxYtdlpIcon
          fadeDuration={2000}
          totalDuration={6000}
          size={17}
          strokeWidth={0} colors={[
            "#FFF7",
            "#FFF7",
            "#FFF7",
            ]}/>
        </TabsTrigger>
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

