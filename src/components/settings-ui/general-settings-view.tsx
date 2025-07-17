import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useDownloaded } from "@/contexts/downloaded-context";
import { useAVSettingsContext } from "@/contexts/video-settings-context";
import { useYtdlpContext } from "@/contexts/ytdlp-context";
import { AudioFormats, VideoFormats } from "@/lib/template-formats";

import type { FC } from "react";

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

  let gridView = viewType == 'grid'
  const setGridView = (newValue: boolean) => {
    if (newValue) {
      setViewType('grid')
      gridView = true
    } else {
      setViewType('list')
      gridView = false
    }
  }

  const { setVideoAutoPlay, videoAutoPlay, setAudioAutoPlay, audioAutoPlay } =
    useAVSettingsContext();

  return (
    <Card className="max-w-[92%]">
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">

        <div className="grid grid-cols-2 gap-4">
          <SwitchState
            label={`Downloads View ${viewType}`}
            state={gridView}
            setState={setGridView}
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
            label={`Video Format`}
            choices={VideoFormats}
            state={videoFormat}
            setState={setVideoFormat}
          />
          <SelectState
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

interface SwitchStateProps {
  label: string;
  state: boolean;
  setState: (newValue: boolean) => void;
}

interface SelectStateProps {
  label: string;
  state: string;
  choices: Record<string, string>;
  setState: (newValue: string) => void;
}

const SelectState: FC<SelectStateProps> = ({ ...props }) => {
  return (
    <>
      <div className="flex flex-col items-start justify-between gap-2">
        <div className="text-sm font-light">{props.label}</div>
        <div className="flex flex-row items-center justify-between gap-2">
          <RadioGroup className="text-sm font-light">
            <div className="flex flex-row items-end justify-between gap-2">
              {Object.keys(props.choices).map((choice: string) => (
                <>
                  <div>{choice}</div>
                  <div>
                    <RadioGroupItem
                      checked={props.state === choice}
                      value={choice}
                      id={choice}
                      onClick={() => props.setState(choice)}
                    />
                  </div>
                </>
              ))}
            </div>
          </RadioGroup>
        </div>
      </div>
    </>
  );
};

export const SwitchState: FC<SwitchStateProps> = ({
  label,
  state,
  setState,
}) => (
  <>
    <div>
      <Label>{label}</Label>
    </div>
    <div>
      <Switch onClick={() => setState(!state)} checked={state} />
    </div>
  </>
);
