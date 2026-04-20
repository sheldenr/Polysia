export async function parseJsonResponse<T>(
  response: Response,
  options?: {
    emptyMessage?: string;
    invalidMessage?: string;
  },
): Promise<T> {
  const body = await response.text();

  if (!body.trim()) {
    if (!response.ok) {
      console.error(`[API Error] ${response.status} ${response.url}: Empty response body`);
    }
    throw new Error(options?.emptyMessage ?? "The server returned an empty response.");
  }

  try {
    const parsed = JSON.parse(body);
    
    // Log non-OK responses even if they are valid JSON (as they likely contain error details)
    if (!response.ok) {
      console.error(`[API Error] ${response.status} ${response.url}:`, parsed);
    }
    
    return parsed as T;
  } catch (err) {
    console.error(`[API Parse Error] ${response.status} ${response.url}`);
    console.error("Raw Response Body:", body);
    console.error("Parse Error:", err);
    
    throw new Error(options?.invalidMessage ?? "The server returned an invalid JSON response.");
  }
}
