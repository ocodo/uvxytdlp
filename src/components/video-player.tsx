import { config } from "@/lib/config"
import { useRef, useState } from "react"

interface VideoPlayerProps {
  fileName: string
}

const fileToTitle = (fileName: string): string => fileName.replace(/\.[^/.]+$/, "")

export function VideoPlayer({ fileName }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null)
  const title = fileToTitle(fileName)
  const url = `${config.API_BASE}/downloaded/${fileName}`

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePauseOrEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div className="w-full relative">
      {!isPlaying && <div className="z-1 absolute top-0 left-0 w-full text-sm p-2 bg-card/80">{title}</div>}
        <video
          ref={videoRef}
          className="w-full aspect-video"
          playsInline controls
          onPlay={handlePlay}
          onPause={handlePauseOrEnd}
          onEnded={handlePauseOrEnd} >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
    </div>
  )
}
