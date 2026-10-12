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

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-14 sm:h-14 py-1.5 sm:py-0 flex items-center justify-between gap-2">
        {/* Wordmark */}
        <Link
          href="#chapter-1"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded py-1 px-1 -mx-1 shrink-0"
          aria-label="GeoShield homepage top"
        >
          <div className="h-6 w-6 rounded border border-sky-400/50 bg-sky-950/60 flex items-center justify-center text-sky-400 group-hover:border-sky-400 transition-colors shrink-0">
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
        <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-5 shrink-0">
          <a
            href="#how-layers-become-current-risk"
            onClick={(e) => {
              const target = document.getElementById('how-layers-become-current-risk');
              if (target) {
                e.preventDefault();
                const prefersReducedMotion =
                  typeof window !== 'undefined' &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                target.scrollIntoView({
                  behavior: prefersReducedMotion ? 'auto' : 'smooth',
                  block: 'start',
                });
                window.history.pushState(null, '', '#how-layers-become-current-risk');
              }
            }}
            className="text-[11px] sm:text-xs text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 rounded px-1.5 py-0.5 sm:py-1 whitespace-nowrap"
            title="Jump to the How the Layers Become Current Risk section"
          >
            <span>Explore How Risk Is Calculated</span>
            <span aria-hidden="true"> &rarr;</span>
          </a>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-1.5 min-h-[28px] sm:h-8 rounded border border-sky-400/40 bg-sky-600 hover:bg-sky-500 text-white px-2.5 sm:px-3 py-1 sm:py-0 text-[11px] sm:text-xs font-medium shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 whitespace-nowrap"
          >
            <span>Explore the Risk Map</span>
            <svg
              className="h-3 w-3 shrink-0"
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
