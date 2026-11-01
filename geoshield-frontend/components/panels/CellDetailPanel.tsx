'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { PredictResponse, SimulateResponse } from '@/types/api';
import { getRiskStyle } from '@/lib/risk';
import { Skeleton, ErrorNotice } from '@/components/ui';
import SimulationPanel from './SimulationPanel';

interface CellDetailPanelProps {
  cellId: string | null;
  predictData: PredictResponse | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
  onOpenMethodology: () => void;
  onSimulationChange?: (sim: SimulateResponse | null) => void;
  apiDisabled?: boolean;
}

export default function CellDetailPanel({
  cellId,
  predictData,
  loading,
  error,
  onClose,
  onRetry,
  onOpenMethodology,
  onSimulationChange,
  apiDisabled = false,
}: CellDetailPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const prevExpandedRef = useRef(isMobileExpanded);

  // Restore focus to toggle button when collapsing from expanded mode
  useEffect(() => {
    if (prevExpandedRef.current && !isMobileExpanded) {
      toggleBtnRef.current?.focus();
    }
    prevExpandedRef.current = isMobileExpanded;
  }, [isMobileExpanded]);

  // Keyboard navigation: Escape shortcut to collapse expanded sheet or close peek view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileExpanded) {
          e.preventDefault();
          setIsMobileExpanded(false);
        } else {
          e.preventDefault();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileExpanded, onClose]);

  if (!cellId) return null;

  const handleCopyId = () => {
    if (!cellId) return;
    navigator.clipboard.writeText(cellId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const riskStyle = predictData ? getRiskStyle(predictData.current_risk) : null;

  return (
    <aside
      ref={panelRef}
      className={`fixed inset-x-0 bottom-0 z-30 transition-all duration-200 border-t border-slate-700/80 bg-[#0d1527]/98 shadow-2xl backdrop-blur-xl md:absolute md:inset-y-0 md:right-0 md:left-auto md:w-[360px] md:max-h-none md:border-l md:border-t-0 font-sans pb-[calc(1rem+env(safe-area-inset-bottom,0px))] flex flex-col ${
        isMobileExpanded ? 'max-h-[82dvh]' : 'max-h-[220px]'
      }`}
      role="region"
      aria-label="Cell details and simulation panel"
    >
      {/* Pinned Top Header: Drag Handle, Cell ID & Controls */}
      <div className="shrink-0 p-3.5 pb-2.5 sm:p-4 sm:pb-2.5 border-b border-slate-800 bg-[#0d1527]">
        {/* Mobile drag handle / expand indicator */}
        <div className="flex justify-center -mt-1 mb-2 md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="h-1.5 w-10 rounded-full bg-slate-600/80 hover:bg-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            aria-label={isMobileExpanded ? 'Collapse panel to peek view' : 'Expand panel to full view'}
            aria-expanded={isMobileExpanded}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              CELL
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-slate-100">{cellId}</span>
            <button
              onClick={handleCopyId}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded px-2 py-1 text-xs text-slate-300 hover:text-sky-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 transition-colors"
              title="Copy Cell ID"
              aria-label="Copy Cell ID"
            >
              {copied ? (
                <span className="text-emerald-400 font-semibold text-[11px]">Copied</span>
              ) : (
                <span className="text-[11px]">Copy</span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Mobile expand/collapse toggle button */}
            <button
              ref={toggleBtnRef}
              type="button"
              onClick={() => setIsMobileExpanded(!isMobileExpanded)}
              className="min-h-[44px] px-2.5 py-1 text-xs font-medium text-sky-400 hover:text-sky-300 hover:bg-slate-800/80 rounded inline-flex items-center gap-1 md:hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 transition-colors"
              aria-label={isMobileExpanded ? 'Collapse details' : 'Expand details and simulation'}
              aria-expanded={isMobileExpanded}
            >
              <span>{isMobileExpanded ? 'Collapse' : 'Details & Sim'}</span>
              <span aria-hidden="true">{isMobileExpanded ? '▼' : '▲'}</span>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded p-2 text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 transition-colors"
              aria-label="Close panel"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-2">
        {/* Loading Skeleton */}
        {loading && (
          <div className="mt-2 space-y-3">
            <Skeleton className="h-16 w-full rounded" />
            <Skeleton className="h-24 w-full rounded" />
            <Skeleton className="h-20 w-full rounded" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mt-2">
            <ErrorNotice
              message={
                error.toLowerCase().includes('not found') || error.includes('404')
                  ? `Cell '${cellId}' not found in the GeoShield grid database.`
                  : error
              }
              onRetry={onRetry}
            />
          </div>
        )}

        {/* Data display */}
        {predictData && !loading && (
          <div className="mt-2 space-y-3.5 text-slate-200">
            {/* Section 1: Current Risk (Hero value) */}
            <div className="rounded border border-slate-700/70 bg-slate-850/50 p-2.5 sm:p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Current Risk
                </span>
                <button
                  onClick={onOpenMethodology}
                  className="min-h-[44px] inline-flex items-center text-xs text-sky-400 hover:text-sky-300 hover:underline px-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
                >
                  Matrix &rarr;
                </button>
              </div>

              <div className="mt-1 sm:mt-2 flex items-center gap-3">
                <span
                  className="inline-block px-3 py-1 rounded text-base font-bold tracking-wide"
                  style={{
                    backgroundColor: riskStyle?.color,
                    color: ['Low-Moderate', 'Moderate', 'Elevated'].includes(predictData.current_risk)
                      ? '#0f172a'
                      : '#ffffff',
                  }}
                >
                  {predictData.current_risk}
                </span>
                <span className="text-xs text-slate-300">
                  Susceptibility &times; Trigger
                </span>
              </div>
            </div>

            {/* Sections below are visible when expanded on mobile, or always on desktop */}
            <div className={`${isMobileExpanded ? 'block' : 'hidden md:block'} space-y-3.5`}>
              {/* Section 2: Component Scores (Flat label/value rows) */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Component Scores
                </span>

                {/* Susceptibility Score row */}
                <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Susceptibility Score</span>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-sm font-bold text-slate-100">
                      {predictData.susceptibility_score.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-slate-400">/ 100</span>
                    <span className="ml-1 text-[10px] text-slate-400">
                      ({predictData.susceptibility_bin})
                    </span>
                  </div>
                </div>

                {/* Static note */}
                <p className="text-[10px] text-slate-400 italic">
                  Static terrain, geology, and history score — not a probability
                </p>

                {/* Trigger State row */}
                <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Trigger State</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {predictData.trigger_state}
                  </span>
                </div>
              </div>

              {/* Section 3: Rainfall Source & Observation Metadata */}
              <div className="space-y-1.5 border-t border-slate-800 pt-3 text-[11px] text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Observation Data
                </span>
                <div className="flex items-center justify-between">
                  <span>Rainfall Station:</span>
                  <span className="font-mono text-slate-300">
                    {predictData.rainfall_location_id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Snapshot Date:</span>
                  <span className="font-mono text-slate-300">
                    {predictData.rainfall_date}
                  </span>
                </div>
              </div>

              {/* Section 4: Simulation Module */}
              <SimulationPanel
                cellId={predictData.cell_id}
                staticSusceptibilityScore={predictData.susceptibility_score}
                onSimulationChange={onSimulationChange}
                disabled={apiDisabled}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
