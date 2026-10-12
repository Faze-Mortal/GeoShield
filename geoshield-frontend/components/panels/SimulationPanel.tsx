'use client';

import React, { useState } from 'react';
import { runSimulation } from '@/services/simulateService';
import type { SimulateResponse } from '@/types/api';
import { getRiskStyle } from '@/lib/risk';
import { Spinner, ErrorNotice } from '@/components/ui';

interface SimulationPanelProps {
  cellId: string;
  staticSusceptibilityScore: number;
  onSimulationChange?: (sim: SimulateResponse | null) => void;
  disabled?: boolean;
}

export default function SimulationPanel({
  cellId,
  staticSusceptibilityScore,
  onSimulationChange,
  disabled = false,
}: SimulationPanelProps) {
  const [activePercent, setActivePercent] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<SimulateResponse | null>(null);

  const handleSimulate = async (percent: number) => {
    if (loading || disabled) return;
    setLoading(true);
    setError(null);
    setActivePercent(percent);

    try {
      const data = await runSimulation({
        cell_id: cellId,
        rainfall_adjustment_percent: percent,
      });
      setSimResult(data);
      onSimulationChange?.(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Simulation failed';
      setError(msg);
      setSimResult(null);
      onSimulationChange?.(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (disabled) return;
    setActivePercent(null);
    setSimResult(null);
    setError(null);
    onSimulationChange?.(null);
  };

  const nConditions =
    simResult?.rainfall_trigger &&
    typeof (simResult.rainfall_trigger as Record<string, unknown>).n_conditions_exceeded === 'number'
      ? ((simResult.rainfall_trigger as Record<string, unknown>).n_conditions_exceeded as number)
      : null;

  const riskChanged =
    simResult && simResult.simulated_current_risk !== simResult.original_current_risk;
  const triggerChanged =
    simResult && simResult.simulated_trigger_state !== simResult.original_trigger_state;

  return (
    <div className="pt-3 border-t border-slate-800 font-sans">
      {/* Calm Section Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            SIMULATION / WHAT-IF
          </h3>
        </div>
        <span className="text-[10px] text-slate-500 font-medium">
          Acute rainfall stress scenario
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-normal">
        Evaluate how acute rainfall increase alters the empirical trigger state and resulting Current Risk.
      </p>

      {/* Segmented Control Buttons */}
      <div className="mt-2.5 flex items-center gap-1.5">
        {[10, 20, 30].map((pct) => (
          <button
            key={pct}
            onClick={() => handleSimulate(pct)}
            disabled={loading || disabled}
            title={disabled ? 'API connecting...' : undefined}
            className={`flex-1 rounded py-1 text-xs font-semibold transition-colors ${
              activePercent === pct
                ? 'bg-sky-600 text-white border border-sky-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/70'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            +{pct}%
          </button>
        ))}
        {activePercent !== null && (
          <button
            onClick={handleReset}
            disabled={loading || disabled}
            className="rounded px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-700/60 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="my-3 flex items-center justify-center gap-2 py-2 text-xs text-sky-400">
          <Spinner size="sm" className="text-sky-400" />
          <span>Computing trigger scenario...</span>
        </div>
      )}

      {/* Error Notice */}
      {error && !loading && (
        <div className="mt-2.5">
          <ErrorNotice
            message={error}
            onRetry={activePercent !== null ? () => handleSimulate(activePercent) : undefined}
          />
        </div>
      )}

      {/* Simulation Result */}
      {simResult && !loading && (
        <div
          role="region"
          aria-live="polite"
          aria-label="Simulation results"
          className="mt-3 space-y-2.5"
        >
          {/* Two-Column Comparison Table */}
          <div className="rounded border border-slate-700/80 bg-slate-900/70 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700/80 bg-slate-850/60 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="p-2 w-1/3">Metric</th>
                  <th className="p-2 w-1/3">Baseline (0%)</th>
                  <th className="p-2 w-1/3 text-sky-300">Sim (+{simResult.rainfall_adjustment_percent}%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-[11px]">
                <tr>
                  <td className="p-2 text-slate-400 font-medium">Trigger State</td>
                  <td className="p-2 text-slate-300 font-mono">{simResult.original_trigger_state}</td>
                  <td className="p-2 font-mono font-semibold text-slate-100">
                    {simResult.simulated_trigger_state}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-slate-400 font-medium">Current Risk</td>
                  <td className="p-2 font-medium" style={{ color: getRiskStyle(simResult.original_current_risk).textColor || '#f8fafc' }}>
                    {simResult.original_current_risk}
                  </td>
                  <td className="p-2 font-bold" style={{ color: getRiskStyle(simResult.simulated_current_risk).textColor || '#38bdf8' }}>
                    {simResult.simulated_current_risk}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Change readout */}
          <div className="rounded border border-slate-700/60 bg-slate-850/50 p-2 text-center text-xs">
            {riskChanged ? (
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-slate-400">Risk shifted:</span>
                <span className="text-slate-400">{simResult.original_current_risk}</span>
                <span className="text-slate-500">&rarr;</span>
                <span
                  className="font-bold px-1.5 py-0.5 rounded-xs"
                  style={{
                    backgroundColor: getRiskStyle(simResult.simulated_current_risk).color,
                    color: ['Low-Moderate', 'Moderate', 'Elevated'].includes(simResult.simulated_current_risk)
                      ? '#0f172a'
                      : '#ffffff',
                  }}
                >
                  {simResult.simulated_current_risk}
                </span>
              </div>
            ) : triggerChanged ? (
              <div className="flex items-center justify-center gap-1.5 text-slate-300">
                <span className="text-slate-400">Trigger elevated:</span>
                <span className="font-mono">{simResult.original_trigger_state}</span>
                <span className="text-slate-500">&rarr;</span>
                <span className="font-mono font-bold text-sky-300">{simResult.simulated_trigger_state}</span>
              </div>
            ) : (
              <span className="text-slate-400">
                No change in Current Risk at +{simResult.rainfall_adjustment_percent}% rainfall
              </span>
            )}
          </div>

          {/* Susceptibility Score statement */}
          <div className="rounded border border-slate-700/60 bg-slate-900/60 p-2 text-[11px] text-slate-400">
            <span className="font-mono font-semibold text-slate-200">
              Susceptibility Score: {staticSusceptibilityScore.toFixed(1)} / 100 (unchanged)
            </span>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Static terrain, geology, and history model does not vary with rainfall.
            </p>
          </div>

          {/* Metadata footer */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            <span>As of {simResult.as_of_date}</span>
            {nConditions !== null && (
              <span>Exceeded thresholds: {nConditions} / 4</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
