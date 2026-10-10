'use client';

import React from 'react';

export interface ChapterMeta {
  id: string;
  number: string;
  title: string;
  label: string;
}

export const CHAPTERS: ChapterMeta[] = [
  { id: 'chapter-1', number: '01', title: 'The Problem', label: 'Terrain & Rainfall' },
  { id: 'chapter-2', number: '02', title: 'Why Landslides Happen', label: 'Slope Mechanics' },
  { id: 'chapter-3', number: '03', title: 'Understanding the Landscape', label: '12 Model Features' },
  { id: 'chapter-4', number: '04', title: 'The Temporal Blindspot', label: 'Methodological Pivot' },
  { id: 'chapter-5', number: '05', title: 'The Two-Layer Solution', label: 'Decoupled Architecture' },
  { id: 'chapter-6', number: '06', title: 'How Layers Become Current Risk', label: '3×3 Risk Matrix' },
  { id: 'chapter-7', number: '07', title: 'See a What-If Scenario', label: 'Sensitivity Simulation' },
  { id: 'chapter-8', number: '08', title: 'What GeoShield Can & Cannot Tell You', label: 'System Limits' },
];

interface ChapterRailProps {
  activeChapterId: string;
  onSelectChapter?: (id: string) => void;
}

export default function ChapterRail({
  activeChapterId,
  onSelectChapter,
}: ChapterRailProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (onSelectChapter) {
      onSelectChapter(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      aria-label="Story chapter progression"
      className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-3 pointer-events-auto"
    >
      <div className="bg-[#0d1527]/90 border border-slate-800/80 backdrop-blur-md rounded-full px-2 py-3 flex flex-col items-center gap-2.5 shadow-xl">
        {CHAPTERS.map((ch) => {
          const isActive = activeChapterId === ch.id;
          return (
            <a
              key={ch.id}
              href={`#${ch.id}`}
              onClick={(e) => handleClick(e, ch.id)}
              aria-current={isActive ? 'step' : undefined}
              className="group relative flex items-center justify-center p-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              aria-label={`Chapter ${ch.number}: ${ch.title}`}
            >
              {/* Dot Indicator */}
              <span
                className={`block rounded-full transition-all duration-300 ${
                  isActive
                    ? 'h-4 w-1.5 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                    : 'h-1.5 w-1.5 bg-slate-600 group-hover:bg-slate-400 group-hover:scale-125'
                }`}
              />

              {/* Tooltip on hover / focus */}
              <div
                role="tooltip"
                className="absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 flex items-center gap-2 rounded border border-slate-700/90 bg-[#0d1527] px-2.5 py-1 text-xs shadow-2xl whitespace-nowrap"
              >
                <span className="font-mono text-[10px] text-sky-400 font-bold">{ch.number}</span>
                <span className="text-slate-200 font-medium">{ch.title}</span>
              </div>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
