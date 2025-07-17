import { Img } from 'react-image';
import { useApiBase } from "@/contexts/api-base-context"
import { CustomAudioPlayer } from '@/components/custom-audio-component';
import { useAVSettingsContext } from '@/contexts/video-settings-context';
import type { FC } from 'react';
import { UvxYtdlpIcon } from '@/components/uvxytdlp-icon';

interface AudioPlayerProps {
  fileName: string;
}

const fileToTitle = (fileName: string): string => fileName.replace(/\.[^/.]+$/, "")

export const AudioPlayer: FC<AudioPlayerProps> = ({ fileName }) => {
  const title = fileToTitle(fileName)
  const { apiBase } = useApiBase()
  const { audioAutoPlay } = useAVSettingsContext()
  const url = `${apiBase}/downloaded/${fileName}`

  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 justify-center items-center p-4 sm:border sm:rounded-xl">
      {/* Col 1 */}
      <div className='flex flex-row items-center justify-center'>
        <Img
          className="h-[15em] bg-background/20 rounded-xl"
          src={`${apiBase}/thumbnail/${fileName}`}
          unloader={<UvxYtdlpIcon
          className='opacity-[30%]'
            size={301}
            strokeWidth={6}
            totalDuration={10000}
            fadeDuration={3000} />}
        />
      </div>
      {/* Col 2 */}
      <div className="grid grid-rows-[1fr_auto] h-full gap-4">
        <div className="flex items-end">
          <h2 className="">{title}</h2>
        </div>
        <div className="flex items-start">
          <CustomAudioPlayer src={url} autoPlay={audioAutoPlay} />
        </div>
      </div>
    </div>
  )
}
