// ---------------------------------------------------------------------------
// GeoShield — /grid service (§2.2)
// ---------------------------------------------------------------------------

import { apiFetch } from '@/lib/api';
import type { BBox } from '@/lib/geo';
import type { GridResponse, GridFeature } from '@/types/api';
import { GRID_FETCH_LIMIT } from '@/lib/config';

export interface GridFetchParams {
  bbox?: BBox;
  cellId?: string;
  limit?: number;
  signal?: AbortSignal;
}

/** Fetch grid cells — by viewport bbox, single cell_id, or both. */
export async function getGrid(params: GridFetchParams = {}): Promise<GridResponse> {
  const { bbox, cellId, limit = GRID_FETCH_LIMIT, signal } = params;

  const qs = new URLSearchParams();

  if (cellId) qs.set('cell_id', cellId);

  if (bbox) {
    qs.set('min_lon', String(bbox.minLon));
    qs.set('min_lat', String(bbox.minLat));
    qs.set('max_lon', String(bbox.maxLon));
    qs.set('max_lat', String(bbox.maxLat));
  }

  qs.set('limit', String(limit));

  const path = `/grid?${qs.toString()}`;
  return apiFetch<GridResponse>(path, { signal });
}

/** Fetch geometry for a single cell by ID. */
export async function getCellGeometry(
  cellId: string,
  signal?: AbortSignal,
): Promise<GridFeature | null> {
  const res = await getGrid({ cellId, limit: 1, signal });
  if (res.features && res.features.length > 0) {
    return res.features[0];
  }
  return null;
}
