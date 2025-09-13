import { SelectState } from "@/components/ocodo-ui/select-state";
import { SwitchState } from "@/components/ocodo-ui/switch-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAudioPlayerContext } from "@/contexts/audio-player-context-provider";
import { useDownloaded, ViewTypes } from "@/contexts/downloaded-context";
import { useVideoPlayerContext } from "@/contexts/video-player-context-provider";
import { WavesurferSettingsContext } from "@/contexts/wavesurfer-settings-context";
import { useYtdlpContext } from "@/contexts/ytdlp-context";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AudioFormats, VideoFormats } from "@/lib/template-formats";
import { useContext, type FC } from "react";

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

  const {
    setBarGap,
    setBarWidth,
    setBarRadius
  } = useContext(WavesurferSettingsContext)

  type WavesurferStyle = 'simple' | 'full'

  const wavesurferStyleMap = {
    simple: {
      barGap: 3,
      barWidth: 8,
      barRadius: 15,
      icon: '',
    },
    full: {
      barGap: 0,
      barWidth: 0,
      barRadius: 0,
      icon: '',
    },
  }

  const [ wavesurferStyle,  setWavesurferStyle ] = useLocalStorage<string>('wavesurfer-style', 'simple')

  const handleWavesurferSetting = (newValue: string) => {
    const value = newValue as WavesurferStyle
    setWavesurferStyle(value)
    setBarGap(wavesurferStyleMap[value].barGap)
    setBarWidth(wavesurferStyleMap[value].barWidth)
    setBarRadius(wavesurferStyleMap[value].barRadius)
  }

  return (
    <Card className="max-w-[92%]  h-[60vh]">
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
          <SelectState
            layout="row"
            label={`Audio player preview`}
            choices={{
              full: 'full',
              simple: 'simple',
            }}
            state={wavesurferStyle}
            setState={handleWavesurferSetting}
          />
        </div>
      </CardContent>
    </Card>
  );
};
