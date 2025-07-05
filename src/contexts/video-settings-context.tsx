import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

type VideoSettingsContextType = {
  autoPlay: boolean;
  setAutoPlay: (value: boolean) => void;
};

const VideoSettingsContext = createContext<VideoSettingsContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'video_auto_play';

export const VideoSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [autoPlay, setAutoPlayState] = useState<boolean>(true);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored !== null) {
      setAutoPlayState(stored === 'true');
    }
  }, []);

  const setAutoPlay = (value: boolean) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, value.toString());
    setAutoPlayState(value);
  };

  return (
    <VideoSettingsContext.Provider value={{ autoPlay, setAutoPlay }}>
      {children}
    </VideoSettingsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useVideoSettingsContext = () => {
  const context = useContext(VideoSettingsContext);
  if (!context) {
    throw new Error('useVideoSettingsContext must be used within a VideoSettingsProvider');
  }
  return context;
};
