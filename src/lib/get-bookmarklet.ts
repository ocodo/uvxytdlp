export const getBookmarklet = (format?: string) => {
  const uvxytlpUrl = window.location.origin + window.location.pathname;

  const formatParam = format
    ? `&uvxytdlp_format=${encodeURIComponent(format)}`
    : '';

  const script = `(function() {
  const currentUrl = encodeURIComponent(window.location.href);
  const instantDownloadUrl = '${uvxytlpUrl}#' + currentUrl + '${formatParam}';
  window.open(instantDownloadUrl, '_blank');
})();
`

  return script;
}

export const getMinifiedBookmarklet = (options?: { format?: string }) => {
  const minifiedScript = getBookmarklet(options?.format)
    .replace(/\s+/g, ' ')
    .trim();

  return `javascript:${minifiedScript}`;
}