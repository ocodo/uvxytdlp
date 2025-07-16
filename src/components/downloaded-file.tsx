import { LineMdDownloadIcon } from "@/components/line-md-download-icon"
import LongPressButton from "@/components/long-press-button"
import { PlayIcon, Trash2Icon } from "lucide-react"

import type React from "react"

interface DowloadedFileProps {
  file: {
    name: string
    mtime: string
    size: number
  }
  handlePlay: (name: string) => void
  handleDelete: (name: string) => void
  handleDownload: (name: string) => void
  selectedFile: string | null
  isDeleting: string | null
}

export const DowloadedFile: React.FC<DowloadedFileProps> = (props) => {
  const { file, handlePlay, handleDownload, handleDelete, isDeleting } = props
  return (
    <div key={file.name}
      className="flex flex-row items-end justify-between
                 even:bg-background/10 odd:bg-background/80
                 align-bottom border-b py-3 sm:py-1">
      <div className="px-3 py-2 truncate sm:whitespace-normal">
        {file.name}
      </div>
      <div className="flex items-center gap-x-3">
        <PlayIcon
          className="h-4 w-4 cursor-pointer"
          onClick={() => handlePlay(file.name)} />
        <LineMdDownloadIcon
          className="h-4 w-4 cursor-pointer"
          onClick={() => handleDownload(file.name)} />
        <LongPressButton
          onLongPress={() => handleDelete(file.name)}
          longPressDuration={700}
          fillUpColorClass="dark:bg-red-800 bg-red-400"
          className="cursor-pointer animate-color hover:border-red-500/40 hover:border-1"
          variant={'ghost'}
          size={'icon'}
          >
          {isDeleting === file.name ? (
            <Trash2Icon className="animate-pulse" /> // Optional: visual feedback
          ) : (
            <Trash2Icon />
          )}

        </LongPressButton>
      </div>
    </div>
  )
}
