import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useYtdlpContext } from "@/contexts/ytdlp-service-context"

export const GeneralSettingsView: React.FC = () => {
  const {
    showLog,
    setShowLog
  } = useYtdlpContext()

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <Label>show log
          <Switch onClick={() => setShowLog(prev => !prev)} checked={showLog} />
        </Label>
      </CardContent>
    </Card>
  )
}
