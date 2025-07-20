import { thinIconStyle } from "@/lib/icon-style";
import { ToggleStateButton } from "@/components/ocodo-ui/toggle-state-button";
import { SeekBar } from "@/components/ui/seek-bar";
import { useAudioPlayerContext } from "@/contexts/audio-player-context-provider";
import { cn } from "@/lib/utils";
import { FastForward, PauseIcon, PlayIcon, Rewind, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState, type FC } from "react";
import { VolumeSlider } from "@/components/ocodo-ui/volume-slider";

export const CustomAudioPlayer: FC = () => {
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false)
  const [audioMute, setAudioMute] = useState<boolean>()
  const [audioVolume, setAudioVolume] = useState<number>()
  const {
    audioElement,
    isPlaying,
    audioMute: audioMuteController,
    setAudioMute: setAudioMuteController,
    audioVolume: audioVolumeController,
    setAudioVolume: setAudioVolumeController,
    audioFastForward,
    audioRewind,
    audioPlay: play,
    audioPause: pause,
    currentTime,
    setProgress,
    setCurrentTime,
    duration,
  } = useAudioPlayerContext()

  useEffect(() => setAudioVolume(audioVolumeController())
    , [audioVolumeController, setAudioVolumeController, setAudioVolume]);

    useEffect(() => setAudioMute(audioMuteController())
    , [audioMuteController, setAudioMuteController, setAudioMute]);

  useEffect(() => {
    if (audioMuteController() != !!audioMute) {
      setAudioMuteController(!!audioMute);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioMute])


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

  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-center px-1">
          <Rewind
            onClick={() => audioRewind('5%')}
            style={thinIconStyle}
            className={cn(controlIconClassName)}
          />
          <ToggleStateButton
            className="cursor-pointer"
            toggleState={() => isPlaying ? pause() : play()}
            state={isPlaying}
            onIcon={<PlayIcon className="w-6 h-6" style={thinIconStyle} />}
            offIcon={<PauseIcon className="w-6 h-6" style={thinIconStyle} />}
          />
          <FastForward
            onClick={() => audioFastForward('5%')}
            style={thinIconStyle}
            className={cn(controlIconClassName)}
          />
          <div></div>
          <div
            className="relative"
            onMouseOver={() => setShowVolumeSlider(true)}
          >
            <div
              className={controlIconClassName}
            >
              {audioMute
                ? <VolumeX className="w-6 h-6" style={thinIconStyle} />
                : <Volume2 className="w-6 h-6" style={thinIconStyle} />
              }
            </div>
            {showVolumeSlider && (
              <div
                onMouseOut={() => setShowVolumeSlider(false)}
                onMouseMove={(e) => e}
                className="absolute flex flex-col items-center justify-center left-0 bottom-0 right-0 bg-background/75 px-2 pt-2 rounded-full shadow">
                <VolumeSlider audioVolume={audioVolume} setAudioVolume={(newValue: number) => {
                  setAudioVolume(
                    () => {
                      setAudioVolumeController(newValue)
                      return newValue
                    }
                  )
                }} />
                <div
                  className={cn(controlIconClassName)}
                  onClick={() => setAudioMute(!audioMute)}
                >
                  {audioMute
                    ? <VolumeX className="w-6 h-6" style={thinIconStyle} />
                    : <Volume2 className="w-6 h-6" style={thinIconStyle} />
                  }
                </div>
              </div>
            )}
          </div>
        </div>
        <SeekBar
          value={currentTime}
          duration={duration}
          onChange={(e) => {
            const newTime = parseFloat(e.target.value)
            setCurrentTime(newTime)
            setProgress((newTime / duration) * 100)
            if (audioElement) {
              audioElement.currentTime = newTime
            }
          }}
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
          <span>{formatTime(currentTime)}</span>
          <span className="text-xl">{formatTime(currentTime)}</span>
          <span>{'-' + formatTime(duration - currentTime)}</span>
        </div>
      </div>
    </>
  );
}

