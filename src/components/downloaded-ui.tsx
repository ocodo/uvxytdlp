// DownloaedUI

import { Card, CardContent } from "@/components/ui/card";
import { useDownloaded } from "@/contexts/downloaded-context";
import type React from "react";

export const DownloadedUI: React.FC = () => {

  const {downloadedFiles} = useDownloaded()

  return (
    <>
      {downloadedFiles?.map((file, index) => (
        <Card key={index}>
          <CardContent>
            <p>{file}</p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
