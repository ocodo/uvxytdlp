import { YtdlpSupportedSites } from "@/components/bookmarklet-settings-view";
import { RadixIconsGithubLogo } from "@/components/radix-icons-github-logo";
import { CopyleftIcon } from "lucide-react";
import { VERSION } from '@/lib/version';
import type { FC } from "react";

export const AboutUvxYtdlp: FC = () => (
  <>
    <div className="font-black tracking-tighter text-5xl">
      uvxytdlp
    </div>
    <div className="text-xs mb-5 text-foreground/50">
      {VERSION}
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
  </>
)
