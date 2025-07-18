import React, { useRef, type FC } from "react"
import { Input } from "@/components/ui/input"
import { useYoutubeSearchContext } from "@/contexts/youtube-search-context"
import { YoutubeSearchResultBox } from "@/components/downloader/youtube-search-result-box"
import { debounce } from "@/lib/debounce"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

export const YoutubeSearchUI: FC = () => {
  const { setQuery, results, setResults } = useYoutubeSearchContext()

  const debouncedSearch = debounce((target) => {
    const value: string = target.value
    console.log(`Value: ${value}`)
    setQuery(value)
  }, 200)

  const searchInput = useRef<HTMLInputElement>(null)

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <Input
            ref={searchInput}
            type='text'
            placeholder="YouTube..."
            aria-label="YouTube search query"
            onChange={(event: React.ChangeEvent) => debouncedSearch(event.currentTarget)}
            className="border-none rounded-none md:flex-1 sm:border-foreground/15 sm:rounded-full h-12"
          />
          <Button
            className="cursor-pointer hover:bg-card/10 transition-color duration-500
                     text-foreground/20 hover:text-foreground
                     absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            variant={'ghost'}
            size={'icon'}>
            <XIcon />
          </Button>
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
                      searchInput={searchInput}
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
