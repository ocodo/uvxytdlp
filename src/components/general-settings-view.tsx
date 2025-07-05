import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useVideoSettingsContext } from "@/contexts/video-settings-context"
import { useYtdlpContext } from "@/contexts/ytdlp-service-context"

export const GeneralSettingsView: React.FC = () => {
  const {
    showLog,
    setShowLog
  } = useYtdlpContext()

  const {
    setAutoPlay,
    autoPlay
  } = useVideoSettingsContext()

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4">
        <div>
          <Label>Auto Play
            <Switch
              onClick={() => setAutoPlay(!autoPlay)}
              checked={autoPlay} />
          </Label>
        </div>
        <div>
          <Label>Show Log (yt-dlp)
            <Switch
              onClick={() => setShowLog(!showLog)}
              checked={showLog} />
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}
