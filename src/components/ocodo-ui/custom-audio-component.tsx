import { ToggleStateButton } from "@/components/ocodo-ui/toggle-state-button";
import { SeekBar } from "@/components/ui/seek-bar";
import { useAudioPlayerContext } from "@/contexts/audio-player-context-provider";
import { cn } from "@/lib/utils";
import { FastForward, PauseIcon, PlayIcon, Rewind } from "lucide-react";
import { type FC } from "react";

export const CustomAudioPlayer: FC = () => {
  const {
    isPlaying,
    setProgress,
    audioFastForward,
    audioRewind,
    audioPlay: play,
    audioPause: pause,
    audioElement,
    currentTime,
    setCurrentTime,
    duration,
  } = useAudioPlayerContext()

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
        <div className="flex items-center justify-center px-1">
          <Rewind
            onClick={() => audioRewind('5%')}
            style={strokePointFive}
            className={cn(controlIconClassName)}
            />
          <ToggleStateButton
            className="cursor-pointer"
            toggleState={() => isPlaying ? pause() : play() }
            state={isPlaying}
            onIcon={<PlayIcon className="w-6 h-6" style={strokePointFive} />}
            offIcon={<PauseIcon className="w-6 h-6" style={strokePointFive} />}
            />
          <FastForward
            onClick={() => audioFastForward('5%')}
            style={strokePointFive}
            className={cn(controlIconClassName)}
            />
        </div>
        <SeekBar
          value={currentTime}
          max={duration}
          onChange={(e) => {
            const newTime = parseFloat(e.target.value)
            setCurrentTime(newTime)
            setProgress((newTime / duration) * 100)
            if (audioElement) {
              audioElement.currentTime = newTime
            }
          }}
          />
      {/* TODO: */}
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>{formatTime(0)}</span>
          <span>{formatTime(currentTime)}</span>
          <span>{'-' + formatTime(duration - currentTime)}</span>
        </div>
      </div>
    </>
  );
}
