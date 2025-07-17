import { useApiBase } from "@/contexts/api-base-context"
import { useAVSettingsContext } from "@/contexts/video-settings-context"
import { useEffect, useRef, useState } from "react"


interface VideoPlayerProps {
  fileName: string
}

const fileToTitle = (fileName: string): string => fileName.replace(/\.[^/.]+$/, "")

export function VideoPlayer({ fileName }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const title = fileToTitle(fileName)
  const { apiBase } = useApiBase()
  const { videoAutoPlay } = useAVSettingsContext()

  const url = `${apiBase}/downloaded/${fileName}`

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePauseOrEnd = () => {
    setIsPlaying(false)
  }

  useEffect(() => {
    const videoElement = videoRef.current

    // Auto-play on load if setting is enabled
    if (videoAutoPlay && videoElement) {
      const playPromise = videoElement.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Autoplay was blocked:", err)
        })
      }
    }
  }, [videoAutoPlay, url])

  useEffect(() => {
    const videoElement = videoRef.current

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'f' && videoElement && document.activeElement === videoElement) {
        event.preventDefault()
        if (document.fullscreenElement === videoElement) {
          document.exitFullscreen()
        } else {
          videoElement.requestFullscreen()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [videoRef])

  return (
    <div className="w-full relative bg-black">
      {!isPlaying && <div className="z-1 absolute top-0 left-0 w-full text-sm p-2 bg-card/80">{title}</div>}
      <video
        key={url}
        ref={videoRef}
        className="w-full aspect-video"
        playsInline
        controls
        autoPlay={videoAutoPlay}
        onPlay={handlePlay}
        onPause={handlePauseOrEnd}
        onEnded={handlePauseOrEnd}
      >
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
