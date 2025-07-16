export const formatTemplates: Record<MediaFormat, string> = {
  mp4: "-t mp4",
  mkv: "-t mkv",

  m4a: "-t aac",
  mp3: "-t mp3",
}

export const VideoFormats = {
  mp4: 'mp4',
  mkv: 'mkv'
}
export const AudioFormats = {
  mp3: 'mp3',
  m4a: 'm4a'
}

export type VideoFormat = typeof VideoFormats[keyof typeof VideoFormats];
export type AudioFormat = typeof AudioFormats[keyof typeof AudioFormats];
export type MediaFormat = AudioFormat | VideoFormat
