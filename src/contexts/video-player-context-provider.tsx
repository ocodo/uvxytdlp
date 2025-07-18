import { useLocalStorage } from "@/hooks/use-local-storage";
import { createContext, useContext, type FC, type ReactNode } from "react";

interface VideoPlayerContextValue {
  videoAutoPlay: boolean
  setVideoAutoPlay: (newValue: boolean) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextValue | undefined>(undefined);

interface VideoPlayerProviderProps {
  children: ReactNode;
}

export const VideoPlayerProvider:FC<VideoPlayerProviderProps> = ({children}) => {

  const [videoAutoPlay, setVideoAutoPlay] = useLocalStorage<boolean>('video_auto_play', true);

  const value = {
    videoAutoPlay,
    setVideoAutoPlay
  }

  return (
    <VideoPlayerContext.Provider value={value}>
      {children}
    </VideoPlayerContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useVideoPlayerContext = () => {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};