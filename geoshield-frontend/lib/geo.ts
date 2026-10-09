// ---------------------------------------------------------------------------
// GeoShield — bbox / geometry helpers (§6.3)
// ---------------------------------------------------------------------------

export interface BBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

/** Pad a bbox by `factor` on each side (0.25 = 25%). */
export function padBBox(bbox: BBox, factor: number): BBox {
  const lonSpan = bbox.maxLon - bbox.minLon;
  const latSpan = bbox.maxLat - bbox.minLat;
  return {
    minLon: bbox.minLon - lonSpan * factor,
    minLat: bbox.minLat - latSpan * factor,
    maxLon: bbox.maxLon + lonSpan * factor,
    maxLat: bbox.maxLat + latSpan * factor,
  };
}

/** Check whether `inner` is fully contained within `outer`. */
export function bboxContains(outer: BBox, inner: BBox): boolean {
  return (
    inner.minLon >= outer.minLon &&
    inner.minLat >= outer.minLat &&
    inner.maxLon <= outer.maxLon &&
    inner.maxLat <= outer.maxLat
  );
}

/** Round bbox coords to form a cache key. */
export function bboxKey(b: BBox, precision = 3): string {
  return `${b.minLon.toFixed(precision)},${b.minLat.toFixed(precision)},${b.maxLon.toFixed(precision)},${b.maxLat.toFixed(precision)}`;
}

/** Compute the bounding box of a GeoJSON polygon coordinate ring. */
export function polygonBounds(coords: number[][][]): BBox | null {
  if (!coords || !coords[0] || coords[0].length === 0) return null;
  let minLon = Infinity,
    minLat = Infinity,
    maxLon = -Infinity,
    maxLat = -Infinity;
  for (const ring of coords) {
    for (const [lon, lat] of ring) {
      if (lon < minLon) minLon = lon;
      if (lat < minLat) minLat = lat;
      if (lon > maxLon) maxLon = lon;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return { minLon, minLat, maxLon, maxLat };
}
