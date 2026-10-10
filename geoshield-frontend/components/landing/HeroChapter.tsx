'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ScrollReveal from './ScrollReveal';

export default function HeroChapter() {
  const [gridActive, setGridActive] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="chapter-1"
      aria-labelledby="hero-title"
      className="relative min-h-[94vh] flex flex-col justify-center pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#070b12] via-[#090e17] to-[#0a101d]"
    >
      {/* Background Ambience: Subtle Full-Width Topographic Contours (Parallax) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden"
        aria-hidden="true"
        style={{
          transform: `translateY(${Math.min(scrollY * 0.18, 120)}px)`,
        }}
      >
        <svg
          viewBox="0 0 1600 900"
          className="w-full h-full object-cover text-sky-400/30"
          preserveAspectRatio="none"
        >
          <path
            d="M-100,180 C300,90 600,420 1100,230 C1350,150 1550,300 1700,280"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <path
            d="M-50,260 C320,160 580,500 1080,320 C1300,240 1480,380 1650,360"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M0,340 C340,240 560,570 1060,410 C1280,330 1420,460 1600,440"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M50,420 C360,320 540,640 1040,500 C1260,420 1380,540 1550,520"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="6 6"
          />
          <path
            d="M100,500 C380,400 520,710 1020,590 C1240,510 1340,620 1500,600"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M150,580 C400,480 500,780 1000,680 C1220,600 1300,700 1450,680"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <line x1="200" y1="0" x2="200" y2="900" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="600" y1="0" x2="600" y2="900" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="1000" y1="0" x2="1000" y2="900" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="1400" y1="0" x2="1400" y2="900" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.3" />
        </svg>

        {/* Ambient atmospheric particle rain */}
        <div className="absolute inset-0 opacity-15 overflow-hidden">
          <div className="w-full h-full bg-[radial-gradient(#38bdf8_1.2px,transparent_1.2px)] [background-size:28px_56px] animate-pulse" />
        </div>
      </div>

      {/* Main Narrative Container (Max-Width 1360px Deliberate 2-Column Composition) */}
      <div className="relative max-w-7xl mx-auto w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column (55% narrative) */}
        <div className="lg:col-span-7 flex flex-col items-start">
          <ScrollReveal variant="fade-up" delay={0}>
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <h2 className="font-mono text-xs font-semibold text-sky-400 uppercase tracking-widest px-2.5 py-1 rounded border border-sky-400/30 bg-sky-950/40">
                Chapter 01 &middot; The Problem
              </h2>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                Kullu &middot; Mandi, Himachal Pradesh
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={80}>
            <h1
              id="hero-title"
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-normal tracking-tight text-white leading-[1.08] mb-6"
            >
              On a mountain slope, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-sky-300 to-slate-200 italic">
                rain is never just rain.
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={140}>
            <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-xl mb-8">
              In the rugged valleys of Kullu and Mandi, intense monsoons trigger devastating slope
              failures every season. Yet rainfall alone does not determine where the earth collapses.
              Steepness, fractured Himalayan bedrock, soil density, and road incisions dictate which slopes
              hold firm and which give way. GeoShield was engineered to separate intrinsic terrain
              susceptibility from dynamic weather triggers across a continuous 500&thinsp;m grid.
            </p>
          </ScrollReveal>

          {/* Key Study Area Dimensions (Authoritative Fact Sheet) */}
          <ScrollReveal variant="fade-up" delay={200} className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full p-4 rounded-lg border border-slate-800 bg-[#0d1527]/90 shadow-xl mb-8 backdrop-blur-xs">
              <div className="p-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Resolution</div>
                <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">500 &times; 500 m</div>
                <div className="text-[10px] text-slate-400">Regular spatial grid</div>
              </div>
              <div className="p-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Grid Domain</div>
                <div className="text-base sm:text-lg font-bold font-mono text-sky-300 mt-0.5">96,118</div>
                <div className="text-[10px] text-slate-400">257 cols &times; 374 rows</div>
              </div>
              <div className="p-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Bounding Box</div>
                <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">128 &times; 187 km</div>
                <div className="text-[10px] text-slate-400">Includes neighboring terrain</div>
              </div>
              <div className="p-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Elevation Range</div>
                <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">240 – 6,588 m</div>
                <div className="text-[10px] text-slate-400">NASADEM 30 m analysis</div>
              </div>
            </div>
          </ScrollReveal>

          {/* CTAs */}
          <ScrollReveal variant="fade-up" delay={260}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2.5 h-11 px-6 rounded-md border border-sky-400/50 bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm shadow-lg shadow-sky-950/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 group"
              >
                <span>Explore the Risk Map</span>
                <svg
                  className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>

              <a
                href="#chapter-2"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <span>Read the Story</span>
                <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </ScrollReveal>

          {/* Small attribution label */}
          <ScrollReveal variant="fade-up" delay={300}>
            <div className="mt-8 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>Topographic contours and particle rain are stylized and illustrative.</span>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column (45% Terrain & Grid Visualization) */}
        <div className="lg:col-span-5 w-full">
          <ScrollReveal variant="fade-left" delay={180}>
            <div className="relative rounded-xl border border-slate-800/90 bg-[#0d1527]/95 shadow-2xl p-4 sm:p-5 overflow-hidden backdrop-blur-sm">
              {/* Card Header with Technical Metadata */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-slate-200 font-semibold uppercase tracking-wider">
                    Terrain Model &middot; Kullu-Mandi
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setGridActive(!gridActive)}
                  className="rounded px-2 py-0.5 text-[11px] font-mono border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-sky-300 transition-colors"
                  aria-pressed={gridActive}
                >
                  {gridActive ? 'Grid: ON' : 'Grid: OFF'}
                </button>
              </div>

              {/* Large Stylized Mountain Cross-Section & Contour SVG */}
              <div className="relative w-full aspect-[4/3] rounded-lg bg-[#070b13] border border-slate-800 overflow-hidden flex items-center justify-center">
                <svg
                  viewBox="0 0 500 380"
                  className="w-full h-full text-slate-600"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#091322" />
                      <stop offset="100%" stopColor="#0a121e" />
                    </linearGradient>
                    <linearGradient id="peakGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#0f1f33" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="foreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
                    </linearGradient>
                    <linearGradient id="rainLine" x1="0" y1="0" x2="0.3" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <rect width="500" height="380" fill="url(#skyGrad)" />

                  {/* Distant Ridge line */}
                  <path
                    d="M 0,220 Q 80,140 160,180 T 320,110 T 420,150 L 500,130 L 500,380 L 0,380 Z"
                    fill="#111c2e"
                  />

                  {/* Mid-range Ridge */}
                  <path
                    d="M 0,260 Q 90,170 190,220 T 360,160 T 500,200 L 500,380 L 0,380 Z"
                    fill="url(#peakGrad)"
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeOpacity="0.3"
                  />

                  {/* Foreground Mountain Slope */}
                  <path
                    d="M 0,330 C 110,290 180,210 280,250 C 370,290 440,240 500,280 L 500,380 L 0,380 Z"
                    fill="url(#foreGrad)"
                    stroke="#64748b"
                    strokeWidth="1.2"
                  />

                  {/* Elevation contours along slope */}
                  <path
                    d="M 40,320 C 130,280 200,225 280,260 C 360,295 420,255 480,290"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                    strokeOpacity="0.6"
                  />
                  <path
                    d="M 20,345 C 110,310 180,250 270,280 C 360,315 430,280 500,310"
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                  />

                  {/* 500m Grid Mesh Overlay (Resolving) */}
                  {gridActive && (
                    <g className="transition-opacity duration-300" opacity="0.65">
                      {/* Vertical Grid Columns (500m projected) */}
                      {[60, 110, 160, 210, 260, 310, 360, 410, 460].map((x, i) => (
                        <line
                          key={`gx-${i}`}
                          x1={x}
                          y1="60"
                          x2={x}
                          y2="380"
                          stroke="#38bdf8"
                          strokeWidth="0.8"
                          strokeDasharray="2 4"
                          strokeOpacity={i === 4 ? '0.8' : '0.35'}
                        />
                      ))}
                      {/* Horizontal Grid Rows */}
                      {[120, 160, 200, 240, 280, 320, 360].map((y, j) => (
                        <line
                          key={`gy-${j}`}
                          x1="0"
                          y1={y}
                          x2="500"
                          y2={y}
                          stroke="#38bdf8"
                          strokeWidth="0.8"
                          strokeDasharray="2 4"
                          strokeOpacity={j === 3 ? '0.8' : '0.35'}
                        />
                      ))}

                      {/* Highlighted 500m Cell */}
                      <rect
                        x="210"
                        y="240"
                        width="50"
                        height="40"
                        fill="#38bdf8"
                        fillOpacity="0.18"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                      />
                      <circle cx="235" cy="260" r="3" fill="#38bdf8" />
                      <text
                        x="235"
                        y="232"
                        textAnchor="middle"
                        fill="#7dd3fc"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        500m Cell
                      </text>
                    </g>
                  )}

                  {/* Stylized Rain Streaks */}
                  <g opacity="0.45">
                    <line x1="80" y1="20" x2="95" y2="70" stroke="url(#rainLine)" strokeWidth="1" />
                    <line x1="140" y1="10" x2="155" y2="60" stroke="url(#rainLine)" strokeWidth="1.2" />
                    <line x1="220" y1="30" x2="235" y2="80" stroke="url(#rainLine)" strokeWidth="1" />
                    <line x1="320" y1="15" x2="335" y2="65" stroke="url(#rainLine)" strokeWidth="1.2" />
                    <line x1="410" y1="25" x2="425" y2="75" stroke="url(#rainLine)" strokeWidth="1" />
                    <line x1="180" y1="80" x2="195" y2="130" stroke="url(#rainLine)" strokeWidth="1" />
                    <line x1="280" y1="70" x2="295" y2="120" stroke="url(#rainLine)" strokeWidth="1" />
                    <line x1="380" y1="85" x2="395" y2="135" stroke="url(#rainLine)" strokeWidth="1" />
                  </g>

                  {/* Elevation Benchmark Annotations */}
                  <g fontSize="9" fontFamily="monospace" fill="#94a3b8">
                    <text x="18" y="370">240 m</text>
                    <text x="315" y="105" fill="#e2e8f0" fontWeight="bold">6,588 m (Ridge)</text>
                    <text x="430" y="270">NASADEM 30m</text>
                  </g>
                </svg>

                {/* Conceptual Watermark Overlay */}
                <div className="absolute bottom-2 right-2.5 rounded bg-slate-900/80 px-2 py-0.5 border border-slate-700/60 text-[9px] font-mono text-slate-400">
                  Conceptual cross-section &middot; Illustrative
                </div>
              </div>

              {/* Technical Caption Box */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Domain: 257 cols &times; 374 rows</span>
                <span className="text-sky-300 font-semibold">96,118 cells</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
