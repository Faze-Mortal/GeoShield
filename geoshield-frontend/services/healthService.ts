// ---------------------------------------------------------------------------
// GeoShield — Health Check & Cold-Start Wake-Up Service
// ---------------------------------------------------------------------------

import { apiFetch } from '@/lib/api';
import type { HealthResponse } from '@/types/api';

export type BackendStatus = 'checking' | 'waking' | 'connected' | 'unreachable';

export interface WakeUpState {
  status: BackendStatus;
  attempt: number;
  maxAttempts: number;
  message: string;
  error?: string | null;
}

export type WakeUpListener = (state: WakeUpState) => void;

const MAX_WAKEUP_ATTEMPTS = 5;

// Progressive timeouts per attempt (Render container may take 15-45s)
const ATTEMPT_TIMEOUTS_MS = [7_000, 10_000, 12_000, 15_000, 15_000];

// Base delays between retries
const BASE_DELAYS_MS = [2_000, 3_000, 4_500, 6_000];

// Singleton module state to deduplicate concurrent wake-up loops across mounts/renders
let inFlightPromise: Promise<boolean> | null = null;
let activeAbortController: AbortController | null = null;
let currentState: WakeUpState = {
  status: 'checking',
  attempt: 0,
  maxAttempts: MAX_WAKEUP_ATTEMPTS,
  message: 'Connecting to GeoShield API…',
  error: null,
};

const subscribers = new Set<WakeUpListener>();

function notifySubscribers() {
  for (const listener of subscribers) {
    try {
      listener(currentState);
    } catch {
      // ignore subscriber errors
    }
  }
}

function updateState(partial: Partial<WakeUpState>) {
  currentState = { ...currentState, ...partial };
  notifySubscribers();
}

/** Subscribe to backend status updates. Receives immediate current state on subscribe. */
export function subscribeToWakeUp(listener: WakeUpListener): () => void {
  subscribers.add(listener);
  try {
    listener(currentState);
  } catch {
    // ignore
  }
  return () => {
    subscribers.delete(listener);
  };
}

/** Get current snapshot of backend state. */
export function getBackendState(): WakeUpState {
  return currentState;
}

/** One-shot direct health check — GET / */
export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await apiFetch<HealthResponse>('/', { signal, timeoutMs: 5000 });
    return res.message === 'GeoShield API is running';
  } catch {
    return false;
  }
}

/**
 * Robust backend wake-up loop with exponential backoff and jitter.
 * Automatically deduplicates simultaneous calls across React mounts/rerenders.
 * Stops as soon as the backend responds successfully.
 */
export async function wakeUpBackend(options: {
  force?: boolean;
  signal?: AbortSignal;
} = {}): Promise<boolean> {
  const { force = false, signal } = options;

  // If already connected and not forced, return true immediately
  if (!force && currentState.status === 'connected') {
    return true;
  }

  // If already in flight and not forced, reuse existing promise
  if (!force && inFlightPromise) {
    return inFlightPromise;
  }

  // Cancel any existing controller if forcing a restart
  if (activeAbortController) {
    activeAbortController.abort();
  }

  const controller = new AbortController();
  activeAbortController = controller;

  // Note: We deliberately do NOT forward caller's signal to `controller.abort()`.
  // In React 18/19 Strict Mode (dev), effects mount -> unmount -> remount.
  // If the unmount aborted `controller`, it would kill the in-flight cold-start loop.
  // Instead, the singleton loop runs to completion and updates all subscribers.

  let currentPromise: Promise<boolean>;
  currentPromise = (async (): Promise<boolean> => {
    updateState({
      status: 'checking',
      attempt: 1,
      maxAttempts: MAX_WAKEUP_ATTEMPTS,
      message: 'Connecting to GeoShield API…',
      error: null,
    });

    for (let attemptIndex = 0; attemptIndex < MAX_WAKEUP_ATTEMPTS; attemptIndex++) {
      if (controller.signal.aborted) {
        return false;
      }

      const attemptNum = attemptIndex + 1;
      const timeoutMs = ATTEMPT_TIMEOUTS_MS[attemptIndex] ?? 12_000;

      if (attemptIndex > 0) {
        updateState({
          status: 'waking',
          attempt: attemptNum,
          maxAttempts: MAX_WAKEUP_ATTEMPTS,
          message:
            'Connecting to GeoShield API… Free hosting service may take up to 45 seconds to wake up.',
          error: null,
        });
      }

      try {
        const res = await apiFetch<HealthResponse>('/', {
          signal: controller.signal,
          timeoutMs,
        });

        if (res && (res.message === 'GeoShield API is running' || typeof res.message === 'string')) {
          updateState({
            status: 'connected',
            attempt: attemptNum,
            maxAttempts: MAX_WAKEUP_ATTEMPTS,
            message: 'Connected',
            error: null,
          });
          return true;
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          return false;
        }

        // After attempt 1 fails or is delayed, switch status to 'waking'
        updateState({
          status: 'waking',
          attempt: attemptNum,
          maxAttempts: MAX_WAKEUP_ATTEMPTS,
          message:
            'Connecting to GeoShield API… Free hosting service may take up to 45 seconds to wake up.',
        });

        // If this was the final attempt, we have exhausted retries
        if (attemptIndex === MAX_WAKEUP_ATTEMPTS - 1) {
          const errMsg = err instanceof Error ? err.message : 'Connection timed out';
          updateState({
            status: 'unreachable',
            attempt: attemptNum,
            maxAttempts: MAX_WAKEUP_ATTEMPTS,
            message: 'GeoShield API unreachable',
            error: errMsg,
          });
          return false;
        }

        // Backoff delay with random jitter (0 - 500ms)
        const baseDelay = BASE_DELAYS_MS[attemptIndex] ?? 4_000;
        const jitter = Math.floor(Math.random() * 500);
        const delayMs = baseDelay + jitter;

        await new Promise<void>((resolve) => {
          let timer: ReturnType<typeof setTimeout>;
          const onAbort = () => {
            clearTimeout(timer);
            resolve();
          };
          timer = setTimeout(() => {
            controller.signal.removeEventListener('abort', onAbort);
            resolve();
          }, delayMs);
          controller.signal.addEventListener('abort', onAbort, { once: true });
        });
      }
    }

    return false;
  })().finally(() => {
    if (inFlightPromise === currentPromise) {
      inFlightPromise = null;
    }
  });

  inFlightPromise = currentPromise;
  return inFlightPromise;
}
