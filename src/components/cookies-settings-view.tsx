import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAVSettingsContext } from "@/contexts/video-settings-context";
import type { FC, FocusEvent } from "react";

export const CookiesSettingsView: FC = () => {

  const {
    youtubeCookies,
    setYoutubeCookies,
  } = useAVSettingsContext()

  const updateOnChange = (event: FocusEvent) => {
    event.preventDefault()
    const textArea: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
    if (textArea.value != youtubeCookies && youtubeCookies != "") {
      setYoutubeCookies(textArea.value)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cookies Settings</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
