import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useVideoSettingsContext } from "@/contexts/video-settings-context"
import { useYtdlpContext } from "@/contexts/ytdlp-context"
import type { FC } from "react"

export const GeneralSettingsView: FC = () => {
  const {
    showLog,
    setShowLog
  } = useYtdlpContext()

  const {
    setAutoPlay,
    autoPlay,
  } = useVideoSettingsContext()


  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Video/Audio Autoplay</Label>
            </div>
            <div>

              <Switch
                onClick={() => setAutoPlay(!autoPlay)}
                checked={autoPlay} />
            </div>
            <div>
              <Label>Show Log (yt-dlp)</Label>
            </div>
            <div>
              <Switch
                onClick={() => setShowLog(!showLog)}
                checked={showLog} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
