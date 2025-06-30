import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export const GeneralSettingsView: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <Switch />
        <Label>show log</Label>
      </CardContent>
    </Card>
  )
}
