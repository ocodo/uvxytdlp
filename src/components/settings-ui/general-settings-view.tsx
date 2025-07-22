import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAudioPlayerContext } from "@/contexts/audio-player-context-provider";
import { useDownloaded, ViewTypes } from "@/contexts/downloaded-context";
import { useYtdlpContext } from "@/contexts/ytdlp-context";
import { AudioFormats, VideoFormats } from "@/lib/template-formats";
import type { FC } from "react";
import { useVideoPlayerContext } from "@/contexts/video-player-context-provider";
import { SelectState } from "@/components/ocodo-ui/select-state";
import { SwitchState } from "@/components/ocodo-ui/switch-state";

export const GeneralSettingsView: FC = () => {
  const {
    restrictedFilenames,
    setRestrictedFilenames,
    setVideoFormat,
    videoFormat,
    setAudioFormat,
    audioFormat,
  } = useYtdlpContext();

  const { viewType, setViewType } = useDownloaded();
  const { setVideoAutoPlay, videoAutoPlay } = useVideoPlayerContext();
  const { setAudioAutoPlay, audioAutoPlay } = useAudioPlayerContext();

  return (
    <Card className="max-w-[92%]  h-[50vh]">
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <SelectState
            layout="row"
            label={`Downloads View ${viewType}`}
            choices={ViewTypes}
            state={viewType}
            setState={setViewType}
          />
          <SwitchState
            label="Video AutoPlay"
            state={videoAutoPlay}
            setState={setVideoAutoPlay}
          />
          <SwitchState
            label="Audio AutoPlay"
            state={audioAutoPlay}
            setState={setAudioAutoPlay}
          />
          <SwitchState
            label="Basic filenames"
            state={restrictedFilenames}
            setState={setRestrictedFilenames}
          />
          <SelectState
            layout="row"
            label={`Video Format`}
            choices={VideoFormats}
            state={videoFormat}
            setState={setVideoFormat}
            />
          <SelectState
            layout="row"
            label={`Audio Format`}
            choices={AudioFormats}
            state={audioFormat}
            setState={setAudioFormat}
          />
        </div>
      </CardContent>
    </Card>
  );
};
