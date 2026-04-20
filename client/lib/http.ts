export async function parseJsonResponse<T>(
  response: Response,
  options?: {
    emptyMessage?: string;
    invalidMessage?: string;
  },
): Promise<T> {
  const body = await response.text();

  if (!body.trim()) {
    throw new Error(options?.emptyMessage ?? "The server returned an empty response.");
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(options?.invalidMessage ?? "The server returned an invalid JSON response.");
  }
}
