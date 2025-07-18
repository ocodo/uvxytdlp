import { useLocalStorage } from '@/hooks/use-local-storage';
import { parseTime } from '@/lib/parse-time';
import { createContext, useContext, useRef, useState, useEffect } from 'react';
import type { ReactNode, FC, Dispatch, SetStateAction } from 'react';

interface AudioPlayerContextValue {
  audioElement: HTMLAudioElement | null;
  audioStop: () => void;
  audioPlay: () => void;
  audioPause: () => void;
  toggleAudioPlayPause: () => void;
  currentTime: number;
  setCurrentTime: Dispatch<SetStateAction<number>>;
  progress: number;
  setProgress: Dispatch<SetStateAction<number>>;
  src: string | undefined;
  setSrc: Dispatch<SetStateAction<string | undefined>>;
  duration: number;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  isPlaying: boolean;
  audioFastForward: (amount: string) => void;
  audioRewind: (amount: string) => void;
  audioAutoPlay: boolean;
  setAudioAutoPlay: (newValue: boolean) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

interface AudioPlayerProviderProps {
  children: ReactNode;
}

const AudioPlayerProvider: FC<AudioPlayerProviderProps> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [src, setSrc] = useState<string | undefined>(undefined);
  const [audioAutoPlay, setAudioAutoPlay] = useLocalStorage<boolean>('audio_auto_play', true);

  useEffect(() => {
    const audioElement = audioRef?.current;
    if (audioAutoPlay && audioElement && src) {
      audioElement.play();
      setIsPlaying(true)
    }
  }, [audioAutoPlay, audioRef, src])

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      const handleTimeUpdate = () => {
        setCurrentTime(audioElement.currentTime);
        setProgress(audioElement.currentTime / audioElement.duration)
      };
      const handlePlay = () => {
        setIsPlaying(true);
      };
      const handlePause = () => {
        setIsPlaying(false);
      };
      const handleLoadedMetadata = () => {
        setDuration(audioElement.duration);
      };

      audioElement.addEventListener('timeupdate', handleTimeUpdate);
      audioElement.addEventListener('play', handlePlay);
      audioElement.addEventListener('pause', handlePause);
      audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        audioElement.removeEventListener('timeupdate', handleTimeUpdate);
        audioElement.removeEventListener('play', handlePlay);
        audioElement.removeEventListener('pause', handlePause);
        audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [audioRef, currentTime]);

  const audioPlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true)
    }
  };

  const audioPause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false)
    }
  };

  const audioStop = () => {
    if (audioRef.current) {
      audioPause()
      setCurrentTime(0)
      setIsPlaying(false)
    }
  };

  const toggleAudioPlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioPause()
      } else {
        audioPlay()
      }
    }
  }

  const audioFastForward = (amount: string) => {
    if (audioRef.current) {
      let time = audioRef.current.currentTime;
      if (amount.endsWith('%')) {
        time += parseTime(amount, audioRef.current.duration);
      } else {
        time += parseTime(amount);
      }
      audioRef.current.currentTime = Math.min(time, audioRef.current.duration);
    }
  };

  const audioRewind = (amount: string) => {
    if (audioRef.current) {
      let time = audioRef.current.currentTime;
      if (amount.endsWith('%')) {
        time -= parseTime(amount, audioRef.current.duration);
      } else {
        time -= parseTime(amount);
      }
      audioRef.current.currentTime = Math.max(time, 0);
    }
  };


  return (
    <AudioPlayerContext.Provider value={{
      audioElement: audioRef.current,
      audioStop,
      audioPlay,
      audioPause,
      toggleAudioPlayPause,
      audioFastForward,
      audioRewind,
      duration,
      src,
      setSrc,
      currentTime,
      setCurrentTime,
      progress,
      setProgress,
      isPlaying,
      setIsPlaying,
      audioAutoPlay,
      setAudioAutoPlay,
    }}>
      <audio
        ref={audioRef}
        src={src}
        autoPlay={audioAutoPlay}
      />
      {children}
    </AudioPlayerContext.Provider>
  );
};

const useAudioPlayerContext = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export { AudioPlayerProvider, useAudioPlayerContext };
