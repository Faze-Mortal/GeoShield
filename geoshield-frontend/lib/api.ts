// ---------------------------------------------------------------------------
// GeoShield — fetch wrapper, ApiError, timeout, abort (§5)
// ---------------------------------------------------------------------------

import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config';

// ---- ApiError -------------------------------------------------------------

export type ApiErrorKind =
  | 'network'
  | 'not_found'
  | 'bad_request'
  | 'validation'
  | 'server'
  | 'unknown';

export class ApiError extends Error {
  status: number | null;
  kind: ApiErrorKind;

  constructor(message: string, status: number | null, kind: ApiErrorKind) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
  }
}

// ---- helpers --------------------------------------------------------------

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 404) return 'not_found';
  if (status === 400) return 'bad_request';
  if (status === 422) return 'validation';
  if (status >= 500) return 'server';
  return 'unknown';
}

/** Normalize FastAPI `detail` (string | array of {msg, ...}). */
function normalizeDetail(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        if (typeof d === 'object' && d !== null && 'msg' in d) {
          return String((d as { msg: string }).msg);
        }
        return JSON.stringify(d);
      })
      .join('; ');
  }
  return 'An unknown error occurred';
}

// ---- fetcher --------------------------------------------------------------

export interface FetchOptions {
  signal?: AbortSignal;
  method?: string;
  body?: unknown;
  timeoutMs?: number;
}

/**
 * Central JSON fetcher — all API calls go through here.
 * Returns parsed JSON on success; throws `ApiError` on failure.
 */
export async function apiFetch<T>(
  path: string,
  opts: FetchOptions = {},
): Promise<T> {
  const { method = 'GET', body, signal, timeoutMs = REQUEST_TIMEOUT_MS } = opts;

  const url = `${API_BASE_URL}${path}`;

  // Compose abort: user signal + timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // If caller supplied a signal, forward its abort
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      controller.abort();
    } else {
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  try {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const json = await res.json();
        if (json && json.detail !== undefined) {
          detail = normalizeDetail(json.detail);
        }
      } catch {
        // body isn't JSON — keep status text
      }
      throw new ApiError(detail, res.status, kindFromStatus(res.status));
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // Abort (user or timeout)
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err; // propagate as-is; callers treat AbortError as non-error
    }
    throw new ApiError(
      err instanceof Error ? err.message : 'Network error',
      null,
      'network',
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
