// api.ts
const BASE_URL: string = process.env.NEXT_PUBLIC_BACKENDBASEURL || "http://localhost:3000";
// (use process.env.NEXT_PUBLIC_API_URL if Next.js, or your framework's equivalent)

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      credentials: "include", // sends/receives cookies automatically
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
  } catch (err) {
    /* No response at all (a TypeError: "Failed to fetch"): the backend isn't
       running or can't be reached, or the browser refused it (CORS). Callers
       tell this apart from an ApiError and show a retry; in development the
       console says where it was looking. */
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[api] ${options.method ?? "GET"} ${BASE_URL}${endpoint} got no response. Is the backend running at ${BASE_URL}? ` +
          "(backend: npm run dev; the URL is NEXT_PUBLIC_BACKENDBASEURL)",
        err,
      );
    }
    throw err;
  }

  if (!res.ok) {
    let errorBody: unknown = null;
    try {
      errorBody = await res.json();
    } catch {
      // no JSON body
    }
    const message =
      (errorBody as { message?: string })?.message || `Request failed: ${res.status}`;
    throw new ApiError(message, res.status, errorBody);
  }

  if (res.status === 204) return null as T;

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(data) }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(data) }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", body: JSON.stringify(data) }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};

export { ApiError };