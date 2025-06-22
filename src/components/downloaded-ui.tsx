import { type FC, useState } from "react"
import { useDownloaded, type DownloadedFileType } from "@/contexts/downloaded-context"
import { VideoPlayer } from "@/components/video-player"
import { AudioPlayer } from "@/components/audio-player"
import { DowloadedFile } from "@/components/downloaded-file"
import { Button } from "@/components/ui/button"
import { CircleXIcon, Search, SearchXIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

const getFileType = (fileName: string | null): 'video' | 'audio' | null => {
  if (!fileName) return null
  const extension = fileName.split('.').pop()?.toLowerCase()
  if (['mp3', 'm4a', 'aac'].includes(extension ?? '')) {
    return 'audio'
  }
  return 'video'
}

export const DownloadedUI: FC = () => {
  const { downloadedFiles, deleteFile, searchResults } = useDownloaded()
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handlePlay = (fileName: string) => {
    if (selectedFile === fileName) {
      // If the same file is clicked, toggle it off.
      setSelectedFile(null)
    } else {
      // If a different file is clicked
      // (or no file is selected),
      // play the new one.
      // A small delay if switching
      // to avoid UI jank.
      if (selectedFile !== null) {
        setSelectedFile(null)
        setTimeout(() => setSelectedFile(fileName), 150)
      } else {
        setSelectedFile(fileName)
      }
    }
  }

  const handleDelete = async (fileName: string) => {
    setIsDeleting(fileName)
    try {
      await deleteFile(fileName)
      if (selectedFile === fileName) {
        setSelectedFile(null)
      }
    } catch (error) {
      console.error("Error during delete operation in UI:", error)
    } finally {
      setIsDeleting(null)
    }
  }

  const selectedFileType = getFileType(selectedFile)

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
            {selectedFileType === 'video' && <VideoPlayer fileName={selectedFile} />}
            {selectedFileType === 'audio' && <AudioPlayer fileName={selectedFile} />}
          </div>
        )}
        <div className="p-2 border-t mt-2 flex flex-row items-center justify-between">
          <div>downloaded content</div>
          {!searching
            ? (
              <Button
                className="cursor-pointer"
                variant={'ghost'}
                size={'icon'}
                onClick={() => setSearching(!searching)}
              >
                <Search />
              </Button>
            )
            : (
              <SearchDownloaded
                setSearching={setSearching}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}
        </div>
        {!searching
          ? (
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
          )
          : (
            <DownloadedFilteredBySearch
              searchResults={searchResults}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleDelete={handleDelete}
              handlePlay={handlePlay}
              isDeleting={isDeleting}
              selectedFile={selectedFile}
            />
          )}
      </div>
    </div >
  )
}

interface SearchDownloadedProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  setSearching: (searching: boolean) => void
}

const SearchDownloaded: FC<SearchDownloadedProps> = ({ searchQuery, setSearchQuery, setSearching }) => {
  return (
    <div className="flex items-center gap-2 w-80">
      <Input
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <Button
        className="cursor-pointer"
        onClick={() => setSearching(false)}
        variant={'ghost'}
        size={'icon'}
      >
        <SearchXIcon />
      </Button>
    </div>
  )
}

interface DownloadedFilteredBySearchProps {
  searchResults: (query: string) => DownloadedFileType[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  handleDelete: (fileName: string) => Promise<void>
  handlePlay: (fileName: string) => void
  isDeleting: string | null
  selectedFile: string | null
}

const DownloadedFilteredBySearch: FC<DownloadedFilteredBySearchProps> = ({
  searchResults,
  handleDelete,
  handlePlay,
  isDeleting,
  selectedFile,
  searchQuery
}) => {
  return (
    <div className="flex flex-col justify-items" >
      {
        searchResults(searchQuery)?.map((file) => (
          <DowloadedFile
            handleDelete={handleDelete}
            handlePlay={handlePlay}
            isDeleting={isDeleting}
            selectedFile={selectedFile}
            key={file.name}
            file={file} />
        ))
      }
    </div>
  )
}
