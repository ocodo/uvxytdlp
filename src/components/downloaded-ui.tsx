import { type FC, useState } from "react"
import { useDownloaded, type DownloadedFileType } from "@/contexts/downloaded-context"
import { VideoPlayer } from "@/components/video-player"
import { AudioPlayer } from "@/components/audio-player"
import { DowloadedFile } from "@/components/downloaded-file"
import { Button } from "@/components/ui/button"
import { Search, XIcon } from "lucide-react"
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
  const { deleteFile, searchResults, browserDownloadFile } = useDownloaded()
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handlePlay = (fileName: string) => {
    if (selectedFile !== fileName) {
      setSelectedFile(fileName)
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

  const handleDownload = (fileName: string) => {
    browserDownloadFile(fileName)
  }

  const selectedFileType = getFileType(selectedFile)

  return (
    <div className="bg-card pb-2">
      <div className="grid grid-cols-1 gap-1">
        {selectedFile && (
          <div className="my-4 relative">
            <div className="absolute z-10 top-1 right-1 opacity-50 hover:opacity-80">
              <Button
                variant={'ghost'}
                size={'icon'}
                onClick={() => setSelectedFile(null)}>
                <XIcon />
              </Button>
            </div>
            {selectedFileType === 'video' && <VideoPlayer fileName={selectedFile} />}
            {selectedFileType === 'audio' && <AudioPlayer fileName={selectedFile} />}
          </div>
        )}
        <div className="p-2 border-t mt-2 flex flex-row items-center justify-between">
          <SearchDownloaded
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
        <DownloadedFilteredBySearch
          searchResults={searchResults}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleDelete={handleDelete}
          handleDownload={handleDownload}
          handlePlay={handlePlay}
          isDeleting={isDeleting}
          selectedFile={selectedFile}
        />
      </div>
    </div >
  )
}

interface SearchDownloadedProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  setSearching?: (searching: boolean) => void
}

const SearchDownloaded: FC<SearchDownloadedProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative w-full">
        <Input
          className="w-full"
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder='Search downloaded content...'
          value={searchQuery}
        />
        <Button
          className="cursor-pointer hover:bg-card/10 transition-color duration-500
                     text-foreground/20 hover:text-foreground
                     absolute right-1 top-1/2 -translate-y-1/2"
          onClick={() => setSearchQuery('')}
          variant={'ghost'}
          size={'icon'}>
          <XIcon />
        </Button>
      </div>
      <Search />
    </div>
  )
}

interface DownloadedFilteredBySearchProps {
  searchResults: (query: string) => DownloadedFileType[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  handleDelete: (fileName: string) => void
  handleDownload: (fileName: string) => void
  handlePlay: (fileName: string) => void
  isDeleting: string | null
  selectedFile: string | null
}

const DownloadedFilteredBySearch: FC<DownloadedFilteredBySearchProps> = ({
  searchResults,
  handleDelete,
  handleDownload,
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
            handleDownload={handleDownload}
            isDeleting={isDeleting}
            selectedFile={selectedFile}
            key={file.name}
            file={file} />
        ))
      }
    </div>
  )
}
