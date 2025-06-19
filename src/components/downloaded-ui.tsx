import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDownloaded } from "@/contexts/downloaded-context";
import { PlayIcon, Trash2Icon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { VideoPlayer } from "./video-player";

export const DownloadedUI: React.FC = () => {
  const { downloadedFiles } = useDownloaded();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handlePlay = (fileName: string) => {
    setSelectedFile(fileName);
  };

  const handleDelete = (fileName: string) => {
    // Implement your delete logic here
    console.log(`Delete ${fileName}`);
    // You'll likely need to call an API to delete the file
    // and then refresh the downloaded files list.
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Downloaded Content</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-items gap-2" >
        {downloadedFiles?.map((file) => (
          <Card key={file.name}>
            <CardContent className="flex flex-row items-stretch justify-between gap-2">
              {file.name}
              <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => handlePlay(file.name)} variant="outline" size="icon">
                    <PlayIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                  {selectedFile && <VideoPlayer fileName={selectedFile} />}
                </DialogContent>
              </Dialog>
              <Button onClick={() => handleDelete(file.name)} variant="destructive" size="icon">
                <Trash2Icon className="h-4 w-4" />
              </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
