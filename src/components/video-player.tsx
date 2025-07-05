import { useApiBase } from "@/contexts/api-base-context"
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

  const url = `${apiBase}/downloaded/${fileName}`

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePauseOrEnd = () => {
    setIsPlaying(false)
  }

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
  }, [])

  return (
    <div className="w-full relative bg-black">
      {!isPlaying && <div className="z-1 absolute top-0 left-0 w-full text-sm p-2 bg-card/80">{title}</div>}
      <video
        key={url}
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
