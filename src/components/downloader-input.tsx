import React, { type Dispatch, type SetStateAction } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatTemplates } from "@/lib/template-formats"
import { isUrlValid } from '@/lib/is-url-valid'
import { OcodoLoaderIcon } from '@/components/ocodo-loader-icon'
import { LineMdDownloadIcon } from '@/components/line-md-download-icon'

interface DownloaderInputProps {
  url: string
  setUrl: Dispatch<SetStateAction<string>>
  format: string
  setFormat: Dispatch<SetStateAction<string>>
  startDownload: () => Promise<void>
  isLoading: boolean
}

export const DownloaderInput: React.FC<DownloaderInputProps> = ({
  url,
  setUrl,
  format,
  setFormat,
  startDownload,
  isLoading,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="url"
        placeholder="Video Page URL to download..."
        aria-label="Video Page url"
        onChange={(event) => setUrl(event.target.value)}
        className="md:flex-1 border-foreground/15 url-input rounded-full h-12"
        disabled={isLoading}
        autoFocus
        value={url}
      />
      {isUrlValid(url) && (
        <div className="ml-0 mt-2 md:mt-0 md:ml-2 flex flex-row items-center gap-x-2 text-primary-foreground">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-20 h-12 rounded-full">
                {format}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.keys(formatTemplates).map((key) => (
                <DropdownMenuItem key={key} onClick={() => setFormat(key)}>
                  as {key}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => !isLoading && startDownload()}
            aria-label="Download"
            className={`w-20 h-12 rounded-full transition-colors duration-1000 ${isLoading ? "bg-primary/20" : ""}`}>
            {isLoading
              ? <OcodoLoaderIcon className="h-6 w-6 animate-spin" />
              : <LineMdDownloadIcon className="h-6 w-6" />}
          </Button>
        </div>
      )}
    </div>
  )
}
