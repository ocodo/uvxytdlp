import { Img } from 'react-image';
import { useApiBase } from "@/contexts/api-base-context"
import { CustomAudioPlayer } from '@/components/ocodo-ui/custom-audio-component';
import { useEffect, type FC } from 'react';
import { UvxYtdlpIcon } from '@/components/branding/uvxytdlp-icon';
import { useAudioPlayerContext } from '@/contexts/audio-player-context-provider';
import { PauseIcon, PlayIcon } from 'lucide-react';
import { thinIconStyle } from '@/lib/style';

interface AudioPlayerProps {
  fileName: string;
}

const fileToTitle = (fileName: string): string => fileName.replace(/\.[^/.]+$/, "")

export const AudioPlayer: FC<AudioPlayerProps> = ({ fileName }) => {
  const title = fileToTitle(fileName)
  const ext = fileName.replace(`${title}.`, '')
  const { apiBase } = useApiBase()
  const { setSrc, toggleAudioPlayPause, isPlaying } = useAudioPlayerContext()

  useEffect(() => {
    if (apiBase && fileName) {
      const url = `${apiBase}/downloaded/${fileName}`
      setSrc(url)
    }
  }, [fileName, apiBase, setSrc])

  return (
    <div className={`select-none grid grid-cols-1 md:grid-cols-[auto_1fr] sm:m-3 gap-4 p-4
                     justify-center items-center relative`}>
      <div
        onClick={() => toggleAudioPlayPause()}
        className='group flex flex-row items-center justify-center'
      >
        <div
          className={`absolute cursor-pointer opacity-10
                       group-hover:opacity-100
                       transition-opacity duration-500
                       rounded-full bg-background/30
                       w-20 h-20 mb-[22px]
                       flex flex-row items-center justify-center`}>
          {isPlaying
            ? <PauseIcon
              style={{ stroke: '#fff', ...thinIconStyle }}
              className="w-12 h-12 ml-[3px]" />
            : <PlayIcon
              style={{ stroke: '#fff', ...thinIconStyle }}
              className="w-12 h-12 ml-[3px]" />
          }
        </div>
        <div className='flex flex-row items-center justify-center'>
          <Img
            className="h-[15em] bg-background/20 rounded-xl object-cover"
            src={`${apiBase}/thumbnail/${fileName}`}
            unloader={<UvxYtdlpIcon
              size={301}
              colors={["#6004", "#0604", "#0064"]}
              strokeWidth={6}
              totalDuration={10000}
              fadeDuration={3000}
            />}
          />
        </div>

      </div>
      {/* Col 2 */}
      <div className="grid grid-rows-[1fr_auto] h-full gap-4">
        <div className="flex items-end">
          <CustomAudioPlayer />
        </div>
        <div className="flex items-start justify-between gap-4">
          <h2 className="italic">{title}</h2>
          <div className="rounded-full bg-primary text-primary-foreground text-xs px-2 p-1">{ext}</div>
        </div>
      </div>
    </div>
  )
}
