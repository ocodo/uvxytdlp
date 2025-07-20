import { useLocalStorage } from '@/hooks/use-local-storage';
import { parseTime } from '@/lib/parse-time';
import { createContext, useContext, useRef, useState, useEffect } from 'react';
import type { ReactNode, FC, Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';

interface AudioPlayerContextValue {
  audioElement: HTMLAudioElement | undefined;
  audioMute: () => boolean;
  setAudioMute: (newValue: boolean) => void;
  audioVolume: () => number | undefined;
  setAudioVolume: (newValue: number) => void;
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

const AudioPlayerContext = createContext<AudioPlayerContextValue | undefined>(undefined);

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export const AudioPlayerProvider: FC<AudioPlayerProviderProps> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(undefined);
  const [audioAutoPlay, setAudioAutoPlay] = useLocalStorage<boolean>('audio_auto_play', true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [src, setSrc] = useState<string | undefined>(undefined);

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
    } else {
      toast.error(`Unable to connect audio player`)
    }
  };

  const audioPause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false)
    } else {
      toast.error(`Unable to connect audio player`)
    }
  };

  const audioStop = () => {
    if (audioRef.current) {
      setCurrentTime(0)
      audioPause()
    } else {
      toast.error(`Unable to connect audio player`)
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
    } else {
      toast.error(`Unable to connect audio player`)
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
    } else {
      toast.error(`Unable to connect audio player`)
    }
  };

  const audioMute = () => !!audioRef?.current?.muted

  const audioVolume = () => audioRef?.current?.volume

  const setAudioMute = (newValue: boolean) => {
    if (audioRef.current) {
      audioRef.current.muted = newValue;
    } else {
      toast.error(`Unable to connect audio player`)
    }
  }

  const setAudioVolume = (newValue: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newValue;
    } else {
      toast.error(`Unable to connect audio player`)
    }
  }

  return (
    <AudioPlayerContext.Provider value={{
      audioElement: audioRef.current,
      audioMute,
      setAudioMute,
      audioVolume,
      setAudioVolume,
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
	id="audio-element"
        ref={audioRef as React.RefObject<HTMLAudioElement>}
        src={src}
        autoPlay={audioAutoPlay}
      />
      {children}
    </AudioPlayerContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAudioPlayerContext = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
