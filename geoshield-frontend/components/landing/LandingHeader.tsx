'use client';

import React from 'react';
import Link from 'next/link';

interface LandingHeaderProps {
  progress?: number;
}

export default function LandingHeader({ progress = 0 }: LandingHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#090e17]/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      {/* Mobile scroll progress line */}
      <div
        className="h-0.5 bg-sky-400 transition-all duration-150 md:hidden"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
        {/* Wordmark */}
        <Link
          href="#chapter-1"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded py-1 px-1 -mx-1"
          aria-label="GeoShield homepage top"
        >
          <div className="h-6 w-6 rounded border border-sky-400/50 bg-sky-950/60 flex items-center justify-center text-sky-400 group-hover:border-sky-400 transition-colors">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider uppercase text-white font-sans">
              GeoShield
            </span>
            <span className="text-[10px] text-slate-400 font-sans tracking-tight hidden sm:inline">
              Kullu &middot; Mandi, HP
            </span>
          </div>
        </Link>

        {/* Navigation & CTAs */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/dashboard"
            className="text-xs text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 rounded px-1.5 py-1"
            title="Jump directly to the operational map"
          >
            Skip to the map &rarr;
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 h-8 rounded border border-sky-400/40 bg-sky-600 hover:bg-sky-500 text-white px-3 text-xs font-medium shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <span>Explore the Risk Map</span>
            <svg
              className="h-3 w-3"
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
        </div>
      </div>
    </header>
  );
}
