import { YtdlpSupportedSites } from "@/components/settings-ui/bookmarklet-settings-view";
import { RadixIconsGithubLogo } from "@/components/ocodo-ui/radix-icons-github-logo";
import { CopyleftIcon } from "lucide-react";
import { VERSION } from '@/lib/version';
import type { FC } from "react";
import { UvxYtdlpIcon } from "@/components/branding/uvxytdlp-icon";

export const AboutUvxYtdlp: FC = () => (
  <div className="p-4 h-[50vh]">
    <div className="font-black tracking-tighter text-5xl">
      <UvxYtdlpIcon

        size={35}
        strokeWidth={1}
        fadeDuration={2000}
        totalDuration={6000} />
      uvxytdlp
    </div>
    <div>
      Download and manage video or audio from <YtdlpSupportedSites title="any yt-dlp compatible site. " />
      Powerered by <a href="https://github.com/yt-dlp/yt-dlp" target="_blank"><strong>yt-dlp</strong></a> and Astral's <a href="https://docs.astral.sh/uv/" target="_blank"><strong>uv</strong></a>
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
          copyleft 2025 ocodo / Jason Milkins
        </span>
      </a>
      <div className="text-xs mt-2 text-foreground/60">
        contact: jasonm23 at gmail dot com
      </div>
      <div className="text-xs mb-5 text-foreground/40">
        ver : {VERSION}
      </div>
    </div>
  </div>
)
