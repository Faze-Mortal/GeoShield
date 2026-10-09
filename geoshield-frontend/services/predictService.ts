// ---------------------------------------------------------------------------
// GeoShield — /predict service (§2.1)
// ---------------------------------------------------------------------------

import { apiFetch } from '@/lib/api';
import type { PredictResponse } from '@/types/api';

/** Fetch prediction for a single cell. */
export async function getPrediction(
  cellId: string,
  signal?: AbortSignal,
): Promise<PredictResponse> {
  return apiFetch<PredictResponse>(`/predict/${encodeURIComponent(cellId)}`, {
    signal,
  });
}
