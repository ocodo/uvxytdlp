import { type FC, useState } from "react"
import { useDownloaded } from "@/contexts/downloaded-context"
import { VideoPlayer } from "@/components/video-player"
import { DowloadedFile } from "@/components/downloaded-file"
import { Button } from "@/components/ui/button"
import { CircleXIcon } from "lucide-react"

export const DownloadedUI: FC = () => {
  const { downloadedFiles, deleteFile } = useDownloaded()
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handlePlay = (fileName: string) => {
    if (selectedFile != null) {
      setSelectedFile(null)
      setTimeout(() => setSelectedFile(fileName), 500)
      return
    }
    setSelectedFile(fileName)
  }

  const handleDelete = async (fileName: string) => {
    setIsDeleting(fileName)
    try {
      await deleteFile(fileName)
    } catch (error) {
      console.error("Error during delete operation in UI:", error)
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="bg-card pb-2">
      <div className="grid grid-cols-1 gap-1">
        {selectedFile && (
          <div className="my-4 relative">
            <div className="absolute z-10 top-1 right-1 opacity-0 hover:opacity-80">
              <Button variant={'ghost'} size={'icon'} onClick={() => setSelectedFile(null)}>
                <CircleXIcon />
              </Button>
            </div>
            <VideoPlayer fileName={selectedFile} />
          </div>
        )}
        <div className="text-lg px-2 font-semibold border-t mt-2">
          content
        </div>
        <div className="flex flex-col justify-items" >
          {downloadedFiles?.map((file) => (
            <DowloadedFile
              handleDelete={handleDelete}
              handlePlay={handlePlay}
              isDeleting={isDeleting}
              selectedFile={selectedFile}
              key={file.name}
              file={file} />
          ))}
        </div>
      </div>
    </div>
  )
}
