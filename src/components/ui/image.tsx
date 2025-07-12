import type { FC } from "react"
import {useImage} from 'react-image'

interface ImageProps {
  source: string | string[]
  className?: string
}

export const Image: FC<ImageProps> = (props) => {
  const { source, className } = props
  const { src } = useImage({srcList: source})
  return <img src={src} className={className} />
}
