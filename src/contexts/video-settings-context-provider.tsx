import { useApiBase } from '@/contexts/api-base-context';
import { AVSettingsContext } from '@/contexts/video-settings-context';
import { useLocalStorage } from '@/hooks/use-local-storage';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export type AVSettingsContextType = {
  videoAutoPlay: boolean;
  setVideoAutoPlay: (newValue: boolean) => void;
  youtubeCookies: string;
  setYoutubeCookies: (newValue: string) => void;
};

export const AVSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [videoAutoPlay, setVideoAutoPlay] = useLocalStorage<boolean>('video_auto_play', true);
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
    videoAutoPlay,
    setVideoAutoPlay,
    youtubeCookies,
    setYoutubeCookies
  }

  return (
    <AVSettingsContext.Provider value={value}>
      {children}
    </AVSettingsContext.Provider>
  );
};
