import { useApiBase } from "@/contexts/api-base-context"

interface AudioPlayerProps {
  fileName: string
}

const fileToTitle = (fileName: string): string => fileName.replace(/\.[^/.]+$/, "")

export function AudioPlayer({ fileName }: AudioPlayerProps) {
  const title = fileToTitle(fileName)
  const { apiBase } = useApiBase()

  const url = `${apiBase}/downloaded/${fileName}`
  const fileExtension = fileName.split('.').pop() || 'mp3'

  // Mime type for m4a is audio/mp4
  const mimeType = `audio/${fileExtension === 'm4a' ? 'mp4' : fileExtension}`

  return (
    <div className="w-full relative bg-card p-4 rounded-lg shadow-md border">
      <div className="text-sm font-semibold mb-2 truncate" title={title}>
        {title}
      </div>
      <audio className="w-full" controls autoPlay src={url}>
        <source src={url} type={mimeType} />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}
