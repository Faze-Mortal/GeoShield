'use client';

import React, { useState } from 'react';
import { RISK_LEVELS, RISK_STYLES, type RiskStyle } from '@/lib/risk';

export default function MapLegend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-6 left-4 z-10 font-sans">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="mb-1 flex items-center gap-1.5 rounded border border-slate-700/60 bg-[#0d1527]/95 px-2.5 py-1 text-[11px] font-medium tracking-wide text-slate-300 backdrop-blur-md hover:bg-slate-800 transition-colors md:hidden"
        aria-label={collapsed ? 'Show legend' : 'Hide legend'}
      >
        <span>Risk Legend</span>
        <span className="text-[9px] text-slate-400">{collapsed ? '▲' : '▼'}</span>
      </button>

      <div
        className={`${
          collapsed ? 'hidden md:block' : 'block'
        } rounded border border-slate-700/70 bg-[#0d1527]/95 p-3 backdrop-blur-md shadow-lg transition-all min-w-[155px]`}
      >
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Current Risk
          </span>
          <span className="text-[9px] font-mono text-slate-500">6 Levels</span>
        </div>

        <ul className="space-y-1.5">
          {RISK_LEVELS.map((level) => {
            const style: RiskStyle = RISK_STYLES[level];
            return (
              <li key={level} className="flex items-center gap-2 text-[11px] text-slate-300">
                <span
                  className="inline-block h-2.5 w-3.5 shrink-0 rounded-xs border border-white/10"
                  style={{ backgroundColor: style.color }}
                  aria-hidden="true"
                />
                <span className="font-medium text-slate-200">{style.label}</span>
              </li>
            );
          })}
        </ul>

        <p className="mt-2.5 border-t border-slate-800/80 pt-1.5 text-[9px] leading-tight text-slate-400">
          Susceptibility ML &times; Rainfall Trigger
        </p>
      </div>
    </div>
  );
}
