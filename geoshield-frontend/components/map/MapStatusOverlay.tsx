'use client';

import React from 'react';
import { Spinner, ErrorNotice } from '@/components/ui';
import { MIN_GRID_ZOOM } from '@/lib/config';
import type { MapStatus } from './GeoShieldMap';

interface Props {
  status: MapStatus;
  onRetry: () => void;
  onZoomIn: () => void;
}

export default function MapStatusOverlay({ status, onRetry, onZoomIn }: Props) {
  // Below min zoom hint
  if (status.belowMinZoom) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none font-sans">
        <div className="pointer-events-auto rounded border border-slate-700/80 bg-[#0d1527]/95 px-5 py-3.5 text-center backdrop-blur-md shadow-xl max-w-sm mx-4">
          <p className="text-xs font-semibold text-slate-200">
            Zoom in to view the 500m risk grid
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Active view requires zoom level &ge; {MIN_GRID_ZOOM}
          </p>
          <button
            onClick={onZoomIn}
            className="mt-2.5 rounded bg-sky-600 px-3 py-1 text-xs font-medium text-white hover:bg-sky-500 transition-colors"
          >
            Zoom to Grid
          </button>
        </div>
      </div>
    );
  }

  // Error banner
  if (status.error) {
    return (
      <div className="absolute top-4 inset-x-4 z-10 mx-auto max-w-md">
        <ErrorNotice message={status.error} onRetry={onRetry} />
      </div>
    );
  }

  // No cells in view (zoom is sufficient)
  if (!status.loading && status.cellCount === 0) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none font-sans">
        <div className="rounded border border-slate-700/80 bg-[#0d1527]/95 px-5 py-3 text-center backdrop-blur-md max-w-xs mx-4">
          <p className="text-xs font-medium text-slate-300">No grid cells in view</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Pan towards Kullu or Mandi district</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Loading indicator */}
      {status.loading && (
        <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 font-sans">
          <div className="flex items-center gap-2 rounded border border-slate-700/80 bg-[#0d1527]/95 px-3 py-1 text-xs text-slate-300 backdrop-blur-md shadow-md">
            <Spinner size="sm" className="text-sky-400" />
            <span className="font-medium">Loading grid...</span>
          </div>
        </div>
      )}

      {/* Truncation warning */}
      {status.truncated && (
        <div className="absolute top-4 inset-x-4 z-10 mx-auto max-w-md font-sans">
          <div className="rounded border border-amber-500/40 bg-[#0d1527]/95 px-3 py-1.5 text-center text-xs text-amber-300 backdrop-blur-md">
            Showing first 10,000 cells in view — zoom in for full coverage
          </div>
        </div>
      )}

      {/* Cell count + zoom chip */}
      <div className="absolute bottom-6 right-4 z-10 font-mono">
        <div className="rounded border border-slate-700/70 bg-[#0d1527]/95 px-2.5 py-1 text-[11px] text-slate-300 backdrop-blur-md flex items-center gap-2">
          {status.cellCount > 0 && (
            <span className="font-semibold text-slate-200">{status.cellCount.toLocaleString()} cells</span>
          )}
          <span className="text-slate-400">z{status.zoom.toFixed(1)}</span>
        </div>
      </div>
    </>
  );
}
