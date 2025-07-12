import { useApiBase } from '@/contexts/api-base-context';
import { VideoSettingsContext } from '@/contexts/video-settings-context';
import { useLocalStorage } from '@/hooks/use-local-storage';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export type VideoSettingsContextType = {
  autoPlay: boolean;
  setAutoPlay: (newValue: boolean) => void;
  youtubeCookies: string;
  setYoutubeCookies: (newValue: string) => void;
};

export const VideoSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [autoPlay, setAutoPlay] = useLocalStorage<boolean>('video_auto_play', true);
  const [youtubeCookies, setYoutubeCookies] = useLocalStorage<string>('youtube-cookies', "");

  const [
    serverStoredYoutubeCookies,
    setServerStoredYoutubeCookies,
  ] = useState<string | undefined>(undefined)

  const { apiFetch } = useApiBase()

  useEffect(() => {
    const getYTCookies = async () => {
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

    const postYTCookies = async () => {
      if (
        youtubeCookies
        && youtubeCookies != ""
        && youtubeCookies != serverStoredYoutubeCookies
      ) {
        const response = await apiFetch(`/ytcookies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cookies: youtubeCookies})
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

  return (
    <VideoSettingsContext.Provider value={{ autoPlay, setAutoPlay, youtubeCookies, setYoutubeCookies }}>
      {children}
    </VideoSettingsContext.Provider>
  );
};
