import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDownloaded } from "@/contexts/downloaded-context";
import { PlayIcon, Trash2Icon } from "lucide-react";
import React, { useState } from "react";
// Dialog components are no longer needed here
import { VideoPlayer } from "./video-player";

export const DownloadedUI: React.FC = () => {
  const { downloadedFiles, deleteFile } = useDownloaded(); // Added deleteFile and fetchDownloadedFiles
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // To track which file is being deleted

  const handlePlay = (fileName: string) => {
    // If the same file is clicked, toggle play/pause (or effectively deselect)
    setSelectedFile(current => current === fileName ? null : fileName);
  };

  const handleDelete = async (fileName: string) => {
    setIsDeleting(fileName);
    try {
      await deleteFile(fileName);
      // fetchDownloadedFiles() is called within deleteFile on success
    } catch (error) {
      console.error("Error during delete operation in UI:", error);
      // Optionally, show a toast notification for the error
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Downloaded Content</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-items gap-2" >
        {selectedFile && (
          <div className="mb-4">
            <VideoPlayer fileName={selectedFile} />
          </div>
        )}
        {downloadedFiles?.map((file) => (
          <Card key={file.name}>
            <CardContent className="flex flex-row items-stretch justify-between gap-2">
              {file.name}
              <div className="flex items-center gap-2">
                <Button onClick={() => handlePlay(file.name)} variant="outline" size="icon" aria-label={`Play ${file.name}`}>
                  <PlayIcon className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(file.name)}
                  variant="destructive"
                  size="icon"
                  disabled={isDeleting === file.name} // Disable button while this specific file is being deleted
                >
                  {isDeleting === file.name ? (
                    <Trash2Icon className="h-4 w-4 animate-pulse" /> // Optional: visual feedback
                  ) : (
                    <Trash2Icon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
