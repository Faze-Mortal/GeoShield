'use client';

import React from 'react';
import Link from 'next/link';

export default function HeroChapter() {
  return (
    <section
      id="chapter-1"
      aria-labelledby="hero-title"
      className="relative min-h-[92vh] flex flex-col justify-center pt-24 pb-16 px-4 sm:px-6 overflow-hidden border-b border-slate-800/80"
    >
      {/* Background: Procedural SVG Topographic Contours (Illustrative) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 900"
          className="w-full h-full object-cover text-sky-400/30"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="contourGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Concentric curved contour lines */}
          <path
            d="M-100,200 C300,100 600,450 1100,250 C1300,170 1500,320 1600,300"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <path
            d="M-50,280 C320,180 580,520 1080,340 C1280,260 1450,400 1550,380"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M0,360 C340,260 560,590 1060,430 C1260,350 1400,480 1500,460"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M50,440 C360,340 540,660 1040,520 C1240,440 1350,560 1450,540"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="6 6"
          />
          <path
            d="M100,520 C380,420 520,730 1020,610 C1220,530 1300,640 1400,620"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M150,600 C400,500 500,800 1000,700 C1200,620 1250,720 1350,700"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          {/* Subtle grid ticks */}
          <line x1="200" y1="0" x2="200" y2="900" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1="600" y1="0" x2="600" y2="900" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1="1000" y1="0" x2="1000" y2="900" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
        </svg>

        {/* Rain particles (CSS animation, disabled on reduced motion) */}
        <div className="absolute inset-0 opacity-15 overflow-hidden">
          <div className="w-full h-full bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_48px] animate-pulse" />
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto w-full z-10 flex flex-col items-start">
        {/* Chapter marker */}
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-mono text-xs font-semibold text-sky-400 uppercase tracking-widest px-2 py-0.5 rounded border border-sky-400/30 bg-sky-950/40">
            Chapter 01 &middot; The Problem
          </h2>
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">
            Kullu &middot; Mandi, Himachal Pradesh
          </span>
        </div>

        {/* Semantic H1 Headline */}
        <h1
          id="hero-title"
          className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-white leading-[1.08] mb-6"
        >
          On a mountain slope, <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-sky-300 to-slate-200 italic">
            rain is never just rain.
          </span>
        </h1>

        {/* Narrative Lead */}
        <p className="text-base sm:text-xl text-slate-300 font-sans leading-relaxed max-w-3xl mb-8">
          In the rugged valleys of Kullu and Mandi, intense monsoons trigger devastating slope
          failures every season. Yet rainfall alone does not determine where the earth collapses.
          Steepness, fractured Himalayan bedrock, soil density, and road incisions dictate which slopes
          hold firm and which give way. GeoShield was engineered to separate intrinsic terrain
          susceptibility from dynamic weather triggers across a continuous 500&thinsp;m grid.
        </p>

        {/* Key Study Area Dimensions (Authoritative Fact Sheet) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full p-4 rounded border border-slate-800 bg-[#0d1527]/90 shadow-xl mb-10">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Resolution</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">500 &times; 500 m</div>
            <div className="text-[10px] text-slate-400">Regular spatial grid</div>
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Grid Domain</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-sky-300 mt-0.5">96,118</div>
            <div className="text-[10px] text-slate-400">257 cols &times; 374 rows</div>
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Bounding Box</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">128 &times; 187 km</div>
            <div className="text-[10px] text-slate-400">Includes neighboring terrain</div>
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Elevation Range</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">240 – 6,588 m</div>
            <div className="text-[10px] text-slate-400">NASADEM 30 m analysis</div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded border border-sky-400/50 bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <span>Explore the Risk Map</span>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>

          <a
            href="#chapter-2"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
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

        {/* Small attribution label */}
        <div className="mt-8 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400/80" />
          <span>Topographic contours and particle rain are stylized and illustrative.</span>
        </div>
      </div>
    </section>
  );
}
