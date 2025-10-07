import { useApiBase } from "@/contexts/api-base-context";
import { YoutubeSearchContext } from "@/contexts/youtube-search-context"
import { useEffect, useState } from "react"
import type { Dispatch, FC, ReactNode, SetStateAction } from "react"
import { toast } from "sonner";

interface YoutubeSearchResultType {
  id: string
  title: string
  thumbnails: string[]
  long_desc: string
  channel: string
  duration: string
  views: string
  publish_time: string
  url_suffix: string
}


export interface YoutubeSearchContextType {
  query: string | undefined;
  setQuery: Dispatch<SetStateAction<string | undefined>>;
  results: YoutubeSearchResultType[]
  setResults: Dispatch<SetStateAction<YoutubeSearchResultType[]>>;
};

export const YoutubeSearchProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [query, setQuery] = useState<string | undefined>(undefined)
  const [results, setResults] = useState<YoutubeSearchResultType[]>([])

  const { apiFetch } = useApiBase()

  useEffect(() => {
    const fetchYTSearchResults = async () => {
      if (apiFetch) {
        try {
          const response = await apiFetch(`/ytsearch/${query}`, {
            headers: {
              'Content-Type': 'application/json',
            }
          })
          if (!response.ok) {
            toast(`Error Searching YouTube ${response.status}`)
            return
          }
          const json = await response.json()
          const results: YoutubeSearchResultType[] = json || []
          setResults(results)
        } catch {
          toast(`Network Error Searching YouTube`)
        }
      }
    };
    if (query && query != "") {
      fetchYTSearchResults()
    }
  }, [apiFetch, query])
  return (
    <YoutubeSearchContext.Provider value={{ query, setQuery, results, setResults }}>
      {children}
    </YoutubeSearchContext.Provider>
  )
}
