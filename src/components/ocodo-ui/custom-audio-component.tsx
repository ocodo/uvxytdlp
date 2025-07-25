import { controlIconClassName, thinIconStyle } from "@/lib/icon-style";
import { ToggleStateButton } from "@/components/ocodo-ui/toggle-state-button";
import { SeekBar } from "@/components/ui/seek-bar";
import { useAudioPlayerContext } from "@/contexts/audio-player-context-provider";
import { cn } from "@/lib/utils";
import { FastForward, PauseIcon, PlayIcon, Rewind, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, type Dispatch, type FC, type SetStateAction } from "react";
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

  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-center px-1 gap-4">
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
              <VolumeControl
                setAudioMute={setAudioMute}
                setAudioVolume={setAudioVolume}
                setAudioVolumeController={setAudioVolumeController}
                setShowVolumeSlider={setShowVolumeSlider}
                audioMute={audioMute}
                audioVolume={audioVolume}
              />
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

interface VolumeControlProps {
  setShowVolumeSlider: Dispatch<SetStateAction<boolean>>
  audioVolume: number | undefined
  setAudioVolume: Dispatch<SetStateAction<number | undefined>>
  setAudioVolumeController: (value: number) => void
  setAudioMute: Dispatch<SetStateAction<boolean | undefined>>
  audioMute: boolean | undefined
}

interface VolumeControlProps {
  setShowVolumeSlider: Dispatch<SetStateAction<boolean>>
  audioVolume: number | undefined
  setAudioVolume: Dispatch<SetStateAction<number | undefined>>
  setAudioVolumeController: (value: number) => void
  setAudioMute: Dispatch<SetStateAction<boolean | undefined>>
  audioMute: boolean | undefined
}

const VolumeControl: FC<VolumeControlProps> = ({
  setShowVolumeSlider,
  audioVolume,
  setAudioVolume,
  setAudioVolumeController,
  setAudioMute,
  audioMute
}) => {
  const ref = useRef<HTMLDivElement | null>(null)

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!ref.current) return
    const touch = e.touches[0]
    const rect = ref.current.getBoundingClientRect()
    const inside =
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom

    if (!inside) {
      setShowVolumeSlider(false)
    }
  }

  const handleTouchEnd = () => {
    setShowVolumeSlider(false)
  }

  return (
    <div
      ref={ref}
      onMouseOut={() => setShowVolumeSlider(false)}
      onMouseMove={(e) => e}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="absolute touch-none flex flex-col items-center justify-center left-0 bottom-0 right-0 bg-background/75 px-2 pt-2 rounded-full shadow"
    >
      <VolumeSlider
        audioVolume={audioVolume}
        setAudioVolume={(newValue: number) => {
          setAudioVolume(() => {
            setAudioVolumeController(newValue)
            return newValue
          })
        }}
      />
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
  )
}
