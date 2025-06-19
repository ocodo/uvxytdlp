"use client"
import { config } from "@/lib/config"
import { useRef } from "react"

interface VideoPlayerProps {
  fileName: string
}

const fileToTitle = (fileName: string): string => fileName.replace(/\.[^/.]+$/, "")

export function VideoPlayer({ fileName }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const title = fileToTitle(fileName)
  const url = `${config.API_BASE}/downloaded/${fileName}`

  return (
    <div className="w-full">
      <div className="text-xl font-semibold p-4 bg-card">{title}</div>
        <video ref={videoRef} className="w-full aspect-video" playsInline controls>
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
    </div>
  )
}
