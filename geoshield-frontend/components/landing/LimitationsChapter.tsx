'use client';

import React from 'react';
import Link from 'next/link';
import ScrollReveal from './ScrollReveal';

export default function LimitationsChapter() {
  return (
    <section
      id="chapter-8"
      aria-labelledby="limitations-title"
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
    >
      {/* Chapter Marker */}
      <ScrollReveal variant="fade-up" delay={0}>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-xs font-semibold text-sky-400 uppercase tracking-widest px-2.5 py-1 rounded border border-sky-400/30 bg-sky-950/40">
            Chapter 08 &middot; Scientific Boundaries
          </span>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
            Trust &amp; Operational Truth
          </span>
        </div>
      </ScrollReveal>

      <ScrollReveal variant="fade-up" delay={80}>
        <h2
          id="limitations-title"
          className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight mb-5 leading-tight"
        >
          What GeoShield Can and Cannot Tell You
        </h2>
      </ScrollReveal>

      <ScrollReveal variant="fade-up" delay={140}>
        <p className="text-slate-300 text-base leading-relaxed mb-12 max-w-3xl font-sans">
          In natural hazard engineering, true trustworthiness comes from radical transparency regarding
          what a model knows and what it cannot know. The assumptions and physical boundaries of GeoShield
          are documented below.
        </p>
      </ScrollReveal>

      {/* Structured Limitations Cards (Wide 3-Column Grid on Large Screens) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
        <ScrollReveal variant="fade-up" delay={160}>
          <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-5 sm:p-6 text-xs space-y-2.5 h-full shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-slate-100 font-bold font-sans text-sm mb-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
                <span>Susceptibility Score Is Not a Probability</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans text-xs sm:text-sm">
                The score is a 0–100 relative spatial index ranking terrain vulnerability against known
                historical inventory patterns. It is not an occurrence probability, percentage chance, or
                statistical odds of failure.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80">
              Sample enrichment (~20% vs 0.9% incidence)
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={200}>
          <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-5 sm:p-6 text-xs space-y-2.5 h-full shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-slate-100 font-bold font-sans text-sm mb-1">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shrink-0" aria-hidden="true" />
                <span>Rainfall Data Is an Observational Snapshot</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans text-xs sm:text-sm">
                Precipitation inputs represent a static historical weather snapshot as of{' '}
                <strong className="text-white">2026-09-12</strong>. GeoShield is not connected to a live
                radar feed and does not present real-time streaming rainfall.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80">
              Snapshot benchmark: 2026-09-12
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={240}>
          <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-5 sm:p-6 text-xs space-y-2.5 h-full shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-slate-100 font-bold font-sans text-sm mb-1">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shrink-0" aria-hidden="true" />
                <span>Simulation Is a What-If, Not a Forecast</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans text-xs sm:text-sm">
                The simulation slider tests slope sensitivity under hypothetical precipitation deltas (+10%,
                +20%, +30%). It is an analytical diagnostic tool, not a meteorological forecast of incoming
                weather systems.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80">
              Diagnostic what-if scenario testing
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={280}>
          <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-5 sm:p-6 text-xs space-y-2.5 h-full shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-slate-100 font-bold font-sans text-sm mb-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
                <span>Rainfall Thresholds Are Not Locally Calibrated</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans text-xs sm:text-sm">
                Trigger criteria originate from Singh et al. (2025, Shimla, HP). While geographically within
                Himachal Pradesh, the thresholds are not individually calibrated for Kullu or Mandi micro-catchments.
                Rolling 1, 3, and 7-day windows represent an operationalization of daily records.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80">
              Shimla empirical baseline reference
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={320}>
          <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-5 sm:p-6 text-xs space-y-2.5 h-full shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-slate-100 font-bold font-sans text-sm mb-1">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400 shrink-0" aria-hidden="true" />
                <span>Inventory Reporting &amp; Survey Bias</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans text-xs sm:text-sm">
                The strong influence of road proximity reflects both genuine toe-cutting destabilization and
                human reporting bias—landslides along highways are documented far more frequently than slides
                on remote high-altitude peaks. Unmapped terrain may possess lower baseline inventory fidelity.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80">
              GSI inventory reporting bias acknowledged
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={360}>
          <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-5 sm:p-6 text-xs space-y-2.5 h-full shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-slate-100 font-bold font-sans text-sm mb-1">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400 shrink-0" aria-hidden="true" />
                <span>Sparse Point Assignment &amp; Box Extent</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans text-xs sm:text-sm">
                Rainfall (21 points) and SoilGrids (19 points) are assigned to the nearest grid cell (up to 34.7&thinsp;km
                and 48.5&thinsp;km away). The 128&thinsp;km &times; 187&thinsp;km grid boundary is a rectangular
                box encompassing both districts and overshoots into neighboring terrain.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80">
              Nearest-neighbor assignment constraint
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Climax Call-to-Action (Echoing Hero Contours) */}
      <ScrollReveal variant="scale-in" delay={200}>
        <div className="relative rounded-2xl border border-sky-500/40 bg-gradient-to-b from-[#0d1527] via-[#090e17] to-[#070b13] p-8 sm:p-14 shadow-2xl text-center mb-16 overflow-hidden">
          {/* Subtle Background Contours in CTA */}
          <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden" aria-hidden="true">
            <svg viewBox="0 0 1200 400" className="w-full h-full object-cover text-sky-400" preserveAspectRatio="none">
              <path d="M 0,300 Q 300,150 600,250 T 1200,200" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M 0,350 Q 350,200 700,300 T 1200,260" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" />
            </svg>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-4xl lg:text-5xl font-serif text-white mb-4">
              Explore GeoShield
            </h3>
            <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed font-sans">
              Navigate 96,118 spatial cells across Kullu and Mandi. Inspect local susceptibility scores, examine
              regional rainfall triggers, and test what-if scenarios in the live interactive map.
            </p>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2.5 h-12 px-8 rounded-lg border border-sky-400 bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm shadow-xl shadow-sky-950/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 group"
            >
              <span>Open the Operational Map</span>
              <svg className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* Data Attributions & Sources Block */}
      <div className="pt-8 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Scientific Data Attributions &amp; References
          </div>
          <a
            href="#chapter-1"
            className="text-xs text-sky-400 hover:text-sky-300 font-mono transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 rounded px-1"
          >
            <span>&uarr; Back to top</span>
          </a>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-400 font-mono">
          <li className="flex items-center gap-2">
            <span className="text-sky-500 font-bold">&bull;</span>
            <span>NASADEM 30 m via OpenTopography</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-sky-500 font-bold">&bull;</span>
            <span>GSI Bhusanket landslide inventory</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-sky-500 font-bold">&bull;</span>
            <span>Open-Meteo Historical Weather API</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-sky-500 font-bold">&bull;</span>
            <span>SoilGrids (ISRIC)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-sky-500 font-bold">&bull;</span>
            <span>&copy; OpenStreetMap contributors</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-sky-500 font-bold">&bull;</span>
            <span>WorldPop (100 m resolution, 2020)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-sky-500 font-bold">&bull;</span>
            <span>Copernicus Sentinel-2 (Scene 2026-03-09)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-sky-500 font-bold">&bull;</span>
            <span>Singh et al. (2025), DOI 10.1016/j.nhres.2024.12.004</span>
          </li>
        </ul>

        <div className="mt-8 pt-4 border-t border-slate-900 text-center text-[11px] text-slate-500 font-mono">
          GeoShield &middot; Two-Layer Landslide Hazard Intelligence &middot; Kullu &amp; Mandi, Himachal Pradesh
        </div>
      </div>
    </section>
  );
}
