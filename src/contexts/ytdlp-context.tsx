import type { YtdlpContextType } from "@/contexts/ytdlp-context-provider"
import { createContext, useContext } from "react"

export const YtdlpContext = createContext<YtdlpContextType | undefined>(undefined)

export const useYtdlpContext = (): YtdlpContextType => {
  const context = useContext(YtdlpContext)
  if (!context) {
    throw new Error('useYtdlp must be used within a YtdlpProvider')
  }
  return context
}
