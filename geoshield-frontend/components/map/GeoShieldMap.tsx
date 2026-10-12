'use client';

import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import {
  MAP_STYLE_URL,
  MAP_CENTER,
  MAP_INITIAL_ZOOM,
  MIN_GRID_ZOOM,
  DATA_BBOX,
  GRID_DEBOUNCE_MS,
  GRID_FETCH_LIMIT,
  BBOX_PAD_FACTOR,
} from '@/lib/config';
import { riskMatchExpression } from '@/lib/risk';
import { padBBox, bboxContains, bboxKey, type BBox } from '@/lib/geo';
import { getGrid } from '@/services/gridService';
import type { BackendStatus } from '@/services/healthService';
import type { GridResponse, GridFeature } from '@/types/api';

// ---- Layer/source IDs -----------------------------------------------------
const SRC_GRID = 'geoshield-grid';
const SRC_HIGHLIGHT = 'geoshield-highlight';
const LYR_FILL = 'grid-fill';
const LYR_LINE = 'grid-line';
const LYR_HOVER = 'grid-hover';
const LYR_HIGHLIGHT_LINE = 'grid-highlight-line';
const LYR_HIGHLIGHT_FILL = 'grid-highlight-fill';

function createEmptyFC(): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features: [] };
}

function toPlainGeoJSONFeature(feat: GeoJSON.Feature | GridFeature): GeoJSON.Feature {
  return {
    type: 'Feature',
    geometry: feat.geometry
      ? (JSON.parse(JSON.stringify(feat.geometry)) as GeoJSON.Geometry)
      : { type: 'Polygon', coordinates: [] },
    properties: { ...(feat.properties ?? {}) },
  };
}

// ---- Status & Handle ------------------------------------------------------
export interface MapStatus {
  zoom: number;
  cellCount: number;
  loading: boolean;
  truncated: boolean;
  error: string | null;
  belowMinZoom: boolean;
}

export interface GeoShieldMapHandle {
  flyToBounds: (bounds: BBox) => void;
  zoomInToGrid: () => void;
  refetchGrid: () => void;
}

interface GeoShieldMapProps {
  onCellClick: (cellId: string, feature?: GridFeature) => void;
  onStatusChange: (status: MapStatus) => void;
  selectedCellId: string | null;
  selectedCellFeature: GridFeature | null;
  simulatedRiskColor?: string | null;
  backendStatus?: BackendStatus;
}

const GeoShieldMap = forwardRef<GeoShieldMapHandle, GeoShieldMapProps>(function GeoShieldMap(
  {
    onCellClick,
    onStatusChange,
    selectedCellId,
    selectedCellFeature,
    simulatedRiskColor,
    backendStatus,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedBBoxRef = useRef<BBox | null>(null);
  const seqRef = useRef(0);
  const hoveredIdRef = useRef<string | null>(null);
  const lastCellCountRef = useRef<number>(0);
  const backendStatusRef = useRef<BackendStatus | undefined>(backendStatus);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    backendStatusRef.current = backendStatus;
  }, [backendStatus]);

  // Small bounded LRU cache (keyed by rounded bbox)
  const cacheRef = useRef<Map<string, GridResponse>>(new Map());
  const CACHE_MAX = 6;

  // -- Fetch grid for viewport --
  const fetchGrid = useCallback(
    async (map: maplibregl.Map) => {
      const zoom = map.getZoom();
      if (zoom < MIN_GRID_ZOOM) {
        // Clear grid, signal below-min-zoom
        const src = map.getSource(SRC_GRID) as maplibregl.GeoJSONSource | undefined;
        if (src) src.setData(createEmptyFC());
        loadedBBoxRef.current = null;
        lastCellCountRef.current = 0;
        onStatusChange({
          zoom: Math.round(zoom * 10) / 10,
          cellCount: 0,
          loading: false,
          truncated: false,
          error: null,
          belowMinZoom: true,
        });
        return;
      }

      const bounds = map.getBounds();
      const viewBBox: BBox = {
        minLon: bounds.getWest(),
        minLat: bounds.getSouth(),
        maxLon: bounds.getEast(),
        maxLat: bounds.getNorth(),
      };

      // Containment check
      if (loadedBBoxRef.current && bboxContains(loadedBBoxRef.current, viewBBox)) {
        onStatusChange({
          zoom: Math.round(zoom * 10) / 10,
          cellCount: lastCellCountRef.current,
          loading: false,
          truncated: false,
          error: null,
          belowMinZoom: false,
        });
        return;
      }

      // Abort any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const seq = ++seqRef.current;

      onStatusChange({
        zoom: Math.round(zoom * 10) / 10,
        cellCount: -1, // signal loading
        loading: true,
        truncated: false,
        error: null,
        belowMinZoom: false,
      });

      const paddedBBox = padBBox(viewBBox, BBOX_PAD_FACTOR);
      const key = bboxKey(paddedBBox);

      // Check cache
      const cached = cacheRef.current.get(key);
      if (cached) {
        if (seq !== seqRef.current) return;
        applyGridData(map, cached, paddedBBox, zoom);
        return;
      }

      try {
        let data = await getGrid({ bbox: paddedBBox, limit: GRID_FETCH_LIMIT, signal: controller.signal });
        if (seq !== seqRef.current) return;

        let truncated = data.count === data.limit;

        // If truncated, retry with exact viewport bbox
        if (truncated) {
          data = await getGrid({ bbox: viewBBox, limit: GRID_FETCH_LIMIT, signal: controller.signal });
          if (seq !== seqRef.current) return;
          truncated = data.count === data.limit;
        }

        // Cache
        if (cacheRef.current.size >= CACHE_MAX) {
          const firstKey = cacheRef.current.keys().next().value;
          if (firstKey !== undefined) cacheRef.current.delete(firstKey);
        }
        cacheRef.current.set(key, data);

        applyGridData(map, data, truncated ? viewBBox : paddedBBox, zoom, truncated);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (seq !== seqRef.current) return;

        // If backend is waking up or checking, keep calm loading state instead of alarming error
        if (backendStatusRef.current === 'waking' || backendStatusRef.current === 'checking') {
          onStatusChange({
            zoom: Math.round(zoom * 10) / 10,
            cellCount: 0,
            loading: true,
            truncated: false,
            error: null,
            belowMinZoom: false,
          });
          return;
        }

        // If connected but failed transiently, try one safe retry after brief backoff
        try {
          await new Promise<void>((resolve) => {
            let timer: ReturnType<typeof setTimeout>;
            const onAbort = () => {
              clearTimeout(timer);
              resolve();
            };
            timer = setTimeout(() => {
              controller.signal.removeEventListener('abort', onAbort);
              resolve();
            }, 1500);
            controller.signal.addEventListener('abort', onAbort, { once: true });
          });
          if (seq !== seqRef.current || controller.signal.aborted) return;
          const retryData = await getGrid({ bbox: paddedBBox, limit: GRID_FETCH_LIMIT, signal: controller.signal });
          if (seq !== seqRef.current) return;
          applyGridData(map, retryData, paddedBBox, zoom, false);
          return;
        } catch {
          // Both initial attempt and safe retry failed
        }

        if (seq !== seqRef.current) return;
        onStatusChange({
          zoom: Math.round(zoom * 10) / 10,
          cellCount: 0,
          loading: false,
          truncated: false,
          error: err instanceof Error ? err.message : 'Failed to load grid',
          belowMinZoom: false,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onStatusChange],
  );

  const applyGridData = useCallback(
    (map: maplibregl.Map, data: GridResponse, bbox: BBox, zoom: number, truncated = false) => {
      // Filter out null geometries
      const validFeatures = data.features.filter((f) => f.geometry !== null);
      const fc: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: validFeatures as unknown as GeoJSON.Feature[],
      };
      const src = map.getSource(SRC_GRID) as maplibregl.GeoJSONSource | undefined;
      if (src) src.setData(fc);
      loadedBBoxRef.current = bbox;
      lastCellCountRef.current = validFeatures.length;
      onStatusChange({
        zoom: Math.round(zoom * 10) / 10,
        cellCount: validFeatures.length,
        loading: false,
        truncated,
        error: null,
        belowMinZoom: false,
      });
    },
    [onStatusChange],
  );

  // Expose imperative methods to parent via ref
  useImperativeHandle(
    ref,
    () => ({
      flyToBounds: (bounds: BBox) => {
        if (!mapRef.current) return;
        mapRef.current.fitBounds(
          [
            [bounds.minLon, bounds.minLat],
            [bounds.maxLon, bounds.maxLat],
          ],
          { padding: 180, maxZoom: 14.5, duration: 1200 },
        );
      },
      zoomInToGrid: () => {
        if (!mapRef.current) return;
        mapRef.current.flyTo({
          zoom: Math.max(MIN_GRID_ZOOM, mapRef.current.getZoom() + 2),
          duration: 900,
        });
      },
      refetchGrid: () => {
        if (!mapRef.current) return;
        loadedBBoxRef.current = null;
        fetchGrid(mapRef.current);
      },
    }),
    [fetchGrid],
  );

  // -- Initialize map -------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Explicitly configure worker URL to serve from public/
    maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: MAP_CENTER,
      zoom: MAP_INITIAL_ZOOM,
      maxBounds: [
        [DATA_BBOX.minLon - 1, DATA_BBOX.minLat - 1],
        [DATA_BBOX.maxLon + 1, DATA_BBOX.maxLat + 1],
      ],
      attributionControl: { compact: false },
    });

    if (typeof window !== 'undefined') {
      (window as unknown as { _geoshieldMap?: maplibregl.Map })._geoshieldMap = map;
    }

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 150 }), 'bottom-right');

    map.on('error', (e) => {
      const msg = e.error?.message ?? (typeof e.error === 'string' ? e.error : String(e));
      // Ignore benign aborted requests from rapid user navigation/zoom
      if (
        msg.includes('abort') ||
        msg.includes('canceled') ||
        msg.includes('cancelled') ||
        (e as { status?: number }).status === 0
      ) {
        return;
      }

      console.error('[MAP ERROR EVENT]', msg);

      if (
        msg.toLowerCase().includes('style') ||
        (e as { dataType?: string }).dataType === 'style'
      ) {
        setMapError('Failed to load basemap style. The grid layer will still be attempted.');
      }
    });

    map.on('load', () => {
      setMapError(null);

      // Grid source + layers
      map.addSource(SRC_GRID, { type: 'geojson', data: createEmptyFC() });
      map.addSource(SRC_HIGHLIGHT, { type: 'geojson', data: createEmptyFC() });

      // Fill layer — colored by current_risk
      map.addLayer({
        id: LYR_FILL,
        type: 'fill',
        source: SRC_GRID,
        paint: {
          'fill-color': riskMatchExpression() as unknown as maplibregl.ExpressionSpecification,
          'fill-opacity': 0.58,
        },
      });

      // Line layer — subtle cell outlines
      map.addLayer({
        id: LYR_LINE,
        type: 'line',
        source: SRC_GRID,
        paint: {
          'line-color': '#475569',
          'line-width': 0.25,
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0.08, 13, 0.25],
        },
      });

      // Hover outline
      map.addLayer({
        id: LYR_HOVER,
        type: 'line',
        source: SRC_GRID,
        paint: {
          'line-color': '#cbd5e1',
          'line-width': 1.5,
          'line-opacity': 0.7,
        },
        filter: ['==', ['get', 'cell_id'], ''],
      });

      // Highlight fill (selected cell)
      map.addLayer({
        id: LYR_HIGHLIGHT_FILL,
        type: 'fill',
        source: SRC_HIGHLIGHT,
        paint: {
          'fill-color': '#38bdf8',
          'fill-opacity': 0.15,
        },
      });

      // Highlight outline (selected cell, crisp 2px line)
      map.addLayer({
        id: LYR_HIGHLIGHT_LINE,
        type: 'line',
        source: SRC_HIGHLIGHT,
        paint: {
          'line-color': '#38bdf8',
          'line-width': 2,
          'line-opacity': 1,
        },
      });

      // Pointer cursor on cells
      map.on('mouseenter', LYR_FILL, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', LYR_FILL, () => {
        map.getCanvas().style.cursor = '';
        if (hoveredIdRef.current) {
          map.setFilter(LYR_HOVER, ['==', ['get', 'cell_id'], '']);
          hoveredIdRef.current = null;
        }
      });

      // Hover highlight
      map.on('mousemove', LYR_FILL, (e) => {
        if (e.features && e.features.length > 0) {
          const cid = e.features[0].properties?.cell_id;
          if (cid && cid !== hoveredIdRef.current) {
            hoveredIdRef.current = cid;
            map.setFilter(LYR_HOVER, ['==', ['get', 'cell_id'], cid]);
          }
        }
      });

      // Click — sanitize MapGeoJSONFeature to plain GeoJSON to prevent worker serialization error
      map.on('click', LYR_FILL, (e) => {
        if (e.features && e.features.length > 0) {
          const feat = e.features[0];
          const cid = feat.properties?.cell_id;
          if (cid) {
            const plainFeature: GridFeature = {
              type: 'Feature',
              geometry: feat.geometry
                ? (JSON.parse(JSON.stringify(feat.geometry)) as GeoJSON.Polygon)
                : null,
              properties: { ...(feat.properties ?? {}) } as GridFeature['properties'],
            };
            onCellClick(cid, plainFeature);
          }
        }
      });

      // Debounced grid fetch on moveend
      const handleMoveEnd = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchGrid(map), GRID_DEBOUNCE_MS);
      };
      map.on('moveend', handleMoveEnd);

      // Initial fetch
      fetchGrid(map);
    });

    mapRef.current = map;

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (typeof window !== 'undefined') {
        delete (window as unknown as { _geoshieldMap?: maplibregl.Map })._geoshieldMap;
      }
      if (abortRef.current) abortRef.current.abort();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -- Update highlight source when selectedCellFeature changes --
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const src = map.getSource(SRC_HIGHLIGHT) as maplibregl.GeoJSONSource | undefined;
    if (!src) return;

    if (selectedCellFeature && selectedCellFeature.geometry) {
      src.setData({
        type: 'FeatureCollection',
        features: [toPlainGeoJSONFeature(selectedCellFeature)],
      });
    } else {
      src.setData(createEmptyFC());
    }
  }, [selectedCellFeature]);

  // -- Update highlight color for simulation --
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const color = simulatedRiskColor ?? '#38bdf8';
    map.setPaintProperty(LYR_HIGHLIGHT_LINE, 'line-color', color);
    map.setPaintProperty(LYR_HIGHLIGHT_FILL, 'fill-color', color);
  }, [simulatedRiskColor]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {mapError && (
        <div className="absolute inset-x-0 top-4 z-20 mx-auto max-w-md rounded-lg border border-amber-500/40 bg-slate-900/90 px-4 py-3 text-center text-sm text-amber-300 backdrop-blur-sm">
          {mapError}
        </div>
      )}
    </div>
  );
});

export default GeoShieldMap;
