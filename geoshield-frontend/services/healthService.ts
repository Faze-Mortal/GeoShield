// ---------------------------------------------------------------------------
// GeoShield — health check service
// ---------------------------------------------------------------------------

import { apiFetch } from '@/lib/api';
import type { HealthResponse } from '@/types/api';

/** One-shot health check — GET / */
export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await apiFetch<HealthResponse>('/', { signal, timeoutMs: 5000 });
    return res.message === 'GeoShield API is running';
  } catch {
    return false;
  }
}
