import React, { useRef, type FC } from "react"
import { Input } from "@/components/ui/input"
import { useYoutubeSearchContext } from "@/contexts/youtube-search-context"
import { YoutubeSearchResultBox } from "@/components/downloader/youtube-search-result-box"
import { debounce } from "@/lib/debounce"
import { XIcon } from "lucide-react"
import { Icon } from "@/components/ocodo-ui/icon"
import { inputResetIconClasses } from "@/lib/icon-style"

export const YoutubeSearchUI: FC = () => {
  const { setQuery, results, setResults } = useYoutubeSearchContext()

  const debouncedSearch = debounce((target) => {
    const value: string = target.value
    console.log(`Value: ${value}`)
    setQuery(value)
  }, 200)

  const searchInput = useRef<HTMLInputElement | undefined>(undefined)

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <Input
            ref={searchInput as React.RefObject<HTMLInputElement>}
            type='text'
            placeholder="YouTube Search..."
            aria-label="YouTube search query"
            onChange={(event: React.ChangeEvent) => debouncedSearch(event.currentTarget)}
            className="border-none rounded-none md:flex-1 sm:border-foreground/15 sm:rounded-full h-12"
          />
          <Icon
            className={inputResetIconClasses}
            onClick={() => {
              setQuery('');
              if (searchInput.current && searchInput.current.value != '') {
                searchInput.current.value = '';
              }
              setResults([]);
            }}
            Icon={XIcon} />

        </div>
      </div>
      {results.length > 0 &&
        (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {
                results.map(
                  (result) =>
                    <YoutubeSearchResultBox
                      key={result.id}
                      {...result}
                    />
                )
              }
            </div>
          </>
        )
      }
    </>
  )
}
