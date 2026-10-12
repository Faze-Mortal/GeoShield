'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import {
  wakeUpBackend,
  subscribeToWakeUp,
  getBackendState,
  type WakeUpState,
  type BackendStatus,
} from '@/services/healthService';
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

function TourHint() {
  const searchParams = useSearchParams();
  const isTour = searchParams.get('tour') === 'whatif';
  const [dismissed, setDismissed] = useState(false);

  if (!isTour || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute top-16 left-4 md:left-84 z-30 flex items-center gap-2.5 rounded border border-sky-400/60 bg-[#0d1527]/96 px-3 py-1.5 shadow-xl text-xs text-sky-200 backdrop-blur-xs max-w-md animate-in fade-in slide-in-from-top-1 duration-200"
    >
      <span className="h-2 w-2 rounded-full bg-sky-400 shrink-0" aria-hidden="true" />
      <span className="font-medium text-slate-100">
        Select a cell on the map, then try +10%, +20% or +30% rainfall.
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-auto rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
        aria-label="Dismiss tour tip"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const mapRef = useRef<GeoShieldMapHandle | null>(null);

  // API connectivity & cold-start wake-up state
  const [wakeUpState, setWakeUpState] = useState<WakeUpState>(() => getBackendState());
  const apiConnected = wakeUpState.status === 'connected';

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

  // Automatic cold-start wake-up on mount with lifecycle subscription
  useEffect(() => {
    const unsubscribe = subscribeToWakeUp((state) => {
      setWakeUpState(state);
    });

    wakeUpBackend();

    return () => {
      unsubscribe();
    };
  }, []);

  // Automatically continue loading the grid once backend becomes reachable
  const prevStatusRef = useRef<BackendStatus>(wakeUpState.status);
  useEffect(() => {
    if (wakeUpState.status === 'connected' && prevStatusRef.current !== 'connected') {
      if (mapStatus.cellCount <= 0) {
        mapRef.current?.refetchGrid();
      }
    }
    prevStatusRef.current = wakeUpState.status;
  }, [wakeUpState.status, mapStatus.cellCount]);

  // Manual retry handler — triggers same recovery flow without full-page reload
  const handleRetry = useCallback(() => {
    wakeUpBackend({ force: true });
  }, []);

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
    if (wakeUpState.status === 'unreachable') {
      wakeUpBackend({ force: true });
    }
    mapRef.current?.refetchGrid();
  }, [wakeUpState.status]);

  return (
    <ErrorBoundary>
      <div id="main-content" className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#090e17] font-sans text-slate-100 select-none">
        {/* Slim Operational Header Bar (h-11) */}
        <header className="z-20 flex h-11 w-full shrink-0 items-center justify-between border-b border-slate-800 bg-[#0d1527] px-3.5">
          {/* Brand & Region (Links to /) */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 group rounded px-1 -mx-1 py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 transition-colors"
              title="Return to GeoShield Home"
              aria-label="GeoShield Home"
            >
              <svg
                className="h-4 w-4 text-sky-400 group-hover:text-sky-300 transition-colors"
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
              <span className="text-xs font-bold tracking-wider text-white uppercase group-hover:text-sky-200 transition-colors">
                GeoShield
              </span>
            </Link>

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
                wakeUpState.status === 'connected'
                  ? `Connected to ${API_BASE_URL}`
                  : wakeUpState.status === 'waking'
                  ? `Connecting to GeoShield API (attempt ${wakeUpState.attempt}/${wakeUpState.maxAttempts})`
                  : wakeUpState.status === 'checking'
                  ? 'Connecting to GeoShield API...'
                  : `Cannot reach API at ${API_BASE_URL}`
              }
            >
              {wakeUpState.status === 'connected' ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-slate-400">Connected</span>
                </>
              ) : wakeUpState.status === 'checking' || wakeUpState.status === 'waking' ? (
                <>
                  <Spinner size="sm" className="text-sky-400" />
                  <span className="text-sky-300 font-medium">
                    {wakeUpState.status === 'waking' ? 'Waking API...' : 'Connecting API...'}
                  </span>
                </>
              ) : (
                <button
                  onClick={handleRetry}
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

        {/* Restrained Non-blocking Research Notice Bar */}
        <div
          role="region"
          aria-label="Research limitations notice"
          className="z-20 border-b border-slate-800/80 bg-[#0c1424]/95 px-3 py-1 text-[11px] text-slate-300 flex items-center justify-between gap-2 overflow-x-auto whitespace-nowrap shrink-0"
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
            <span className="truncate">
              Research tool, not an official warning. The Susceptibility Score is not a probability. Rainfall data is a snapshot as of 2026-09-12.
            </span>
            <Link
              href="/terms#limitations"
              className="text-sky-400 hover:text-sky-300 underline underline-offset-2 ml-1 shrink-0 font-medium focus-visible:outline-2 focus-visible:outline-sky-400 rounded"
            >
              Read limitations
            </Link>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-400 font-mono shrink-0 pl-2">
            <Link href="/privacy" className="hover:text-slate-200 transition-colors focus-visible:outline-1 focus-visible:outline-sky-400 rounded">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-200 transition-colors focus-visible:outline-1 focus-visible:outline-sky-400 rounded">
              Terms
            </Link>
          </div>
        </div>

        {/* Cold-start Non-alarming Status Banner */}
        {wakeUpState.status === 'waking' && (
          <div
            role="status"
            aria-live="polite"
            className="z-30 flex items-center justify-between border-b border-sky-500/30 bg-sky-950/90 px-3.5 py-1.5 text-xs text-sky-200"
          >
            <div className="flex items-center gap-2">
              <Spinner size="sm" className="text-sky-400 shrink-0" />
              <span>
                Connecting to GeoShield API… The free backend service spins down during inactivity and may take 20–45 seconds to wake up.
              </span>
            </div>
            <span className="font-mono text-[10px] text-sky-300/80 shrink-0 hidden sm:inline">
              Attempt {wakeUpState.attempt} of {wakeUpState.maxAttempts}
            </span>
          </div>
        )}

        {/* Global API Unreachable Banner (only when exhausted) */}
        {wakeUpState.status === 'unreachable' && (
          <div
            role="alert"
            className="z-30 flex items-center justify-between border-b border-red-500/30 bg-red-950/90 px-3.5 py-1.5 text-xs text-red-200"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" aria-hidden="true" />
              <span>
                GeoShield backend unreachable at{' '}
                <strong className="font-mono text-white">{API_BASE_URL}</strong>. The service may still be booting or temporarily offline.
              </span>
            </div>
            <button
              onClick={handleRetry}
              className="rounded bg-red-600/80 px-2.5 py-0.5 text-xs font-medium text-white hover:bg-red-500 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400 shrink-0"
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
            backendStatus={wakeUpState.status}
          />

          {/* Tour What-If Hint (if ?tour=whatif) */}
          <Suspense fallback={null}>
            <TourHint />
          </Suspense>

          {/* Floating Search Bar (top-left) */}
          <SearchBar
            onSearch={handleSearch}
            searching={searching}
            error={searchError}
            disabled={!apiConnected}
          />

          {/* Floating Legend (bottom-left) */}
          <MapLegend />

          {/* Status Overlay (loading, zoom hint, truncation, errors) */}
          <MapStatusOverlay
            status={mapStatus}
            onRetry={handleRetryGrid}
            onZoomIn={handleZoomIn}
            backendStatus={wakeUpState.status}
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
            apiDisabled={!apiConnected}
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
