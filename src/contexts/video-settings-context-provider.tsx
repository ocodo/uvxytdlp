import { useApiBase } from '@/contexts/api-base-context';
import { VideoSettingsContext } from '@/contexts/video-settings-context';
import { useLocalStorage } from '@/hooks/use-local-storage';
import React, { useEffect } from 'react';

export type VideoSettingsContextType = {
  autoPlay: boolean;
  setAutoPlay: (newValue: boolean) => void;
  youtubeCookies: string;
  setYoutubeCookies: (newValue: string) => void;
};

export const VideoSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [autoPlay, setAutoPlay] = useLocalStorage<boolean>('video_auto_play', true);
  const [youtubeCookies, setYoutubeCookies] = useLocalStorage<string>('youtube-cookies', "");

  const { apiFetch } = useApiBase()

  useEffect(()=>{
    apiFetch(`/ytcookies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cookies: youtubeCookies
      })
    })
  }, [apiFetch, youtubeCookies])

  return (
    <VideoSettingsContext.Provider value={{ autoPlay, setAutoPlay, youtubeCookies, setYoutubeCookies }}>
      {children}
    </VideoSettingsContext.Provider>
  );
};
