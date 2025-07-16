import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAVSettingsContext } from "@/contexts/video-settings-context"
import { useYtdlpContext } from "@/contexts/ytdlp-context"
import type { FC } from "react"

export const GeneralSettingsView: FC = () => {
  const {
    restrictedFilenames,
    setRestrictedFilenames,
  } = useYtdlpContext()

  const {
    setVideoAutoPlay,
    videoAutoPlay,
    setAudioAutoPlay,
    audioAutoPlay,
  } = useAVSettingsContext()

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <SwitchState label='Video AutoPlay' state={videoAutoPlay} setState={setVideoAutoPlay} />
            <SwitchState label='Audio AutoPlay' state={audioAutoPlay} setState={setAudioAutoPlay} />
            <SwitchState label='Restrict filenames' state={restrictedFilenames} setState={setRestrictedFilenames} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface SwitchStateProps {
  label: string
  state: boolean
  setState: (newValue: boolean) => void
}

export const SwitchState: FC<SwitchStateProps> = ({ label, state, setState }) => (
  <>
    <div>
      <Label>{label}</Label>
    </div>
    <div>
      <Switch
        onClick={() => setState(!state)}
        checked={state} />
    </div>
  </>
)
