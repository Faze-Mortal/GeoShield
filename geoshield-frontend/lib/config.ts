// ---------------------------------------------------------------------------
// GeoShield — environment & map constants (§1, §6)
// ---------------------------------------------------------------------------

/** Backend API base URL — from env, trimmed of trailing slash. */
export const API_BASE_URL: string = (() => {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';
  return raw.replace(/\/+$/, '');
})();

/** MapLibre style URL — dark basemap, keyless. */
export const MAP_STYLE_URL: string =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ??
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

/** Data bounding box (approximate, padded slightly). */
export const DATA_BBOX = {
  minLon: 76.45,
  minLat: 30.74,
  maxLon: 77.86,
  maxLat: 32.46,
} as const;

/** Initial map center — middle of data box. */
export const MAP_CENTER: [number, number] = [77.15, 31.60];

/** Initial zoom level. */
export const MAP_INITIAL_ZOOM = 11;

/** Minimum zoom at which grid cells are fetched/shown. */
export const MIN_GRID_ZOOM = 11;

/** Maximum cells per /grid request (API hard limit = 10 000). */
export const GRID_FETCH_LIMIT = 10_000;

/** Debounce ms after moveend before fetching grid. */
export const GRID_DEBOUNCE_MS = 400;

/** Default request timeout in ms. */
export const REQUEST_TIMEOUT_MS = 20_000;

/** Bbox padding factor (0.25 = 25 % on each side). */
export const BBOX_PAD_FACTOR = 0.25;
