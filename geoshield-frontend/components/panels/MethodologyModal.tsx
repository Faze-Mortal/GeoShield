'use client';

import React, { useEffect } from 'react';
import { RISK_MATRIX } from '@/lib/risk';
import { getRiskStyle } from '@/lib/risk';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MethodologyModal({ isOpen, onClose }: MethodologyModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans animate-in fade-in duration-100"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="methodology-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded border border-slate-700/80 bg-[#0d1527] p-5 shadow-2xl text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 id="methodology-title" className="text-sm font-bold tracking-tight text-white uppercase">
              GeoShield Methodology & System Architecture
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Two-layer landslide hazard framework for Kullu and Mandi districts, HP
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
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

        {/* Content */}
        <div className="space-y-4 pt-3.5 text-xs leading-relaxed text-slate-300">
          {/* Two-layer description */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Two-Layer Architecture
            </h3>
            <p className="mb-2 text-slate-300">
              GeoShield models landslide hazard across a 500 m &times; 500 m spatial grid covering Kullu and Mandi districts through two decoupled components:
            </p>
            <ul className="space-y-1.5 pl-2 border-l border-slate-800 text-slate-300">
              <li>
                <strong className="text-slate-100">1. Susceptibility Layer:</strong> Static machine-learning model (XGBoost) evaluating terrain slope, geology, soil composition, and historical landslide inventory. It yields a static relative index from 0 to 100. It does not vary with rainfall or season.
              </li>
              <li>
                <strong className="text-slate-100">2. Rainfall Trigger Layer:</strong> Empirical multi-day antecedent precipitation and intensity thresholds classifying dynamic meteorological stress into <span className="font-semibold text-emerald-400">LOW</span>, <span className="font-semibold text-amber-400">ELEVATED</span>, or <span className="font-semibold text-red-400">HIGH</span>.
              </li>
            </ul>
          </div>

          {/* 3x3 Matrix Table */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Current Risk Lookup Matrix (3 &times; 3)
            </h3>
            <p className="text-[11px] text-slate-400 mb-2">
              The Susceptibility Bin combines deterministically with the dynamic Trigger State to establish Current Risk:
            </p>
            <div className="overflow-x-auto rounded border border-slate-700/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-850 text-slate-300 border-b border-slate-700/80 text-[11px]">
                    <th className="p-2 font-semibold">Susceptibility Bin \ Trigger</th>
                    <th className="p-2 font-semibold text-emerald-400">LOW</th>
                    <th className="p-2 font-semibold text-amber-400">ELEVATED</th>
                    <th className="p-2 font-semibold text-red-400">HIGH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px]">
                  {RISK_MATRIX.map((row) => (
                    <tr key={row.susBin} className="hover:bg-slate-800/30">
                      <td className="p-2 font-medium text-slate-200">
                        {row.susBin}{' '}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {row.susBin === 'Low' ? '(<33)' : row.susBin === 'Moderate' ? '(33–66)' : '(≥66)'}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className="inline-block px-2 py-0.5 rounded-xs font-semibold"
                          style={{
                            backgroundColor: `${getRiskStyle(row.low).color}22`,
                            color: getRiskStyle(row.low).textColor || getRiskStyle(row.low).color,
                            border: `1px solid ${getRiskStyle(row.low).color}55`,
                          }}
                        >
                          {row.low}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className="inline-block px-2 py-0.5 rounded-xs font-semibold"
                          style={{
                            backgroundColor: `${getRiskStyle(row.elevated).color}22`,
                            color: getRiskStyle(row.elevated).textColor || getRiskStyle(row.elevated).color,
                            border: `1px solid ${getRiskStyle(row.elevated).color}55`,
                          }}
                        >
                          {row.elevated}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className="inline-block px-2 py-0.5 rounded-xs font-semibold"
                          style={{
                            backgroundColor: `${getRiskStyle(row.high).color}22`,
                            color: getRiskStyle(row.high).textColor || getRiskStyle(row.high).color,
                            border: `1px solid ${getRiskStyle(row.high).color}55`,
                          }}
                        >
                          {row.high}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              LOW = 0 threshold conditions exceeded; ELEVATED = 1 condition exceeded; HIGH = 2+ conditions exceeded.
            </p>
          </div>

          {/* Caveats */}
          <div className="rounded border border-slate-700/80 bg-slate-850/50 p-3 space-y-1.5 text-[11px]">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Scientific Caveats & Data Constraints
            </h4>
            <ul className="space-y-1 text-slate-300 list-disc list-inside">
              <li>
                <strong className="text-slate-100">Susceptibility Score:</strong> 0–100 relative index of terrain characteristics, not an occurrence probability.
              </li>
              <li>
                <strong className="text-slate-100">Trigger Thresholds:</strong> Derived from same-state empirical reference (Singh et al., 2025, Shimla, Himachal Pradesh). Not individually calibrated for Kullu or Mandi catchments.
              </li>
              <li>
                <strong className="text-slate-100">Snapshot Rainfall:</strong> Current weather values represent an observational snapshot as of <strong>2026-09-12</strong>.
              </li>
              <li>
                <strong className="text-slate-100">Simulation:</strong> Rainfall stress testing is a what-if analytical exploration, not a weather forecast.
              </li>
              <li>
                <strong className="text-slate-100">Mapping Bias:</strong> The model relies on historical landslide inventory data and may exhibit lower accuracy in unmapped terrain.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end border-t border-slate-800 pt-3">
          <button
            onClick={onClose}
            className="rounded border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
