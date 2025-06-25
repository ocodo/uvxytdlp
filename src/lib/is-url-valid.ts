export const isUrlValid = (url: string | null | undefined) => {
  if (typeof url !== "string") {
    return false
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return false
  }
  return true
}
