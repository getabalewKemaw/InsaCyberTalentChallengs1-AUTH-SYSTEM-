export interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Builds a clean, fully-qualified API URL handling environment variables and query params.
 */
export function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").trim();

  let origin = envUrl.replace(/\/+$/, "");
  if (origin.endsWith("/api/v1")) {
    origin = origin.slice(0, -7);
  } else if (origin.endsWith("/api")) {
    origin = origin.slice(0, -4);
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const finalPath = cleanEndpoint.startsWith("/api") ? cleanEndpoint : `/api/v1${cleanEndpoint}`;

  let fullUrl = `${origin}${finalPath}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    fullUrl += `?${searchParams.toString()}`;
  }

  return fullUrl;
}

/**
 * Generic fetch wrapper for API calls with JSON handling, session credentials, and error handling.
 */
export async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...init } = options;
  const url = buildUrl(endpoint, params);

  // Include credentials for session cookies
  init.credentials = "include";

  if (init.body && typeof init.body !== "string" && !(init.body instanceof FormData)) {
    init.body = JSON.stringify(init.body);
    init.headers = {
      ...init.headers,
      "Content-Type": "application/json",
    };
  }

  const response = await fetch(url, init);

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} (${response.statusText}): ${text.slice(0, 150)}`);
    }
    throw new Error(`Invalid JSON response: ${text.slice(0, 150)}`);
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}
