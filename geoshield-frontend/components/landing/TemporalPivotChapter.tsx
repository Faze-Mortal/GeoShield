'use client';

import React, { useState } from 'react';

// Authoritative Fact Sheet event year distribution
const YEAR_DATA = [
  { year: '2015', count: 1029, pct: '74.7%', highlight: true },
  { year: '2016', count: 208, pct: '15.1%', highlight: false },
  { year: '2017', count: 9, pct: '0.7%', highlight: false },
  { year: '2018', count: 95, pct: '6.9%', highlight: false },
  { year: '2019', count: 11, pct: '0.8%', highlight: false },
  { year: '2020', count: 8, pct: '0.6%', highlight: false },
  { year: '2023', count: 12, pct: '0.9%', highlight: false },
  { year: '2024', count: 5, pct: '0.4%', highlight: false },
];

export default function TemporalPivotChapter() {
  const [viewMode, setViewMode] = useState<'reality' | 'idealized'>('reality');

  return (
    <section
      id="chapter-4"
      aria-labelledby="temporal-title"
      className="py-20 md:py-28 px-4 sm:px-6 max-w-5xl mx-auto w-full border-b border-slate-800/80"
    >
      {/* Chapter Marker */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-xs font-semibold text-sky-400 uppercase tracking-widest px-2 py-0.5 rounded border border-sky-400/30 bg-sky-950/40">
          Chapter 04 &middot; Centerpiece
        </span>
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">
          1,377 Geological Survey of India Records
        </span>
      </div>

      <h2
        id="temporal-title"
        className="text-2xl sm:text-4xl font-serif text-white tracking-tight mb-4"
      >
        The Temporal Blindspot: A Critical Methodological Pivot
      </h2>

      <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-3xl font-sans">
        Machine learning projects often begin with an ambitious premise: feed daily rainstorms and past
        landslide timestamps into a neural network or gradient booster to predict exact days of failure.
        When GeoShield examined the official Geological Survey of India (GSI) Bhusanket inventory, we
        uncovered a fundamental data limitation.
      </p>

      {/* Interactive Toggle Switch */}
      <div className="rounded border border-slate-800 bg-[#0d1527] p-5 sm:p-7 shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Interactive Perspective Toggle
            </span>
            <div className="text-sm font-semibold text-white mt-0.5">
              {viewMode === 'reality'
                ? 'Ground Reality: GSI Bhusanket Year Distribution (Real Data)'
                : 'Idealized Ambition: Continuous Time-Resolved Events (Conceptual Assumption)'}
            </div>
          </div>

          <div
            role="radiogroup"
            aria-label="Perspective view selection"
            className="flex items-center rounded border border-slate-700 bg-slate-900 p-0.5"
          >
            <button
              type="button"
              role="radio"
              aria-checked={viewMode === 'reality'}
              onClick={() => setViewMode('reality')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                viewMode === 'reality'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Real Year Histogram
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={viewMode === 'idealized'}
              onClick={() => setViewMode('idealized')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                viewMode === 'idealized'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Idealized Ambition
            </button>
          </div>
        </div>

        {/* View Mode 1: REAL GSI HISTOGRAM */}
        {viewMode === 'reality' ? (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span>GSI Bhusanket Inventory: 1,377 Recorded Events</span>
              <span className="text-amber-400 font-semibold">2015 Concentration: 74.7%</span>
            </div>

            {/* Horizontal Bar Histogram */}
            <div
              className="space-y-2.5 pt-2"
              role="list"
              aria-label="Distribution of landslide inventory records by year"
            >
              {YEAR_DATA.map((row) => {
                const widthPercent = (row.count / 1029) * 100;
                return (
                  <div key={row.year} className="flex items-center gap-3 text-xs" role="listitem">
                    <span className="font-mono w-12 text-slate-300 font-bold shrink-0">
                      {row.year}
                    </span>
                    <div className="flex-1 h-6 bg-slate-900 rounded overflow-hidden flex items-center p-0.5 border border-slate-800">
                      <div
                        className={`h-full rounded-xs transition-all duration-500 ${
                          row.highlight
                            ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                            : 'bg-slate-600'
                        }`}
                        style={{ width: `${Math.max(2, widthPercent)}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="font-mono w-28 text-right shrink-0">
                      <strong className={row.highlight ? 'text-amber-300' : 'text-slate-200'}>
                        {row.count.toLocaleString()}
                      </strong>{' '}
                      <span className="text-slate-500 text-[11px]">({row.pct})</span>
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs text-amber-200 leading-relaxed font-sans">
              <strong className="font-semibold text-amber-100">The Discovery: </strong>
              The GSI Bhusanket record IDs embed only an event year—no month or day exists. Furthermore,
              1,029 of the 1,377 total records (74.7%) are stamped with 2015. This is most likely a bulk
              survey or compilation year rather than the true date of slope collapse. Individual landslides
              cannot be reliably aligned with specific daily storms.
            </div>
          </div>
        ) : (
          /* View Mode 2: IDEALIZED AMBITION (CONCEPTUAL) */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span>What We Wanted to Learn (Idealized Assumption)</span>
              <span className="text-sky-300 font-semibold">Continuous Day-by-Day Coupling</span>
            </div>

            <div className="h-44 w-full rounded bg-slate-900/90 border border-slate-800 p-4 flex flex-col justify-between">
              {/* Fake idealized time-series wave */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Daily Rainfall Time-Series (mm/day)</span>
                <span>Assumed Precise Slide Timestamps (&plusmn;1 day)</span>
              </div>

              <div className="relative h-20 flex items-center">
                <svg
                  viewBox="0 0 500 60"
                  className="w-full h-full text-sky-500/50"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M 0 50 Q 50 10, 100 45 T 200 20 T 300 50 T 400 15 T 500 40"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2"
                  />
                  {/* Event points */}
                  <circle cx="100" cy="45" r="4" fill="#f87171" />
                  <circle cx="200" cy="20" r="4" fill="#f87171" />
                  <circle cx="400" cy="15" r="4" fill="#f87171" />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Day 1 &middot; Storm</span>
                <span>Day 82 &middot; Event Triggered</span>
                <span>Day 194 &middot; Event Triggered</span>
                <span>Day 365</span>
              </div>
            </div>

            <div className="rounded border border-slate-700 bg-slate-800/40 p-3.5 text-xs text-slate-300 leading-relaxed font-sans">
              <strong className="font-semibold text-white">Why This Was Impossible: </strong>
              Without reliable month/day records, training a time-resolved machine learning model would
              force random temporal associations. Generating spurious daily &ldquo;probabilities&rdquo;
              would mislead emergency planners. Choosing not to claim what the data could not validate was a
              deliberate, defensible engineering decision.
            </div>
          </div>
        )}
      </div>

      {/* The Consequence / Strategic Pivot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded border border-slate-800 bg-[#0d1527] p-4 text-xs space-y-2">
          <div className="font-mono font-semibold uppercase text-slate-400 tracking-wider">
            What We Chose Not to Do
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">
            We rejected the temptation to invent synthetic event dates or train a temporal black-box
            model on an unverified 2015-concentrated catalog.
          </p>
        </div>

        <div className="rounded border border-sky-800/60 bg-[#0d1527] p-4 text-xs space-y-2">
          <div className="font-mono font-semibold uppercase text-sky-400 tracking-wider">
            The Methodological Solution
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">
            Decouple spatial susceptibility from meteorological stress. Train XGBoost strictly on{' '}
            <em>where</em> terrain is prone, and separately evaluate <em>when</em> rainfall conditions
            exceed empirical Himalayan thresholds.
          </p>
        </div>
      </div>
    </section>
  );
}
