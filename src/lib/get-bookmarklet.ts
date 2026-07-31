export const getBookmarklet = (format?: string) => {
  const uvxytlpUrl = window.location.origin + window.location.pathname;

  const formatParam = format
    ? `&uvxytdlp_format=${encodeURIComponent(format)}`
    : '';

  return `open('${uvxytlpUrl}#'+encodeURIComponent(location)+'${formatParam}','_blank')`;
}

export const getMinifiedBookmarklet = (options?: { format?: string }) =>
  `javascript:${getBookmarklet(options?.format)}`;