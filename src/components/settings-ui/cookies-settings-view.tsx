import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCookieSettingsContext } from "@/contexts/cookie-settings-context";
import type { FC, FocusEvent } from "react";

export const CookiesSettingsView: FC = () => {

  const {
    youtubeCookies,
    setYoutubeCookies,
  } = useCookieSettingsContext()

  const updateOnChange = (event: FocusEvent) => {
    event.preventDefault()
    const textArea: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
    if (textArea.value != youtubeCookies && youtubeCookies != "") {
      setYoutubeCookies(textArea.value)
    }
  }

  return (
    <Card className="max-w-[85%] h-[50vh]">
      <CardHeader>
        <CardTitle>Cookies Settings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 overflow-scroll">
        <Label>YouTube Cookies</Label>
        <Textarea
          spellCheck={false}
          rows={9}
          className="text-sm font-mono max-w-[75vw] bg-background"
          placeholder="Paste Youtube Browser Cookies. Used when YouTube won't allow anonymous access."
          defaultValue={youtubeCookies}
          onBlur={updateOnChange}
        />
      </CardContent>
    </Card>
  )
}
