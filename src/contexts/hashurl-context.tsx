/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type SetStateAction,
  type Dispatch
} from 'react'

interface HashUrlContextType {
  hashUrl: string
  setHashUrl: Dispatch<SetStateAction<string>>
}

const HashUrlContext = createContext<HashUrlContextType | undefined>(undefined)

export const HashUrlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hashUrl, setHashUrl] = useState<string>("")

  useEffect(() => {
    const fullHash = window.location.hash
    if (fullHash) {
      try {
        const decodedUrl = decodeURIComponent(fullHash.substring(1))
        console.log(`location.hash: ${decodedUrl}`)
        const url = new URL(decodedUrl)
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          setHashUrl(decodedUrl)
          window.history.replaceState(undefined, '', window.location.pathname + window.location.search)
        } else {
          setHashUrl("")
        }
      } catch {
        setHashUrl("")
      }
    }
  }, [])

  return (
    <HashUrlContext.Provider value={{ hashUrl, setHashUrl }}>
      {children}
    </HashUrlContext.Provider>
  )
}

export const useHashUrl = () => {
  const context = useContext(HashUrlContext)
  if (context === undefined) {
    throw new Error('url must be used within a HashUrlProvider')
  }
  return context
}
