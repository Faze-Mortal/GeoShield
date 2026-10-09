'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SimulationChapter() {
  const [sliderValue, setSliderValue] = useState<number>(30); // default to +30% to demonstrate verified result

  const percentageSteps = [0, 10, 20, 30];

  return (
    <section
      id="chapter-7"
      aria-labelledby="simulation-title"
      className="py-20 md:py-28 px-4 sm:px-6 max-w-5xl mx-auto w-full border-b border-slate-800/80"
    >
      {/* Chapter Marker */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-xs font-semibold text-sky-400 uppercase tracking-widest px-2 py-0.5 rounded border border-sky-400/30 bg-sky-950/40">
          Chapter 07 &middot; Simulation
        </span>
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">
          What-If Sensitivity Testing
        </span>
      </div>

      <h2
        id="simulation-title"
        className="text-2xl sm:text-4xl font-serif text-white tracking-tight mb-4"
      >
        Interactive What-If Simulation: Stress-Testing the Slopes
      </h2>

      <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-3xl font-sans">
        Emergency planners cannot wait for catastrophic monsoons to discover which valley sectors will
        cross trigger thresholds. GeoShield includes a real-time sensitivity simulation engine that
        stress-tests terrain by scaling antecedent rainfall stress.
      </p>

      {/* The 4 Core Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div className="rounded border border-slate-800 bg-[#0d1527] p-3.5 text-xs">
          <div className="text-[10px] font-mono font-bold uppercase text-amber-400">Pillar 1</div>
          <div className="font-bold text-white font-sans mt-0.5">Static Susceptibility</div>
          <p className="text-slate-400 text-[11px] mt-1 leading-normal">
            Slope, soil, and bedrock morphology remain fixed.
          </p>
        </div>
        <div className="rounded border border-slate-800 bg-[#0d1527] p-3.5 text-xs">
          <div className="text-[10px] font-mono font-bold uppercase text-sky-400">Pillar 2</div>
          <div className="font-bold text-white font-sans mt-0.5">Baseline Weather</div>
          <p className="text-slate-400 text-[11px] mt-1 leading-normal">
            Observed 1d, 3d, 7d, and 30d antecedent precipitation snapshot.
          </p>
        </div>
        <div className="rounded border border-slate-800 bg-[#0d1527] p-3.5 text-xs">
          <div className="text-[10px] font-mono font-bold uppercase text-sky-400">Pillar 3</div>
          <div className="font-bold text-white font-sans mt-0.5">Simulated Delta</div>
          <p className="text-slate-400 text-[11px] mt-1 leading-normal">
            Controlled rainfall increments (+10%, +20%, +30%).
          </p>
        </div>
        <div className="rounded border border-slate-800 bg-[#0d1527] p-3.5 text-xs">
          <div className="text-[10px] font-mono font-bold uppercase text-emerald-400">Pillar 4</div>
          <div className="font-bold text-white font-sans mt-0.5">Simulated Current Risk</div>
          <p className="text-slate-400 text-[11px] mt-1 leading-normal">
            New 3&times;3 matrix intersection outcome.
          </p>
        </div>
      </div>

      {/* Interactive Simulation Sandbox */}
      <div className="rounded border border-slate-800 bg-[#0d1527] p-5 sm:p-7 shadow-xl mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80 mb-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Interactive Sensitivity Slider &middot; What-if scenario, not a forecast
            </span>
            <div className="text-sm font-semibold text-white mt-0.5">
              Simulated Rainfall Stress: +{sliderValue}%
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5" role="group" aria-label="Rainfall percentage steps">
            {percentageSteps.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => setSliderValue(step)}
                className={`h-8 px-3 rounded text-xs font-mono font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  sliderValue === step
                    ? 'bg-sky-600 text-white border border-sky-400'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
                aria-pressed={sliderValue === step}
              >
                +{step}%
              </button>
            ))}
          </div>
        </div>

        {/* Range Input Slider */}
        <div className="mb-8">
          <label htmlFor="rainfall-slider" className="sr-only">
            Simulated rainfall increase percentage
          </label>
          <input
            id="rainfall-slider"
            type="range"
            min="0"
            max="30"
            step="10"
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2 px-1">
            <span>0% (Baseline)</span>
            <span>+10% Stress</span>
            <span>+20% Stress</span>
            <span>+30% Severe Monsoon Stress</span>
          </div>
        </div>

        {/* Illustrative Rainfall Bar Visualization */}
        <div className="rounded border border-slate-800 bg-[#090e17] p-4 mb-6">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Dynamic Antecedent Precipitation (Rolling Windows)</span>
            <span className="text-slate-500 italic">illustrative rainfall, not real data</span>
          </div>

          <div className="grid grid-cols-4 gap-3 pt-2">
            {[
              { label: '1-Day Intensity', base: 45, max: 75 },
              { label: '3-Day Intensity', base: 60, max: 95 },
              { label: '7-Day Intensity', base: 80, max: 125 },
              { label: '30-Day Cumulative', base: 95, max: 150 },
            ].map((bar) => {
              const currentVal = Math.round(bar.base * (1 + sliderValue / 100));
              const heightPct = Math.min(100, Math.round((currentVal / bar.max) * 100));
              return (
                <div key={bar.label} className="flex flex-col items-center">
                  <div className="w-full h-20 bg-slate-900 rounded flex items-end p-1 border border-slate-800">
                    <div
                      className="w-full bg-gradient-to-t from-sky-600 to-sky-400 rounded-xs transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-white mt-1.5">
                    {currentVal}&thinsp;mm
                  </span>
                  <span className="text-[10px] text-slate-400 text-center leading-tight">
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Outcome Display: Real verified case vs custom exploration */}
        {sliderValue === 30 ? (
          <div className="rounded border border-sky-500/40 bg-sky-950/20 p-4 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-white border-b border-sky-500/30 pb-2">
              <strong className="text-sm font-sans font-bold">
                Verified Real Result &middot; Cell r0142_c0087 at +30% Rainfall
              </strong>
              <span className="text-[11px] text-sky-300 bg-sky-900/60 px-2 py-0.5 rounded">
                Real GeoShield Result
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-slate-400 block">Trigger State:</span>
                <span className="text-amber-300 font-bold">ELEVATED &rarr; HIGH</span>
              </div>
              <div>
                <span className="text-slate-400 block">Current Risk:</span>
                <span className="text-amber-400 font-bold">Low-Moderate &rarr; Moderate</span>
              </div>
              <div>
                <span className="text-slate-400 block">Susceptibility Score:</span>
                <span className="text-white font-bold">Unchanged at 32.7 / 100</span>
              </div>
            </div>

            <p className="text-sky-200 text-xs font-sans italic pt-1">
              &ldquo;Susceptibility Score does not change; only the rainfall trigger does.&rdquo;
            </p>
          </div>
        ) : sliderValue === 0 ? (
          <div className="rounded border border-slate-800 bg-slate-900/40 p-4 text-xs font-mono space-y-1">
            <strong className="text-white block font-sans">
              Baseline State &middot; Cell r0142_c0087 (Snapshot 2026-09-12)
            </strong>
            <div className="text-slate-300">
              Susceptibility Score: 32.7 (Low) &middot; Trigger State: ELEVATED &middot; Current Risk:
              Low-Moderate
            </div>
            <div className="text-slate-500 text-[11px] italic">
              Increase the slider to test meteorological stress sensitivity.
            </div>
          </div>
        ) : (
          <div className="rounded border border-slate-800 bg-slate-900/40 p-4 text-xs font-mono space-y-1">
            <strong className="text-white block font-sans">
              Scenario at +{sliderValue}% Rainfall
            </strong>
            <div className="text-slate-300">
              Run this scenario for any cell in the dashboard to compute exact trigger threshold
              exceedances.
            </div>
            <div className="text-slate-500 text-[11px] italic">
              Outcome verified live via FastAPI /simulate endpoint in the operational map.
            </div>
          </div>
        )}

        {/* What-If Tour CTA */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Open GeoShield with the what-if simulation tour enabled:
          </span>

          <Link
            href="/dashboard?tour=whatif"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded border border-sky-400/50 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <span>Run a What-If Scenario in GeoShield</span>
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
