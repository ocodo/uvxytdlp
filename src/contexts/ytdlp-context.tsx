import { type Dispatch, type SetStateAction, createContext, useContext } from "react"

export interface YtdlpContextType {
  // Core URL State
  inputUrl: string
  setInputUrl: Dispatch<SetStateAction<string>>
  hashUrl: string
  setHashUrl: Dispatch<SetStateAction<string>>

  // Download Actions & Status
  startDownload: () => Promise<void>
  isLoading: boolean

  // Logging
  log: string
  setLog: Dispatch<SetStateAction<string>>
  clearLog: () => void
  showLog: boolean
  setShowLog: (newValue: boolean) => void

  // Configuration
  cliArgs: string
  setCliArgs: Dispatch<SetStateAction<string>>
  format: string
  setFormat: Dispatch<SetStateAction<string>>

  // Progress
  progress: number
}

export const YtdlpContext = createContext<YtdlpContextType | undefined>(undefined)

export const useYtdlpContext = (): YtdlpContextType => {
  const context = useContext(YtdlpContext)
  if (!context) {
    throw new Error('useYtdlp must be used within a YtdlpProvider')
  }
  return context
}
