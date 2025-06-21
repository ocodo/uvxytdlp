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
  selectedFile: string | null
  isDeleting: string | null
}

export const DowloadedFile: React.FC<DowloadedFileProps> = (props) => {
  const { file, handlePlay, handleDelete, isDeleting } = props
  return (
    <div key={file.name}
      className="flex flex-row items-stretch justify-between
                 even:bg-background/10 odd:bg-background/70
                 align-bottom border-b">
      <div className="py-1 px-3">
        {file.name}
      </div>
      <div className="flex items-center gap-x-3">
        <PlayIcon
          className="h-4 w-4 cursor-pointer"
          onClick={() => handlePlay(file.name)} />
        <LongPressButton
          onLongPress={() => handleDelete(file.name)}
          longPressDuration={700}
          fillUpColorClass="dark:bg-red-800 bg-red-400"
          className="cursor-pointer"
          variant={'ghost'}
          >
          {isDeleting === file.name ? (
            <Trash2Icon className="animate-pulse" /> // Optional: visual feedback
          ) : (
            <Trash2Icon className="" />
          )}

        </LongPressButton>
      </div>
    </div>
  )
}
