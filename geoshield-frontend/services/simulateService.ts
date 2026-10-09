// ---------------------------------------------------------------------------
// GeoShield — /simulate service (§2.3)
// ---------------------------------------------------------------------------

import { apiFetch } from '@/lib/api';
import type { SimulateRequest, SimulateResponse } from '@/types/api';

/** Run a rainfall simulation for one cell. */
export async function runSimulation(
  req: SimulateRequest,
  signal?: AbortSignal,
): Promise<SimulateResponse> {
  return apiFetch<SimulateResponse>('/simulate', {
    method: 'POST',
    body: req,
    signal,
  });
}
