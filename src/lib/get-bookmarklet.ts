export const getBookmarklet = () => {
  const uvxytlpUrl = window.location.origin + window.location.pathname;

  const script = `(function() {
  const currentUrl = encodeURIComponent(window.location.href);
  const instantDownloadUrl = '${uvxytlpUrl}#' + currentUrl;
  window.open(instantDownloadUrl, '_blank');
})();
`

  return `${script}`
}

export const getMinifiedBookmarklet = () => {
  const minifiedScript = getBookmarklet().replace(/\s+/g, ' ').trim();
  return `javascript:${minifiedScript}`
}
