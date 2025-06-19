import { Presto } from "@/components/presto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UrlInputCard } from "@/components/url-input-card";
import { useYtdlp } from "@/contexts/ytdlp-service-context";
import { Button } from "./ui/button";
import { XIcon } from "lucide-react";

export function DownloaderUI() {
  const {
    url, setUrl, log, format, setFormat, urlValid, ytdlpFromURL, isLoading, clearLog
  } = useYtdlp();

  return (
    <div className="gap-2 grid grid-cols-1">
      <UrlInputCard
        url={url}
        setUrl={setUrl}
        format={format}
        setFormat={setFormat}
        urlValid={urlValid}
        ytdlpFromURL={ytdlpFromURL}
        isLoading={isLoading}
      />
      {log && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-2 px-4 border-b">
            <CardTitle className="text-md">Download Log</CardTitle>
            <Button variant="ghost" size="icon" onClick={clearLog} aria-label="Clear log">
              <XIcon className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Presto text={log} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
