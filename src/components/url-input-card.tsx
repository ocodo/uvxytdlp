import React, { type Dispatch, type SetStateAction } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DownloadIcon, Loader2Icon } from "lucide-react"
import { formatTemplates } from "@/lib/template-formats"
import { isUrlValid } from '@/lib/is-url-valid'

interface UrlInputCardProps {
  url: string
  setUrl: Dispatch<SetStateAction<string>>
  format: string
  setFormat: Dispatch<SetStateAction<string>>
  startDownload:() => Promise<void>
  isLoading: boolean
}

export const UrlInputCard: React.FC<UrlInputCardProps> = ({
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
        className="md:flex-1 border-foreground/15 url-input"
        value={url}
      />
      {isUrlValid(url) && (
        <div className="ml-0 mt-2 md:mt-0 md:ml-2 flex items-center">
          <Button onClick={startDownload} disabled={isLoading} aria-label="Download">
            {isLoading
              ? <Loader2Icon className="h-4 w-4 animate-spin" />
              : <DownloadIcon className="h-4 w-4" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="ml-2 w-14">
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
        </div>
      )}
    </div>
  )
}
