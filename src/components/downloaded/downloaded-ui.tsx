import { type FC, useState } from "react"
import { useDownloaded, type DownloadedFileType } from "@/contexts/downloaded-context"
import { VideoPlayer } from "@/components/downloaded/video-player"
import { AudioPlayer } from "@/components/downloaded/audio-player"
import { DowloadedFile } from "@/components/downloaded/downloaded-file"
import { Button } from "@/components/ui/button"
import { GripIcon, MenuIcon, XIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAudioPlayerContext } from "@/contexts/audio-player-context-provider"

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
  const { audioStop: audioStop } = useAudioPlayerContext()

  const handlePlay = (fileName: string) => {
    setSelectedFile('')
    audioStop()
    setTimeout(() => setSelectedFile(fileName), 100)
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

  const contentType = () => getFileType(selectedFile)

  return (
    <div className="bg-card sm:pb-2">
      <div className="grid grid-cols-1 gap-y-1">
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
            {contentType() === 'video' && <VideoPlayer fileName={selectedFile} />}
            {contentType() === 'audio' && <AudioPlayer fileName={selectedFile} />}
          </div>
        )}
        <div className="sm:p-2 border-t mt-2 flex flex-row items-center justify-between">
          <SearchDownloaded
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
        <div className="w-[vw-100]">
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

  const { viewType, setViewType } = useDownloaded()

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative w-full">
        <Input
          className="border-none rounded-none md:flex-1 sm:border-foreground/15 sm:rounded-full h-12"
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder='Downloads...'
          value={searchQuery}
        />
        <Button
          className="cursor-pointer hover:bg-card/10 transition-color duration-500
                     text-foreground/20 hover:text-foreground
                     absolute right-2 top-1/2 -translate-y-1/2 z-10"
          onClick={() => setSearchQuery('')}
          variant={'ghost'}
          size={'icon'}>
          <XIcon />
        </Button>
      </div>
      <div
        className="hover:bg-foreground/20 cursor-pointer p-2 rounded-full"
        onClick={() => setViewType(viewType == 'grid' ? 'list' : 'grid')}
      >
        {viewType == 'list'
          ? <MenuIcon />
          : <GripIcon />
        }
      </div>
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

  const { viewType } = useDownloaded()
  const listClasses = "flex flex-col justify-items"
  const gridClasses = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
  return (

    <div className={viewType == 'grid' ? gridClasses : listClasses} >
      {
        searchResults(searchQuery).map((file) => (
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
