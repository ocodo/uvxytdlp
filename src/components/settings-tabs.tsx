import { BookmarkletSettingsView, YtdlpSupportedSites } from "@/components/bookmarklet-settings-view"
import { GeneralSettingsView } from "@/components/general-settings-view"
import { RadixIconsGithubLogo } from "@/components/radix-icons-github-logo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyleftIcon } from "lucide-react"

export const SettingsTabs: React.FC = () => {
  return (
    <Tabs defaultValue="about">
      <TabsList>
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="bookmarklet">Bookmarklet</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="about">
        <div className="font-black tracking-tighter text-5xl mb-4">
          uvxytdlp
        </div>
        <div>
          Download videos from <YtdlpSupportedSites title="any yt-dlp compatible site" />
        </div>
        <div>
          Powerered by the amazing <a href="https://github.com/yt-dlp/yt-dlp" target="_blank"><strong>yt-dlp</strong></a> and Astral's incredible <a href="https://docs.astral.sh/uv/" target="_blank"><strong>uv</strong></a>
        </div>
        <div className="text-xs mt-5">
          Built with:
        </div>
        <div className="text-xs">
          TypeScript, React, Tailwind/CSS, ShadCN, Python, FastAPI, Docker
        </div>

        <div>
          <a href="https://github.com/ocodo/uvxytdlp">
            <span
              className="gap-2 mt-6 flex flex-row w-full text-xs align-bottom"
            >
              <RadixIconsGithubLogo className="w-6 h-6" />
              <CopyleftIcon />
              copyleft 2025 ocodo
            </span>
          </a>
        </div>

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
