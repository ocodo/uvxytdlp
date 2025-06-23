/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react'

interface HashUrlContextType {
  url: string | null
  setUrl: (url: string | null) => void
}

const HashUrlContext = createContext<HashUrlContextType | undefined>(undefined)

export const HashUrlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const fullHash = window.location.hash
    if (fullHash) {
      try {
      const decodedUrl = decodeURIComponent(fullHash.substring(1))
      const url = new URL(decodedUrl)
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        setUrl(decodedUrl)
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      } else {
        setUrl(null)
      }
    } catch {
      setUrl(null)
    }
    }
  }, [])

  return (
    <HashUrlContext.Provider value={{ url, setUrl }}>
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
