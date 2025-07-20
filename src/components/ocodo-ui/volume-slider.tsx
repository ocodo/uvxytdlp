import { useState, type FC } from "react";

interface VolumeSliderProps {
  audioVolume: number | undefined
  setAudioVolume: (newValue: number) => void
}

export const VolumeSlider: FC<VolumeSliderProps> = ({ audioVolume, setAudioVolume }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchVolumeChange = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.touches[0].clientY - rect.top;
    const volume = Math.min(1, Math.max(0, 1 - (y / rect.height)));
    setAudioVolume(volume);
  }

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const volume = Math.min(1, Math.max(0, 1 - (y / rect.height)));
    setAudioVolume(volume);
  };

  const  getMiddleStops = (volumePercent: number, spread = 5) => {
    const offset = (volumePercent / 100) * spread * 10;
    return {
      s1: volumePercent - offset,
      s2: volumePercent - offset/3,
      center: volumePercent,
      e1: volumePercent + offset/3,
      e2: volumePercent + offset,
    };
  }

  const volumePercent = (audioVolume || 0) * 100
  const {s1, s2, center, e1, e2} = getMiddleStops(volumePercent, 5)

  return (
    <div
      className="w-6 h-45 sm:h-35 bg-secondary rounded-full cursor-pointer inset-shadow-accent touch-none"
      style={{
        background: `linear-gradient(to top, var(--primary) 0%, var(--primary) ${s1}%, var(--primary) ${s2}%, var(--primary) ${center}%, #00000022 ${e1}%, #00000022 ${e2}%, #00000022 100%)`,
      }}

      onTouchStart={
        (e) => {
          setIsDragging(true)
          handleTouchVolumeChange(e)
        }
      }
      onTouchMove={
        (e) => {
          if(isDragging) {
            handleTouchVolumeChange(e)
          }
        }
      }
      onTouchEnd={() => setIsDragging(false)}
      onTouchCancel={() => setIsDragging(false)}

      onMouseDown={(e) => {
        setIsDragging(true);
        handleVolumeChange(e);
      }}
      onMouseMove={(e) => {
        if (isDragging) {
          handleVolumeChange(e);
        }
      }}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    />
  );
};
