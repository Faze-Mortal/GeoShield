'use client';

import React from 'react';

export default function TwoLayerChapter() {
  return (
    <section
      id="chapter-5"
      aria-labelledby="twolayer-title"
      className="py-20 md:py-28 px-4 sm:px-6 max-w-5xl mx-auto w-full border-b border-slate-800/80"
    >
      {/* Chapter Marker */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-xs font-semibold text-sky-400 uppercase tracking-widest px-2 py-0.5 rounded border border-sky-400/30 bg-sky-950/40">
          Chapter 05 &middot; Framework
        </span>
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">
          Decoupled Risk Architecture
        </span>
      </div>

      <h2
        id="twolayer-title"
        className="text-2xl sm:text-4xl font-serif text-white tracking-tight mb-4"
      >
        The Two-Layer Solution: Decoupling Terrain from Weather
      </h2>

      <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-10 max-w-3xl font-sans">
        By separating intrinsic geo-environmental predisposition from transient meteorological stress,
        GeoShield provides clear operational clarity: each layer addresses an entirely different physical
        question.
      </p>

      {/* Side-by-Side Layer Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* LAYER A: Susceptibility (Static ML) */}
        <div className="rounded border border-amber-600/50 bg-[#0d1527] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                  Layer A &middot; Spatial Machine Learning
                </span>
                <h3 className="text-lg font-bold text-white font-sans mt-0.5">
                  Susceptibility Score
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
                Static (0 – 100)
              </span>
            </div>

            <div className="text-xs font-mono text-slate-400 mb-3 italic">
              Core question: &ldquo;Where is the terrain prone?&rdquo;
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              An XGBoost model trained on 12 static topographic, geologic, and infrastructure features.
              Calculates a static relative terrain index from 0 to 100 per cell that{' '}
              <strong className="text-amber-200">never changes with rainfall</strong>.
            </p>

            {/* Bins definition */}
            <div className="rounded border border-slate-800 bg-[#090e17] p-3 text-xs space-y-1.5 font-mono mb-4">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Round-Number Bins:
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Low:</span>
                <span className="text-amber-300">Below 33</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Moderate:</span>
                <span className="text-amber-300">33 to below 66</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>High:</span>
                <span className="text-amber-300">66 and above</span>
              </div>
            </div>

            {/* Mandatory scientific explanation: Why not a probability */}
            <div className="rounded border border-amber-500/30 bg-amber-950/20 p-3 text-xs space-y-1 text-amber-200">
              <strong className="font-semibold text-amber-100 font-sans block">
                Why It Is Not a Probability:
              </strong>
              <p className="leading-relaxed">
                The training sample was enriched to ~20% positives, whereas real-world prevalence across
                the grid is only ~0.9% (872 positive cells out of 96,118). Raw model scores reflect this
                synthetic balance. Furthermore, calibration audits show observed event frequencies
                exceed predicted scores in low-to-mid bands while over-predicting the highest band. It is
                strictly a relative index.
              </p>
            </div>
          </div>
        </div>

        {/* LAYER B: Rainfall Trigger (Rule-Based) */}
        <div className="rounded border border-sky-600/50 bg-[#0d1527] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-sky-500/20 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-400">
                  Layer B &middot; Empirical Meteorology
                </span>
                <h3 className="text-lg font-bold text-white font-sans mt-0.5">
                  Rainfall Trigger State
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-sky-300 bg-sky-950/60 border border-sky-500/40 px-2 py-0.5 rounded">
                Rule-Based
              </span>
            </div>

            <div className="text-xs font-mono text-slate-400 mb-3 italic">
              Core question: &ldquo;Are rainfall conditions intense or sustained enough?&rdquo;
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              Dynamic meteorological conditions evaluated against four empirical checks from regional
              Himalayan literature. Yields a categorical trigger state:{' '}
              <span className="font-mono text-sky-300 font-bold">LOW</span>,{' '}
              <span className="font-mono text-sky-300 font-bold">ELEVATED</span>, or{' '}
              <span className="font-mono text-sky-300 font-bold">HIGH</span>.
            </p>

            {/* 4 Checks list */}
            <div className="rounded border border-slate-800 bg-[#090e17] p-3 text-xs space-y-1.5 font-mono mb-4">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Four Hard Yes/No Checks:
              </div>
              <div className="text-slate-300 flex items-start gap-1.5">
                <span className="text-sky-400 shrink-0">1.</span>
                <span>1-day avg intensity vs Intensity&ndash;Duration curve</span>
              </div>
              <div className="text-slate-300 flex items-start gap-1.5">
                <span className="text-sky-400 shrink-0">2.</span>
                <span>3-day avg intensity vs Intensity&ndash;Duration curve</span>
              </div>
              <div className="text-slate-300 flex items-start gap-1.5">
                <span className="text-sky-400 shrink-0">3.</span>
                <span>7-day avg intensity vs Intensity&ndash;Duration curve</span>
              </div>
              <div className="text-slate-300 flex items-start gap-1.5">
                <span className="text-sky-400 shrink-0">4.</span>
                <span>30-day cumulative rainfall &gt; 110 mm</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                0 checks exceeded &rarr; LOW &nbsp;|&nbsp; 1 &rarr; ELEVATED &nbsp;|&nbsp; 2+ &rarr; HIGH
              </div>
            </div>

            {/* Explicit scientific disclosures */}
            <div className="rounded border border-sky-500/30 bg-sky-950/20 p-3 text-xs space-y-1 text-sky-200">
              <strong className="font-semibold text-sky-100 font-sans block">
                Same-State Empirical Reference:
              </strong>
              <p className="leading-relaxed">
                Derived from Singh et al. (2025, Shimla, Himachal Pradesh; DOI 10.1016/j.nhres.2024.12.004).
                This is a <strong className="text-white">same-state empirical reference, NOT calibrated specifically for Kullu or Mandi</strong>.
                Furthermore, the reference paper calibrated duration for discrete storm events; GeoShield
                applies rolling 1/3/7-day windows because its weather data is daily.
              </p>
            </div>
          </div>

          {/* Technical footnote */}
          <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            Intensity-Duration formula: <em>I</em> = 7.20 &times; <em>D</em><sup>&minus;0.26</sup> (where <em>I</em> in mm/day, <em>D</em> in days)
          </div>
        </div>
      </div>
    </section>
  );
}
