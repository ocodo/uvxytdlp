import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type FC, useState } from "react";
import { useDownloaded } from "@/contexts/downloaded-context";
import { VideoPlayer } from "@/components/video-player";
import { DowloadedFile } from "@/components/downloaded-file";

export const DownloadedUI: FC = () => {
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
          <DowloadedFile
            handleDelete={handleDelete}
            handlePlay={handlePlay}
            isDeleting={isDeleting}
            selectedFile={selectedFile}
            key={file.name}
            file={file} />
        ))}
      </CardContent>
    </Card>
  )
}
