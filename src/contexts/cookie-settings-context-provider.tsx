import { useApiBase } from '@/contexts/api-base-context';
import { CookieSettingsContext } from '@/contexts/cookie-settings-context';
import { useLocalStorage } from 'usehooks-ts';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export type CookeSettingsProviderValue = {
  youtubeCookies: string;
  setYoutubeCookies: (newValue: string) => void;
};

export const CookiesSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [youtubeCookies, setYoutubeCookies] = useLocalStorage<string>('youtube-cookies', "");

  const [
    serverStoredYoutubeCookies,
    setServerStoredYoutubeCookies,
  ] = useState<string | undefined>(undefined)

  const { apiFetch } = useApiBase()

  useEffect(() => {
    const getYTCookies = async () => {
      if (apiFetch) {
        const response = await apiFetch(`/ytcookies`, {
          headers: {
            "Content-Type": "application/json"
          }
        })
        if (response.ok) {
          const json = await response.json()
          const cookies = await json.cookies
          setServerStoredYoutubeCookies(cookies)
          if (cookies
            && cookies != ""
            && youtubeCookies != cookies) {
            setYoutubeCookies(cookies)
          }
        }
      }
    }

    const postYTCookies = async () => {
      if (
        youtubeCookies
        && youtubeCookies != ""
        && youtubeCookies != serverStoredYoutubeCookies
        && apiFetch
      ) {
        const response = await apiFetch(`/ytcookies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cookies: youtubeCookies })
        })
        if (!response.ok) {
          toast(`Error saving YouTube Cookies: ${response.status}`)
        } else {
          toast(`Saved YouTube Cookies`)
        }
      }
    }

    postYTCookies()
    getYTCookies()

  }, [
    apiFetch,
    serverStoredYoutubeCookies,
    setServerStoredYoutubeCookies,
    youtubeCookies,
    setYoutubeCookies
  ])

  const value = {
    youtubeCookies,
    setYoutubeCookies
  }

  return (
    <CookieSettingsContext.Provider value={value}>
      {children}
    </CookieSettingsContext.Provider>
  );
};
