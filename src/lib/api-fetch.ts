export function createApiFetch(apiBase: string) {
  if (!apiBase) {
    throw new Error("API base URL is required.");
  }

  return async function apiFetch(
    path: string,
    options?: RequestInit
  ): Promise<Response> {
    const url = `${apiBase}${path.startsWith("/") ? "" : "/"}${path}`;
    return fetch(url, options);
  };
}
