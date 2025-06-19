import { Button } from "@/components/ui/button"
import { PlayIcon, Trash2Icon } from "lucide-react"
import type React from "react"

interface DowloadedFileProps {
  file: {
    name: string;
    mtime: string;
    size: number;
  }
  handlePlay: (name: string) => void;
  handleDelete: (name: string) => void;
  selectedFile: string | null;
  isDeleting: string | null
}

export const DowloadedFile: React.FC<DowloadedFileProps> = (props) => {
  const { file, handlePlay, handleDelete, isDeleting } = props;

  return (
    <div key={file.name}
      className="flex flex-row items-stretch justify-between
                 even:bg-background/50 odd:bg-background/70
                 align-bottom rounded-md">
      <div className="pt-1 px-3">
        {file.name}
      </div>
      <div className="flex items-center gap-x-2.5">
        <Button onClick={() => handlePlay(file.name)} variant="outline" size="icon" aria-label={`Play ${file.name}`}>
          <PlayIcon className="h-2 w-2" />
        </Button>
        <Button
          onClick={() => handleDelete(file.name)}
          variant="destructive"
          size="icon"
          disabled={isDeleting === file.name} // Disable button while this specific file is being deleted
        >
          {isDeleting === file.name ? (
            <Trash2Icon className="animate-pulse" /> // Optional: visual feedback
          ) : (
            <Trash2Icon className="" />
          )}
        </Button>
      </div>
    </div>
  );
}
