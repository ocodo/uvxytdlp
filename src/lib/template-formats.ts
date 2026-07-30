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

export const videoFormats = Object.values(VideoFormats);

export const AudioFormats = {
  mp3: 'mp3',
  m4a: 'm4a'
}

export const audioFormats = Object.values(AudioFormats);

export type VideoFormat = typeof VideoFormats[keyof typeof VideoFormats];
export type AudioFormat = typeof AudioFormats[keyof typeof AudioFormats];
export type MediaFormat = AudioFormat | VideoFormat

export const mediaFormats = new Set<MediaFormat>([
  ...Object.values(AudioFormats),
  ...Object.values(VideoFormats),
]);

const getBookmarkletUrl = (url: string) =>
  new URL(url.startsWith("#") ? url.slice(1) : url);

export function getBookmarkletFormat(url: string): MediaFormat | undefined {
  try {
    const format = getBookmarkletUrl(url).searchParams.get("uvxytdlp_format");

    return format && mediaFormats.has(format as MediaFormat)
      ? (format as MediaFormat)
      : undefined;
  } catch {
    return undefined;
  }
}
