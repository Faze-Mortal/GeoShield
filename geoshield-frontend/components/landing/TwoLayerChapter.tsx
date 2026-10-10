'use client';

import React from 'react';
import ScrollReveal from './ScrollReveal';

export default function TwoLayerChapter() {
  return (
    <section
      id="chapter-5"
      aria-labelledby="twolayer-title"
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-b border-slate-800/80"
    >
      {/* Chapter Marker */}
      <ScrollReveal variant="fade-up" delay={0}>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-xs font-semibold text-sky-400 uppercase tracking-widest px-2.5 py-1 rounded border border-sky-400/30 bg-sky-950/40">
            Chapter 05 &middot; Framework
          </span>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
            Decoupled Risk Architecture
          </span>
        </div>
      </ScrollReveal>

      <ScrollReveal variant="fade-up" delay={80}>
        <h2
          id="twolayer-title"
          className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight mb-5 leading-tight"
        >
          The Two-Layer Solution: <br />
          <span className="text-slate-300 font-normal italic">Decoupling Terrain Predisposition from Meteorological Triggers</span>
        </h2>
      </ScrollReveal>

      <ScrollReveal variant="fade-up" delay={140}>
        <p className="text-slate-300 text-base leading-relaxed mb-12 max-w-3xl font-sans">
          By separating intrinsic geo-environmental predisposition from transient meteorological stress,
          GeoShield provides operational clarity: each layer answers an entirely distinct physical
          question with explicit empirical boundaries.
        </p>
      </ScrollReveal>

      {/* Wide Layer Composition (Layer A from Left, Layer B from Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* LAYER A: Susceptibility (Static ML) - Earth / Stone Ramps */}
        <ScrollReveal variant="fade-left" delay={160}>
          <div className="rounded-xl border border-amber-600/50 bg-[#0d1527] p-6 sm:p-7 shadow-2xl flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-4">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400">
                    Layer A &middot; Spatial Machine Learning
                  </span>
                  <h3 className="text-xl font-bold text-white font-sans mt-0.5">
                    Susceptibility Score
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2.5 py-1 rounded">
                  Static (0 – 100)
                </span>
              </div>

              <div className="text-sm font-mono text-amber-200/90 mb-4 italic">
                Core question: &ldquo;Where is the terrain prone?&rdquo;
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-5 font-sans">
                An XGBoost model trained on 12 static topographic, geologic, and infrastructure features.
                Calculates a static relative terrain index from 0 to 100 per cell that{' '}
                <strong className="text-amber-200">never changes with rainfall</strong>.
              </p>

              {/* Bins definition */}
              <div className="rounded-lg border border-slate-800 bg-[#070b13] p-4 text-xs space-y-2 font-mono mb-5 shadow-inner">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Round-Number Bins:
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Low:</span>
                  <span className="text-amber-300 font-semibold">Below 33</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Moderate:</span>
                  <span className="text-amber-300 font-semibold">33 to below 66</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>High:</span>
                  <span className="text-amber-300 font-semibold">66 and above</span>
                </div>
              </div>

              {/* Mandatory scientific explanation: Why not a probability */}
              <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4 text-xs sm:text-sm space-y-1.5 text-amber-200">
                <strong className="font-semibold text-amber-100 font-sans block">
                  Why It Is Not a Probability:
                </strong>
                <p className="leading-relaxed font-sans">
                  The training sample was enriched to ~20% positives, whereas real-world prevalence across
                  the grid is only ~0.9% (872 positive cells out of 96,118). Raw model scores reflect this
                  synthetic balance. Furthermore, calibration audits show observed event frequencies
                  exceed predicted scores in low-to-mid bands while over-predicting the highest band. It is
                  strictly a relative index.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
              Input: 12 Static Geo-Environmental Features &middot; Spatial Holdout Validation
            </div>
          </div>
        </ScrollReveal>

        {/* LAYER B: Rainfall Trigger (Rule-Based) - Cool Azure Ramps */}
        <ScrollReveal variant="fade-right" delay={200}>
          <div className="rounded-xl border border-sky-600/50 bg-[#0d1527] p-6 sm:p-7 shadow-2xl flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-sky-500/20 mb-4">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-sky-400">
                    Layer B &middot; Empirical Meteorology
                  </span>
                  <h3 className="text-xl font-bold text-white font-sans mt-0.5">
                    Rainfall Trigger State
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-sky-300 bg-sky-950/70 border border-sky-500/40 px-2.5 py-1 rounded">
                  Rule-Based
                </span>
              </div>

              <div className="text-sm font-mono text-sky-200/90 mb-4 italic">
                Core question: &ldquo;Are rainfall conditions intense or sustained enough?&rdquo;
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-5 font-sans">
                Dynamic meteorological conditions evaluated against four empirical checks from regional
                Himalayan literature. Yields a categorical trigger state:{' '}
                <span className="font-mono text-sky-300 font-bold">LOW</span>,{' '}
                <span className="font-mono text-sky-300 font-bold">ELEVATED</span>, or{' '}
                <span className="font-mono text-sky-300 font-bold">HIGH</span>.
              </p>

              {/* 4 Checks list */}
              <div className="rounded-lg border border-slate-800 bg-[#070b13] p-4 text-xs space-y-2 font-mono mb-5 shadow-inner">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Four Hard Yes/No Checks:
                </div>
                <div className="text-slate-300 flex items-start gap-2">
                  <span className="text-sky-400 font-bold shrink-0">1.</span>
                  <span>1-day avg intensity vs Intensity&ndash;Duration curve</span>
                </div>
                <div className="text-slate-300 flex items-start gap-2">
                  <span className="text-sky-400 font-bold shrink-0">2.</span>
                  <span>3-day avg intensity vs Intensity&ndash;Duration curve</span>
                </div>
                <div className="text-slate-300 flex items-start gap-2">
                  <span className="text-sky-400 font-bold shrink-0">3.</span>
                  <span>7-day avg intensity vs Intensity&ndash;Duration curve</span>
                </div>
                <div className="text-slate-300 flex items-start gap-2">
                  <span className="text-sky-400 font-bold shrink-0">4.</span>
                  <span>30-day cumulative rainfall &gt; 110 mm</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  0 checks exceeded &rarr; LOW &nbsp;|&nbsp; 1 &rarr; ELEVATED &nbsp;|&nbsp; 2+ &rarr; HIGH
                </div>
              </div>

              {/* Explicit scientific disclosures */}
              <div className="rounded-lg border border-sky-500/30 bg-sky-950/20 p-4 text-xs sm:text-sm space-y-1.5 text-sky-200">
                <strong className="font-semibold text-sky-100 font-sans block">
                  Same-State Empirical Reference:
                </strong>
                <p className="leading-relaxed font-sans">
                  Derived from Singh et al. (2025, Shimla, Himachal Pradesh; DOI 10.1016/j.nhres.2024.12.004).
                  This is a <strong className="text-white">same-state empirical reference, NOT calibrated specifically for Kullu or Mandi</strong>.
                  Furthermore, the reference paper calibrated duration for discrete storm events; GeoShield
                  applies rolling 1/3/7-day windows because its weather data is daily.
                </p>
              </div>
            </div>

            {/* Technical footnote */}
            <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
              Intensity-Duration formula: <em>I</em> = 7.20 &times; <em>D</em><sup>&minus;0.26</sup> (where <em>I</em> in mm/day, <em>D</em> in days)
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Layer Convergence Diagram to Chapter 6 */}
      <ScrollReveal variant="fade-up" delay={240}>
        <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-5 text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="text-amber-400 font-bold">Layer A (Terrain Predisposition)</span>
            <span>+</span>
            <span className="text-sky-400 font-bold">Layer B (Rainfall Triggers)</span>
            <span>&rarr;</span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">Current Risk (3&times;3 Matrix)</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Neither layer alone assigns risk. In the next chapter, see how these independent axes combine to establish operational priority.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
