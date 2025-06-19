import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { formatTemplates } from "@/lib/template-formats"; // Assuming this path is correct

interface UrlInputCardProps {
  url: string;
  setUrl: (url: string) => void;
  format: string;
  setFormat: (format: string) => void;
  urlValid: () => boolean;
  ytdlpFromURL: () => Promise<void>;
  isLoading: boolean;
}

export const UrlInputCard: React.FC<UrlInputCardProps> = ({
  url,
  setUrl,
  format,
  setFormat,
  urlValid,
  ytdlpFromURL,
  isLoading,
}) => {
  return (
    <>
      <Input
        type="url"
        placeholder="Enter YouTube URL..."
        aria-label="YouTube url"
        onChange={(event) => setUrl(event.target.value)}
        className="md:flex-1"
        value={url}
      />
      {urlValid() && (
        <div className="ml-0 mt-2 md:mt-0 md:ml-2 flex items-center">
          <Button variant='ghost' onClick={ytdlpFromURL} disabled={isLoading} aria-label="Download">
            {isLoading
              ? <Loader2Icon className="h-4 w-4 animate-spin" />
              : <DownloadIcon className="h-4 w-4" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="ml-2">
                (as {format})
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
    </>
  );
};
