import type { VideoSettingsContextType } from "@/contexts/video-settings-context-provider";
import { createContext, useContext } from "react";

export const VideoSettingsContext = createContext<VideoSettingsContextType | undefined>(undefined);

export const useVideoSettingsContext = () => {
  const context = useContext(VideoSettingsContext);
  if (!context) {
    throw new Error('useVideoSettingsContext must be used within a VideoSettingsProvider');
  }
  return context;
};
