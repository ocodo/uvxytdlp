import { type FC, useState } from "react"
import { useDownloaded, type DownloadedFileType } from "@/contexts/downloaded-context"
import { VideoPlayer } from "@/components/downloaded/video-player"
import { AudioPlayer } from "@/components/downloaded/audio-player"
import { DowloadedFile } from "@/components/downloaded/downloaded-file"
import { GripIcon, MenuIcon, XIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAudioPlayerContext } from "@/contexts/audio-player-context-provider"
import { controlIconClassName, inputResetIconClasses, thinIconStyle } from "@/lib/icon-style"
import { Icon } from "@/components/ocodo-ui/icon"

const getFileType = (fileName: string | undefined): 'video' | 'audio' | undefined => {
  if (!fileName) return undefined
  const extension = fileName.split('.').pop()?.toLowerCase()
  if (['mp3', 'm4a'].includes(extension ?? '')) {
    return 'audio'
  }
  if (['mp4', 'mkv'].includes(extension ?? '')) {
    return 'video'
  }
  return undefined
}

type MediaType = 'video' | 'audio' | undefined

export const DownloadedUI: FC = () => {
  const { deleteFile, searchResults, browserDownloadFile } = useDownloaded()
  const [selectedFile, setSelectedFile] = useState<string | undefined>(undefined)
  const [mediaType, setMediaType] = useState<MediaType>(undefined)
  const [isDeleting, setIsDeleting] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')
  const { audioStop } = useAudioPlayerContext()

  const handlePlay = (fileName: string) => {
    setMediaType(() => {
      setSelectedFile(() => {
        audioStop()
        return fileName
      })
      return getFileType(fileName)
    })
  }

  const handleDelete = async (fileName: string) => {
    setIsDeleting(fileName)
    try {
      await deleteFile(fileName)
      if (selectedFile === fileName) {
        setSelectedFile(undefined)
      }
    } catch (error) {
      console.error("Error during delete operation in UI:", error)
    } finally {
      setIsDeleting(undefined)
    }
  }

  const handleDownload = (fileName: string) => {
    browserDownloadFile(fileName)
  }

  return (
    <div className="bg-card sm:pb-2">
      <div className="grid grid-cols-1 gap-y-1">
        {selectedFile && (
          <div className="my-4 relative">
            <div className="absolute z-10 top-2 right-2">
              <Icon
                Icon={XIcon}
                className={controlIconClassName}
                onClick={() => {
                  setSelectedFile(() => {
                    audioStop()
                    return undefined
                  })
                }} />
            </div>
            {selectedFile && mediaType === 'video' && <VideoPlayer fileName={selectedFile} />}
            {selectedFile && mediaType === 'audio' && <AudioPlayer fileName={selectedFile} />}
          </div>
        )}
        <div className="flex flex-row items-center justify-between">
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
        <Icon
          className={inputResetIconClasses}
          onClick={() => setSearchQuery('')}
          Icon={XIcon} />
      </div>
      <div
        className="hover:bg-foreground/20 cursor-pointer p-2 rounded-full transition-all duration-500"
        onClick={() => setViewType(viewType == 'grid' ? 'list' : 'grid')}
      >
        {viewType == 'list'
          ? <MenuIcon style={thinIconStyle} />
          : <GripIcon style={thinIconStyle} />
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
  isDeleting: string | undefined
  selectedFile: string | undefined
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
