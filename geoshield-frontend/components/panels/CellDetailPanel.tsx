'use client';

import React, { useState } from 'react';
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
}: CellDetailPanelProps) {
  const [copied, setCopied] = useState(false);

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
      className="fixed inset-x-0 bottom-0 z-30 max-h-[85vh] overflow-y-auto border-t border-slate-700/80 bg-[#0d1527]/98 p-4 shadow-2xl backdrop-blur-xl md:absolute md:inset-y-0 md:right-0 md:left-auto md:w-[360px] md:max-h-none md:border-l md:border-t-0 animate-in slide-in-from-right duration-150 font-sans"
      role="region"
      aria-label="Cell details panel"
    >
      {/* Top Header: Cell ID & Close */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            CELL
          </span>
          <span className="font-mono text-xs font-bold text-slate-100">{cellId}</span>
          <button
            onClick={handleCopyId}
            className="rounded px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors"
            title="Copy Cell ID"
            aria-label="Copy Cell ID"
          >
            {copied ? (
              <span className="text-emerald-400 font-semibold">Copied</span>
            ) : (
              <span>Copy</span>
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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

      {/* Loading Skeleton */}
      {loading && (
        <div className="mt-4 space-y-3">
          <Skeleton className="h-16 w-full rounded" />
          <Skeleton className="h-24 w-full rounded" />
          <Skeleton className="h-20 w-full rounded" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mt-3">
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

      {/* Data display (single flat panel with dividers) */}
      {predictData && !loading && (
        <div className="mt-3 space-y-3.5 text-slate-200">
          {/* Section 1: Current Risk (Hero value) */}
          <div className="rounded border border-slate-700/70 bg-slate-850/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current Risk
              </span>
              <button
                onClick={onOpenMethodology}
                className="text-[11px] text-sky-400 hover:text-sky-300 hover:underline"
              >
                Matrix &rarr;
              </button>
            </div>

            <div className="mt-2 flex items-center gap-3">
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
          />
        </div>
      )}
    </aside>
  );
}
