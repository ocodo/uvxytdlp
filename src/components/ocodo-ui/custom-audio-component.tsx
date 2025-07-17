import { ToggleStateButton } from "@/components/ocodo-ui/toggle-state-button";
import { SeekBar } from "@/components/ui/seek-bar";
import { cn } from "@/lib/utils";
import { FastForward, PauseIcon, PlayIcon, Rewind } from "lucide-react";
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

  const handleSkip = (fwd: boolean = true) => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;

      const duration = audioRef.current.duration;
      if (!duration || isNaN(duration) || !isFinite(duration)) return;

      const skipTime = duration / 100;
      let newTime: number;
      if (fwd) {
        newTime = Math.min(currentTime + skipTime, duration);
      } else {
        newTime = Math.max(currentTime - skipTime, 0);
      }
      setCurrentTime(newTime);
      setProgress((newTime / duration) * 100);
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) {
      return "0:00";
    }
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    const paddedSeconds = seconds.toString().padStart(2, "0");
    if (hours > 0) {
      const paddedMinutes = minutes.toString().padStart(2, "0");
      return `${hours}:${paddedMinutes}:${paddedSeconds}`;
    }
    return `${minutes}:${paddedSeconds}`;
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


  const controlIconClassName = cn(
    "hover:bg-accent/20 w-6 h-6",
    "rounded-full cursor-pointer",
     "p-2 hover:bg-foreground/10 w-10 h-10 rounded-full",
  );

  const strokePointFive = {
    strokeWidth: 0.5
  }

  return (
    <>
      <div className="w-full">

        <div className="flex items-center justify-center ">
          <Rewind
            onClick={() => handleSkip(false)}
            style={strokePointFive}
            className={cn(controlIconClassName, "pl-1")}
            />
          <ToggleStateButton
            toggleState={handlePlayPause}
            state={isPlaying}
            onIcon={<PlayIcon className="w-6 h-6" style={strokePointFive} />}
            offIcon={<PauseIcon className="w-6 h-6" style={strokePointFive} />}
            />
          <FastForward
            onClick={() => handleSkip()}
            style={strokePointFive}
            className={cn(controlIconClassName, "pr-1")}
          />
        </div>
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
