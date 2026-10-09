'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

import { checkHealth } from '@/services/healthService';
import { getPrediction } from '@/services/predictService';
import { getCellGeometry } from '@/services/gridService';
import { API_BASE_URL } from '@/lib/config';
import { polygonBounds } from '@/lib/geo';
import { IS_MOCK_ENABLED } from '@/mocks/mockAdapter';

import type { MapStatus, GeoShieldMapHandle } from '@/components/map/GeoShieldMap';
import type { GridFeature } from '@/types/api';

import { useCellSelection } from '@/hooks/useCellSelection';
import { useSimulation } from '@/hooks/useSimulation';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Spinner } from '@/components/ui';
import SearchBar from '@/components/panels/SearchBar';
import MapLegend from '@/components/map/MapLegend';
import MapStatusOverlay from '@/components/map/MapStatusOverlay';
import CellDetailPanel from '@/components/panels/CellDetailPanel';
import MethodologyModal from '@/components/panels/MethodologyModal';

// Dynamically import GeoShieldMap with ssr: false
const GeoShieldMap = dynamic(() => import('@/components/map/GeoShieldMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#090e17]">
      <div className="flex items-center gap-2.5 text-slate-300">
        <Spinner size="sm" className="text-sky-400" />
        <span className="text-xs font-medium">Initializing GeoShield basemap...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  const mapRef = useRef<GeoShieldMapHandle | null>(null);

  // API connectivity status
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [checkingApi, setCheckingApi] = useState(true);

  // Methodology modal
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  // Search state
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Map status
  const [mapStatus, setMapStatus] = useState<MapStatus>({
    zoom: 11,
    cellCount: 0,
    loading: true,
    truncated: false,
    error: null,
    belowMinZoom: false,
  });

  // Cell selection hook
  const {
    selectedCellId,
    selectedCellFeature,
    predictData,
    loadingPredict,
    predictError,
    selectCell,
    clearSelection,
    retryPredict,
    setSelectedCellFeature,
  } = useCellSelection();

  // Simulation hook
  const {
    simulatedRiskColor,
    handleSimulationChange,
    resetSimulation,
  } = useSimulation();

  // Initial health check
  const runHealthCheck = useCallback(async () => {
    setCheckingApi(true);
    const healthy = await checkHealth();
    setApiConnected(healthy);
    setCheckingApi(false);
  }, []);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  // Handle cell click on the map
  const handleCellClick = useCallback(
    (cellId: string, feature?: GridFeature) => {
      resetSimulation();
      setSearchError(null);
      selectCell(cellId, feature);
    },
    [selectCell, resetSimulation],
  );

  // Handle cell search
  const handleSearch = useCallback(
    async (cellId: string) => {
      const normalized = cellId.trim().toLowerCase();
      if (!normalized) return;

      setSearching(true);
      setSearchError(null);

      try {
        // Step 1: verify cell with /predict
        await getPrediction(normalized);

        // Step 2: fetch polygon geometry to zoom and highlight
        const feat = await getCellGeometry(normalized);

        // Reset simulation on new selection
        resetSimulation();

        if (feat && feat.geometry && feat.geometry.coordinates) {
          setSelectedCellFeature(feat);
          const bounds = polygonBounds(feat.geometry.coordinates as number[][][]);
          if (bounds) {
            mapRef.current?.flyToBounds(bounds);
          }
        }

        // Step 3: select the cell and populate panel
        await selectCell(normalized, feat);
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : 'Cell lookup failed';
        if (
          errorMsg.toLowerCase().includes('not found') ||
          errorMsg.includes('404')
        ) {
          setSearchError(
            `No cell with ID '${normalized}' found. Cell IDs look like r0142_c0087.`,
          );
        } else {
          setSearchError(`Lookup error: ${errorMsg}`);
        }
      } finally {
        setSearching(false);
      }
    },
    [selectCell, resetSimulation, setSelectedCellFeature],
  );

  // Zoom in action
  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomInToGrid();
  }, []);

  // Refetch action
  const handleRetryGrid = useCallback(() => {
    mapRef.current?.refetchGrid();
  }, []);

  return (
    <ErrorBoundary>
      <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#090e17] font-sans text-slate-100 select-none">
        {/* Slim Operational Header Bar (h-11) */}
        <header className="z-20 flex h-11 w-full shrink-0 items-center justify-between border-b border-slate-800 bg-[#0d1527] px-3.5">
          {/* Brand & Region */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-sky-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <h1 className="text-xs font-bold tracking-wider text-white uppercase">GeoShield</h1>
            </div>

            <div className="h-3 w-px bg-slate-800" />

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>Kullu &middot; Mandi, HP</span>
              <span className="font-mono text-[10px] text-slate-500">[500m Grid]</span>
              {IS_MOCK_ENABLED && (
                <span className="rounded border border-amber-500/40 bg-amber-500/10 px-1 py-0.2 text-[9px] font-bold text-amber-300">
                  MOCK
                </span>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* API Status */}
            <div
              className="flex items-center gap-1.5 text-[11px]"
              title={
                apiConnected
                  ? `Connected to ${API_BASE_URL}`
                  : `Cannot reach API at ${API_BASE_URL}`
              }
            >
              {checkingApi ? (
                <>
                  <Spinner size="sm" className="text-slate-400" />
                  <span className="text-slate-400">API...</span>
                </>
              ) : apiConnected ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-slate-400">Connected</span>
                </>
              ) : (
                <button
                  onClick={runHealthCheck}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  <span>Unreachable (Retry)</span>
                </button>
              )}
            </div>

            {/* Methodology button */}
            <button
              onClick={() => setMethodologyOpen(true)}
              className="rounded border border-slate-700/80 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Methodology
            </button>
          </div>
        </header>

        {/* Global API Unreachable Banner (non-blocking) */}
        {apiConnected === false && !checkingApi && (
          <div className="z-30 flex items-center justify-between border-b border-red-500/30 bg-red-950/90 px-3 py-1.5 text-xs text-red-200">
            <span>
              GeoShield backend unreachable at{' '}
              <strong className="font-mono text-white">{API_BASE_URL}</strong>.
            </span>
            <button
              onClick={runHealthCheck}
              className="rounded bg-red-600/80 px-2 py-0.5 font-medium text-white hover:bg-red-500 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Viewport: Map fills edge-to-edge */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          {/* Map Surface */}
          <GeoShieldMap
            ref={mapRef}
            onCellClick={handleCellClick}
            onStatusChange={setMapStatus}
            selectedCellId={selectedCellId}
            selectedCellFeature={selectedCellFeature}
            simulatedRiskColor={simulatedRiskColor}
          />

          {/* Floating Search Bar (top-left) */}
          <SearchBar
            onSearch={handleSearch}
            searching={searching}
            error={searchError}
          />

          {/* Floating Legend (bottom-left) */}
          <MapLegend />

          {/* Status Overlay (loading, zoom hint, truncation, errors) */}
          <MapStatusOverlay
            status={mapStatus}
            onRetry={handleRetryGrid}
            onZoomIn={handleZoomIn}
          />

          {/* Right-side Detail & Simulation Panel (docked right, max 360px) */}
          <CellDetailPanel
            cellId={selectedCellId}
            predictData={predictData}
            loading={loadingPredict}
            error={predictError}
            onClose={clearSelection}
            onRetry={retryPredict}
            onOpenMethodology={() => setMethodologyOpen(true)}
            onSimulationChange={handleSimulationChange}
          />
        </div>

        {/* Methodology Modal */}
        <MethodologyModal
          isOpen={methodologyOpen}
          onClose={() => setMethodologyOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}
