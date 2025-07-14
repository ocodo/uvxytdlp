import { ToggleStateButton } from "@/components/toggle-state-button";
import { SeekBar } from "@/components/ui/seek-bar";
import { PauseIcon, PlayIcon } from "lucide-react";
import { type FC, useState, useRef, useEffect } from "react";

interface CustomAudioPlayerProps {
  src: string;
  autoPlay?: boolean;
}

export const CustomAudioPlayer: FC<CustomAudioPlayerProps> = ({ src, autoPlay }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (autoPlay) {
      audioRef.current?.play();
      setIsPlaying(true)
    }
  }, [autoPlay])

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress(
        (audioRef.current.currentTime / audioRef.current.duration) * 100
      );
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setProgress(0);
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [isPlaying]);

  return (
    <>
      <div className="w-full">
        <ToggleStateButton
          toggleState={handlePlayPause}
          state={isPlaying}
          onIcon={<PlayIcon className="w-6 h-6" style={{strokeWidth: 0.5}} />}
          offIcon={<PauseIcon className="w-6 h-6" style={{strokeWidth: 0.5}} />}
        />
        <SeekBar
          value={currentTime}
          max={duration}
          onChange={(e) => {
            const newTime = parseFloat(e.target.value)
            setCurrentTime(newTime)
            setProgress((newTime / duration) * 100)
            if (audioRef.current) {
              audioRef.current.currentTime = newTime
            }
          }}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <audio
        src={src}
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </>
  );
}

