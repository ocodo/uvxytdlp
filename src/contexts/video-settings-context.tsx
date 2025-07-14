import type { AVSettingsContextType } from "@/contexts/video-settings-context-provider";
import { createContext, useContext } from "react";

export const AVSettingsContext = createContext<AVSettingsContextType | undefined>(undefined);

export const useAVSettingsContext = () => {
  const context = useContext(AVSettingsContext);
  if (!context) {
    throw new Error('useVideoSettingsContext must be used within a VideoSettingsProvider');
  }
  return context;
};
