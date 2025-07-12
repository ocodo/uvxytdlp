import type { YoutubeSearchContextType } from "@/contexts/youtube-search-context-provider";
import { createContext, useContext } from "react";

export const YoutubeSearchContext = createContext<YoutubeSearchContextType | undefined>(undefined);

export const useYoutubeSearchContext = () => {
  const context = useContext(YoutubeSearchContext);

  if (!context) {
    throw new Error('useYoutubeSearchContext must be used within a YoutubeSearchContextProvider');
  }

  return context
}
