import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useVideoSettingsContext } from "@/contexts/video-settings-context"
import { useYtdlpContext } from "@/contexts/ytdlp-context"
import type { FC, FocusEvent } from "react"

export const GeneralSettingsView: FC = () => {
  const {
    showLog,
    setShowLog
  } = useYtdlpContext()

  const {
    setAutoPlay,
    autoPlay,
    youtubeCookies,
    setYoutubeCookies,
  } = useVideoSettingsContext()

  const updateOnChange = (event: FocusEvent) => {
    event.preventDefault()
    const textArea: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
    if (textArea.value != youtubeCookies) {
      setYoutubeCookies(textArea.value)
    }
  }

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
          <hr />
          <div className="flex flex-col gap-4">
            <Label>YouTube Cookies</Label>
            <Textarea
              rows={5}
              className="text-sm font-mono"
              placeholder="Paste Youtube Browser Cookies. Used when YouTube won't allow anonymous access."
              defaultValue={youtubeCookies}
              onBlur={updateOnChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
