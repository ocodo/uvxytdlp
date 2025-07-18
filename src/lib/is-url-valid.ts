export const isUrlValid = (url: string | undefined | undefined) => {
  if (typeof url !== "string") {
    return false
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return false
  }
  return true
}
