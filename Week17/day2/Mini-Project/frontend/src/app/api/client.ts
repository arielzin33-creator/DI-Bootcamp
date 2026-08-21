/**
 * The single place every network call goes through.
 *
 * It implements the flow the brief describes: when a request comes back 401, ask
 * /auth/refresh for a fresh access token using the httpOnly refresh cookie, hand the
 * new token back to the store, and *replay the original request* so the user never
 * notices their 15-minute access token expired.
 *
 * Design note -- why the token is passed in rather than imported:
 * this module deliberately does not import the Redux store. If it did, the cycle
 * `store -> slices -> client -> store` would make module initialisation order fragile.
 * Instead each thunk passes the current token from `getState()` and a callback to
 * dispatch the refreshed one. The store stays the single source of truth, and this
 * file stays a leaf module.
 */
import type { ApiErrorResponse } from "@storyapp/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

/** An error carrying the HTTP status and any field-level validation errors. */
export class ApiClientError extends Error {
  public readonly status: number;
  public readonly errors?: Record<string, string>;

  constructor(status: number, message: string, errors?: Record<string, string>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Current access token from the Redux store, if the user is logged in. */
  token?: string | null;
  /** Called with a newly minted access token so the caller can put it in the store. */
  onTokenRefreshed?: (accessToken: string) => void;
  /** Called when refreshing failed -- the session is truly over, log the user out. */
  onAuthFailure?: () => void;
  /** Set on the refresh call itself, to avoid recursing forever. */
  skipRefresh?: boolean;
}

function buildRequest(path: string, options: ApiRequestOptions): Promise<Response> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  // The Authorization header the brief asks for on every authenticated request.
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  return fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    // Required for the browser to send/receive the httpOnly refresh cookie.
    credentials: "include",
  });
}

async function toError(response: Response): Promise<ApiClientError> {
  let message = "Something went wrong. Please try again.";
  let errors: Record<string, string> | undefined;
  try {
    const data = (await response.json()) as ApiErrorResponse;
    if (data?.message) message = data.message;
    errors = data?.errors;
  } catch {
    // Body was empty or not JSON (e.g. a proxy error page) -- keep the default message.
  }
  return new ApiClientError(response.status, message, errors);
}

/**
 * A module-level promise so that concurrent 401s trigger only ONE refresh call.
 *
 * Without this, a page that fires four requests at once on load would send four
 * parallel refreshes; because the backend rotates the refresh cookie on every use,
 * the later ones would race against an already-replaced token and spuriously log the
 * user out. Sharing one in-flight promise makes them all await the same refresh.
 */
let inFlightRefresh: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  inFlightRefresh ??= (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) return null;
      const data = (await response.json()) as { accessToken: string };
      return data.accessToken;
    } catch {
      return null;
    } finally {
      // Clear on the next tick so callers awaiting this promise still see it resolve.
      setTimeout(() => {
        inFlightRefresh = null;
      }, 0);
    }
  })();

  return inFlightRefresh;
}

/** Performs a request, transparently refreshing and replaying once on a 401. */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  let response = await buildRequest(path, options);

  if (response.status === 401 && !options.skipRefresh) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      options.onTokenRefreshed?.(newToken);
      // Replay the original request with the fresh token.
      response = await buildRequest(path, { ...options, token: newToken });
    } else {
      // The refresh token is gone or expired -> the session is over.
      options.onAuthFailure?.();
      throw await toError(response);
    }
  }

  if (!response.ok) throw await toError(response);

  // 204 No Content (logout, delete) has an empty body -- calling .json() would throw.
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}
