'use client';

import React, { useState } from 'react';
import ScrollReveal from './ScrollReveal';

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
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-b border-slate-800/80"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column (Editorial Narrative & Decision Framing) */}
        <div className="lg:col-span-5 flex flex-col items-start">
          <ScrollReveal variant="fade-up" delay={0}>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-semibold text-sky-400 uppercase tracking-widest px-2.5 py-1 rounded border border-sky-400/30 bg-sky-950/40">
                Chapter 04 &middot; Centerpiece
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                1,377 Geological Survey of India Records
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={80}>
            <h2
              id="temporal-title"
              className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight mb-5 leading-tight"
            >
              The Temporal Blindspot: <br />
              <span className="text-slate-300 font-normal italic">A Critical Methodological Pivot</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={140}>
            <p className="text-slate-300 text-base leading-relaxed mb-6 max-w-xl font-sans">
              Machine learning projects often begin with an ambitious premise: feed daily rainstorms and past
              landslide timestamps into a neural network or gradient booster to predict exact days of failure.
              When GeoShield examined the official Geological Survey of India (GSI) Bhusanket inventory, we
              uncovered a fundamental data limitation.
            </p>
          </ScrollReveal>

          {/* Interactive Toggle Switch */}
          <ScrollReveal variant="fade-up" delay={200} className="w-full mb-8">
            <div className="rounded-lg border border-slate-800 bg-[#0d1527] p-3 shadow-md flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-slate-300 font-medium">Switch View:</span>
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
                  className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
                    viewMode === 'reality'
                      ? 'bg-amber-600 text-white shadow'
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
                  className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
                    viewMode === 'idealized'
                      ? 'bg-sky-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Idealized Ambition
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Strategic Decision Callouts */}
          <div className="grid grid-cols-1 gap-4 w-full">
            <ScrollReveal variant="fade-up" delay={260}>
              <div className="rounded-lg border border-slate-800 bg-[#0d1527] p-4 text-xs space-y-1.5 shadow-sm">
                <div className="font-mono font-semibold uppercase text-slate-400 tracking-wider">
                  What We Chose Not to Do
                </div>
                <p className="text-slate-300 leading-relaxed font-sans text-sm">
                  We rejected the temptation to invent synthetic event dates or train a temporal black-box
                  model on an unverified 2015-concentrated catalog.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={320}>
              <div className="rounded-lg border border-sky-800/60 bg-[#0d1527] p-4 text-xs space-y-1.5 shadow-sm">
                <div className="font-mono font-semibold uppercase text-sky-400 tracking-wider">
                  The Methodological Solution
                </div>
                <p className="text-slate-300 leading-relaxed font-sans text-sm">
                  Decouple spatial susceptibility from meteorological stress. Train XGBoost strictly on{' '}
                  <strong className="text-white">where</strong> terrain is prone, and separately evaluate{' '}
                  <strong className="text-white">when</strong> rainfall conditions exceed empirical Himalayan thresholds.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Right Column (Large Prominent Year Histogram Display) */}
        <div className="lg:col-span-7 w-full">
          <ScrollReveal variant="fade-right" delay={180}>
            <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-6 sm:p-7 shadow-2xl">
              {viewMode === 'reality' ? (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-2">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                        GSI Bhusanket Inventory &middot; Real Distribution
                      </span>
                      <div className="text-base font-bold text-white mt-0.5">
                        1,377 Total Landslide Event Records
                      </div>
                    </div>
                    <span className="text-xs font-mono text-amber-300 bg-amber-950/70 px-3 py-1 rounded border border-amber-500/40 font-semibold self-start sm:self-auto">
                      2015 Concentration: 74.7%
                    </span>
                  </div>

                  {/* Large Horizontal Bar Histogram */}
                  <div
                    className="space-y-3.5 pt-2"
                    role="list"
                    aria-label="Distribution of landslide inventory records by year"
                  >
                    {YEAR_DATA.map((row, idx) => {
                      const widthPercent = (row.count / 1029) * 100;
                      return (
                        <div key={row.year} className="flex items-center gap-3.5 text-xs sm:text-sm" role="listitem">
                          <span className="font-mono w-14 text-slate-200 font-bold shrink-0 text-right">
                            {row.year}
                          </span>
                          <div className="flex-1 h-7 bg-[#070b13] rounded-md overflow-hidden flex items-center p-0.5 border border-slate-800/90 shadow-inner">
                            <div
                              className={`h-full rounded-sm transition-all duration-700 ease-out ${
                                row.highlight
                                  ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 shadow-sm'
                                  : 'bg-slate-600'
                              }`}
                              style={{ width: `${Math.max(2, widthPercent)}%` }}
                              aria-hidden="true"
                            />
                          </div>
                          <span className="font-mono w-32 text-right shrink-0">
                            <strong className={row.highlight ? 'text-amber-300 font-bold text-base' : 'text-slate-200'}>
                              {row.count.toLocaleString()}
                            </strong>{' '}
                            <span className="text-slate-400 text-xs">({row.pct})</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* The Discovery Callout Banner */}
                  <div className="mt-8 rounded-lg border border-amber-500/40 bg-amber-950/30 p-4 text-xs sm:text-sm text-amber-200 leading-relaxed font-sans shadow-md">
                    <strong className="font-semibold text-amber-100">The Discovery: </strong>
                    The GSI Bhusanket record IDs embed only an event year—no month or day exists. Furthermore,
                    1,029 of the 1,377 total records (74.7%) are stamped with 2015. This is most likely a bulk
                    survey or compilation year rather than the true date of slope collapse. Individual landslides
                    cannot be reliably aligned with specific daily storms.
                  </div>
                </div>
              ) : (
                /* View Mode 2: IDEALIZED AMBITION (CONCEPTUAL) */
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">
                        What We Wanted to Learn &middot; Idealized Premise
                      </span>
                      <div className="text-base font-bold text-white mt-0.5">
                        Continuous Time-Resolved Daily Storm Coupling
                      </div>
                    </div>
                    <span className="text-xs font-mono text-sky-300 bg-sky-950/70 px-3 py-1 rounded border border-sky-500/40 font-semibold self-start sm:self-auto">
                      Unattainable Without Daily Timestamps
                    </span>
                  </div>

                  <div className="h-64 w-full rounded-lg bg-[#070b13] border border-slate-800 p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>Daily Precipitation Series (mm/day)</span>
                      <span>Assumed Event Timestamps (&plusmn;1 day precision)</span>
                    </div>

                    <div className="relative h-32 flex items-center">
                      <svg
                        viewBox="0 0 500 80"
                        className="w-full h-full text-sky-500/50"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M 0 70 Q 50 15, 100 65 T 200 30 T 300 70 T 400 20 T 500 55"
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="2.5"
                        />
                        {/* Imagined Event Points */}
                        <circle cx="100" cy="65" r="5" fill="#f87171" stroke="#fff" strokeWidth="1" />
                        <circle cx="200" cy="30" r="5" fill="#f87171" stroke="#fff" strokeWidth="1" />
                        <circle cx="400" cy="20" r="5" fill="#f87171" stroke="#fff" strokeWidth="1" />
                      </svg>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                      <span>Day 1 &middot; Monsoon Start</span>
                      <span className="text-red-400">Day 82 &middot; Event Triggered</span>
                      <span className="text-red-400">Day 194 &middot; Event Triggered</span>
                      <span>Day 365 &middot; Season End</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    <strong className="font-semibold text-white">Why This Was Impossible: </strong>
                    Without reliable month/day records, training a time-resolved machine learning model would
                    force random temporal associations. Generating spurious daily &ldquo;probabilities&rdquo;
                    would mislead emergency planners. Choosing not to claim what the data could not validate was a
                    deliberate, defensible engineering decision.
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
