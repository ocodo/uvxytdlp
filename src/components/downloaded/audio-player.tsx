import { Img } from 'react-image';
import { useApiBase } from "@/contexts/api-base-context"
import { CustomAudioPlayer } from '@/components/ocodo-ui/custom-audio-component';
import { useEffect, type FC } from 'react';
import { UvxYtdlpIcon } from '@/components/branding/uvxytdlp-icon';
import { useAudioPlayerContext } from '@/contexts/audio-player-context-provider';

interface AudioPlayerProps {
  fileName: string;
}

const fileToTitle = (fileName: string): string => fileName.replace(/\.[^/.]+$/, "")

export const AudioPlayer: FC<AudioPlayerProps> = ({ fileName }) => {
  const title = fileToTitle(fileName)
  const ext = fileName.replace(`${title}.`,'')
  const { apiBase } = useApiBase()
  const { setSrc } = useAudioPlayerContext()

  useEffect(() => {
    if (apiBase && fileName) {
      const url = `${apiBase}/downloaded/${fileName}`
      setSrc(url)
    }
  }, [fileName, apiBase, setSrc])

  return (
    <div className={`select-none grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 p-4
                     justify-center items-center sm:border sm:rounded-xl`}>
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
