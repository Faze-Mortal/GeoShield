'use client';

import React, { useState } from 'react';
import ScrollReveal from './ScrollReveal';
import { getRiskStyle } from '@/lib/risk';
import type { CurrentRisk, TriggerState, SusceptibilityBin } from '@/types/api';

interface MatrixCell {
  susBin: SusceptibilityBin;
  trigger: TriggerState;
  risk: CurrentRisk;
  explanation: string;
}

const MATRIX_CELLS: MatrixCell[] = [
  // Row: Low (<33)
  {
    susBin: 'Low',
    trigger: 'LOW',
    risk: 'Low',
    explanation: 'Low susceptibility terrain under calm weather conditions. Minimal likelihood of slope deformation.',
  },
  {
    susBin: 'Low',
    trigger: 'ELEVATED',
    risk: 'Low-Moderate',
    explanation: 'Stable terrain experiencing moderate antecedent rainfall. Superficial run-off or minor roadside rills possible.',
  },
  {
    susBin: 'Low',
    trigger: 'HIGH',
    risk: 'Moderate',
    explanation: 'Inherently low-susceptibility terrain subjected to heavy multi-day precipitation. Increased localized pore pressure.',
  },
  // Row: Moderate (33–66)
  {
    susBin: 'Moderate',
    trigger: 'LOW',
    risk: 'Moderate',
    explanation: 'Moderate terrain predisposition even under baseline rainfall due to slope angle, drainage cuts, or past instability.',
  },
  {
    susBin: 'Moderate',
    trigger: 'ELEVATED',
    risk: 'High',
    explanation: 'Vulnerable slopes encountering heightened monsoon rainfall. Significant probability of mass mobilization.',
  },
  {
    susBin: 'Moderate',
    trigger: 'HIGH',
    risk: 'High',
    explanation: 'Moderately prone mountain slopes enduring intense antecedent precipitation exceeding regional thresholds.',
  },
  // Row: High (≥66)
  {
    susBin: 'High',
    trigger: 'LOW',
    risk: 'Elevated',
    explanation: 'Severe intrinsic terrain fragility (steep, fractured rock, high historic slide density) remains hazardous even with zero rain.',
  },
  {
    susBin: 'High',
    trigger: 'ELEVATED',
    risk: 'High',
    explanation: 'Critical geotechnical fragility compounded by elevated monsoon rainfall. Slope failure imminent along weak planes.',
  },
  {
    susBin: 'High',
    trigger: 'HIGH',
    risk: 'Critical',
    explanation: 'Maximum emergency threat: highly susceptible slopes receiving extreme multi-day monsoon stress. Urgent evacuation status.',
  },
];

// Snapshot distribution (Fact sheet exact counts, snapshot 2026-09-12)
const SNAPSHOT_DISTRIBUTION: { risk: CurrentRisk; count: number; pct: string }[] = [
  { risk: 'Low', count: 22081, pct: '23.0%' },
  { risk: 'Low-Moderate', count: 47788, pct: '49.7%' },
  { risk: 'Moderate', count: 16571, pct: '17.2%' },
  { risk: 'Elevated', count: 524, pct: '0.5%' },
  { risk: 'High', count: 8077, pct: '8.4%' },
  { risk: 'Critical', count: 1077, pct: '1.1%' },
];

export default function RiskMatrixChapter() {
  const [selectedIndices, setSelectedIndices] = useState<{
    susBin: SusceptibilityBin;
    trigger: TriggerState;
  }>({
    susBin: 'Low',
    trigger: 'ELEVATED',
  });

  const activeCell =
    MATRIX_CELLS.find(
      (c) => c.susBin === selectedIndices.susBin && c.trigger === selectedIndices.trigger,
    ) || MATRIX_CELLS[1];

  const handleSelect = (susBin: SusceptibilityBin, trigger: TriggerState) => {
    setSelectedIndices({ susBin, trigger });
  };

  const handleSelectRealCell = (cellId: 'r0142_c0087' | 'r0137_c0204') => {
    if (cellId === 'r0142_c0087') {
      setSelectedIndices({ susBin: 'Low', trigger: 'ELEVATED' });
    } else {
      setSelectedIndices({ susBin: 'High', trigger: 'HIGH' });
    }
  };

  const isRealCellActive1 = selectedIndices.susBin === 'Low' && selectedIndices.trigger === 'ELEVATED';
  const isRealCellActive2 = selectedIndices.susBin === 'High' && selectedIndices.trigger === 'HIGH';

  return (
    <section
      id="how-layers-become-current-risk"
      aria-labelledby="matrix-title"
      className="scroll-mt-16 md:scroll-mt-20 py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-b border-slate-800/80"
    >
      <div id="chapter-6" className="w-full">
        {/* Chapter Marker */}
      <ScrollReveal variant="fade-up" delay={0}>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-xs font-semibold text-sky-400 uppercase tracking-widest px-2.5 py-1 rounded border border-sky-400/30 bg-sky-950/40">
            Chapter 06 &middot; Climax
          </span>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
            Deterministic 3&times;3 Decision Matrix
          </span>
        </div>
      </ScrollReveal>

      <ScrollReveal variant="fade-up" delay={80}>
        <h2
          id="matrix-title"
          className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight mb-5 leading-tight"
        >
          How the Layers Become Current Risk: <br />
          <span className="text-slate-300 font-normal italic">The 3&times;3 Decision Matrix</span>
        </h2>
      </ScrollReveal>

      <ScrollReveal variant="fade-up" delay={140}>
        <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-3xl font-sans">
          When operational assessments are made, GeoShield does not obscure decisions inside a black box.
          Instead, the static <strong className="text-white">Susceptibility Bin</strong> and dynamic{' '}
          <strong className="text-white">Trigger State</strong> intersect deterministically in a 3&times;3
          lookup matrix, producing one of six operational <strong className="text-white">Current Risk</strong>{' '}
          levels.
        </p>
      </ScrollReveal>

      {/* Real Cell Presets */}
      <ScrollReveal variant="fade-up" delay={180}>
        <div className="mb-8 flex flex-wrap items-center gap-3 p-4 rounded-xl border border-slate-800 bg-[#0d1527] shadow-lg">
          <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
            Verified Real Results (Snapshot 2026-09-12):
          </span>
          <button
            type="button"
            onClick={() => handleSelectRealCell('r0142_c0087')}
            className={`h-9 px-3.5 rounded-lg text-xs font-mono font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              isRealCellActive1
                ? 'border-sky-400 bg-sky-950/90 text-white shadow-md'
                : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            aria-pressed={isRealCellActive1}
          >
            Cell r0142_c0087 &rarr; Low + ELEVATED (Low-Moderate)
          </button>
          <button
            type="button"
            onClick={() => handleSelectRealCell('r0137_c0204')}
            className={`h-9 px-3.5 rounded-lg text-xs font-mono font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              isRealCellActive2
                ? 'border-sky-400 bg-sky-950/90 text-white shadow-md'
                : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            aria-pressed={isRealCellActive2}
          >
            Cell r0137_c0204 &rarr; High + HIGH (Critical)
          </button>
        </div>
      </ScrollReveal>

      {/* Interactive 3x3 Matrix Container (Focal Point) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
        {/* The Matrix (7 cols) */}
        <div className="lg:col-span-7">
          <ScrollReveal variant="fade-left" delay={200}>
            <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-5 sm:p-7 shadow-2xl">
              <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">
                    Interactive Lookup Table
                  </span>
                  <div className="text-xs text-slate-400">Click or focus any cell to evaluate combination</div>
                </div>
                <div className="text-xs font-mono text-slate-300 font-semibold bg-slate-800 px-2.5 py-1 rounded">
                  9 Combinations
                </div>
              </div>

              {/* Matrix Grid */}
              <div className="overflow-x-auto">
                <div
                  role="grid"
                  aria-label="3 by 3 Current Risk Decision Matrix"
                  aria-readonly="true"
                  className="min-w-[360px]"
                >
                  {/* Table Header: Trigger State (Columns) */}
                  <div className="grid grid-cols-4 gap-2.5 mb-2.5 text-center text-xs font-mono">
                    <div className="flex items-center justify-center p-1.5 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      Susceptibility &darr; \ Trigger &rarr;
                    </div>
                    {(['LOW', 'ELEVATED', 'HIGH'] as TriggerState[]).map((trig) => {
                      const isColActive = selectedIndices.trigger === trig;
                      return (
                        <div
                          key={trig}
                          className={`p-2 rounded-lg border transition-colors ${
                            isColActive
                              ? 'border-sky-400 bg-sky-950/70 text-sky-200 font-bold shadow-xs'
                              : 'border-slate-800 bg-slate-900/60 text-slate-400'
                          }`}
                        >
                          <span className="text-xs uppercase tracking-wider">{trig}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Rows: Susceptibility Bin (Low, Moderate, High) */}
                  {(['Low', 'Moderate', 'High'] as SusceptibilityBin[]).map((bin) => {
                    const isRowActive = selectedIndices.susBin === bin;
                    const rowLabel =
                      bin === 'Low' ? 'Low (<33)' : bin === 'Moderate' ? 'Moderate (33–66)' : 'High (≥66)';

                    return (
                      <div key={bin} className="grid grid-cols-4 gap-2.5 mb-2.5" role="row">
                        {/* Row header label */}
                        <div
                          className={`flex items-center justify-start px-3 py-2.5 rounded-lg text-xs font-mono transition-colors ${
                            isRowActive
                              ? 'bg-amber-950/50 text-amber-200 font-bold border border-amber-500/50 shadow-xs'
                              : 'bg-slate-900/40 text-slate-400 border border-slate-800/80'
                          }`}
                        >
                          <span className="truncate">{rowLabel}</span>
                        </div>

                        {/* 3 Cells in Row */}
                        {(['LOW', 'ELEVATED', 'HIGH'] as TriggerState[]).map((trig) => {
                          const item = MATRIX_CELLS.find(
                            (c) => c.susBin === bin && c.trigger === trig,
                          )!;
                          const isSelected =
                            selectedIndices.susBin === bin && selectedIndices.trigger === trig;
                          const style = getRiskStyle(item.risk);

                          return (
                            <button
                              key={trig}
                              role="gridcell"
                              aria-selected={isSelected}
                              aria-label={`Susceptibility ${bin}, Trigger ${trig}, Current Risk ${item.risk}`}
                              type="button"
                              onClick={() => handleSelect(bin, trig)}
                              className={`min-h-[56px] p-2.5 rounded-lg text-xs font-semibold font-sans flex flex-col items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 border ${
                                isSelected
                                  ? 'ring-2 ring-sky-400 shadow-xl scale-[1.04] z-10'
                                  : 'hover:brightness-125 opacity-90'
                              }`}
                              style={{
                                backgroundColor: `${style.color}25`,
                                borderColor: isSelected ? '#38bdf8' : `${style.color}60`,
                                color: style.textColor,
                              }}
                            >
                              <span className="tracking-tight text-xs sm:text-sm">{item.risk}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Note: &ldquo;Elevated&rdquo; appears as Trigger (ELEVATED) and Risk (Elevated)</span>
                <span className="text-sky-300">Axis context prevents ambiguity</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Selected Outcome Details (5 cols) */}
        <div className="lg:col-span-5">
          <ScrollReveal variant="fade-right" delay={240}>
            <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-6 sm:p-7 shadow-2xl flex flex-col justify-between h-full">
              <div>
                <div className="pb-4 border-b border-slate-800 mb-5">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Evaluation Output &middot; Current Risk
                  </span>
                  <div
                    className="text-3xl font-bold font-sans mt-1.5 flex items-center gap-3"
                    style={{ color: getRiskStyle(activeCell.risk).textColor }}
                  >
                    <span
                      className="inline-block h-4 w-4 rounded-xs shrink-0"
                      style={{ backgroundColor: getRiskStyle(activeCell.risk).color }}
                      aria-hidden="true"
                    />
                    <span>{activeCell.risk}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-xs font-mono p-3 rounded-lg bg-[#070b13] border border-slate-800">
                    <span className="text-slate-400">Susceptibility Bin:</span>
                    <span className="text-amber-300 font-bold">
                      {activeCell.susBin} (
                      {activeCell.susBin === 'Low'
                        ? '<33'
                        : activeCell.susBin === 'Moderate'
                        ? '33–66'
                        : '≥66'}
                      )
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono p-3 rounded-lg bg-[#070b13] border border-slate-800">
                    <span className="text-slate-400">Trigger State:</span>
                    <span className="text-sky-300 font-bold">{activeCell.trigger}</span>
                  </div>
                </div>

                <div className="text-sm text-slate-300 leading-relaxed font-sans mb-6">
                  {activeCell.explanation}
                </div>

                {/* If matching a verified real cell, show data badge */}
                {isRealCellActive1 && (
                  <div className="rounded-lg border border-sky-500/50 bg-sky-950/40 p-4 text-xs font-mono space-y-1.5 text-sky-200 shadow-md">
                    <strong className="text-white block font-bold text-sm">Real GeoShield Result: Cell r0142_c0087</strong>
                    <div>Susceptibility Score: 32.7 (Bin: Low)</div>
                    <div>Trigger State: ELEVATED (Station #10)</div>
                    <div className="text-emerald-300 font-bold text-sm mt-1">Current Risk: Low-Moderate</div>
                  </div>
                )}

                {isRealCellActive2 && (
                  <div className="rounded-lg border border-purple-500/50 bg-purple-950/40 p-4 text-xs font-mono space-y-1.5 text-purple-200 shadow-md">
                    <strong className="text-white block font-bold text-sm">Real GeoShield Result: Cell r0137_c0204</strong>
                    <div>Susceptibility Score: 73.3 (Bin: High)</div>
                    <div>Trigger State: HIGH (Station #12)</div>
                    <div className="text-purple-300 font-bold text-sm mt-1">Current Risk: Critical</div>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Snapshot Distribution Breakdown (Fact Sheet exact numbers) */}
      <ScrollReveal variant="fade-up" delay={280}>
        <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800 mb-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Grid Cells in the Study Box &middot; Snapshot 2026-09-12
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Total: 96,118 cells (the box includes neighboring terrain)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SNAPSHOT_DISTRIBUTION.map((item) => {
              const style = getRiskStyle(item.risk);
              return (
                <div
                  key={item.risk}
                  className="rounded-lg border border-slate-800 bg-[#070b13] p-3 text-xs flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: style.color }}
                      aria-hidden="true"
                    />
                    <span className="font-semibold truncate text-xs" style={{ color: style.textColor }}>
                      {item.risk}
                    </span>
                  </div>
                  <div className="font-mono text-base font-bold text-white mt-1">
                    {item.count.toLocaleString()}
                  </div>
                  <div className="font-mono text-[10px] text-slate-400">{item.pct} of grid</div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>
      </div>
    </section>
  );
}
