import { Presto } from "@/components/presto";
import { Card, CardContent } from "@/components/ui/card";
import { UrlInputCard } from "@/components/url-input-card";
import { useYtdlp } from "@/contexts/ytdlp-service-context";

export function DownloaderUI() {
  const {
    url, setUrl, log, format, setFormat, urlValid, ytdlpFromURL, isLoading
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
          <CardContent>
            <Presto text={log} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
