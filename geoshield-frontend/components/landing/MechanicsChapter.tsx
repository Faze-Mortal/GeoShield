'use client';

import React, { useState } from 'react';

const MECHANIC_STAGES = [
  {
    step: 1,
    name: 'Stable Equilibrium',
    tag: 'Dry Terrain',
    desc: 'Under dry or drained conditions, gravitational driving forces on the slope face are countered by the internal friction and cohesion of the soil and rock matrix (Coulomb shear strength).',
    effectiveStress: 'Maximum (High friction)',
    porePressure: 'Low / Negative suction',
    stability: 'Stable (Safety factor > 1.0)',
    illustrationStyle: 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200',
  },
  {
    step: 2,
    name: 'Rainfall Infiltration',
    tag: 'Progressive Saturation',
    desc: 'Monsoon storms deliver sustained water volumes. Rain percolates downward through permeable colluvium, increasing overburden weight and migrating toward impermeable bedrock boundaries.',
    effectiveStress: 'Declining',
    porePressure: 'Rising toward saturation',
    stability: 'Marginal',
    illustrationStyle: 'bg-amber-950/30 border-amber-500/40 text-amber-200',
  },
  {
    step: 3,
    name: 'Pore-Water Buildup',
    tag: 'Effective Stress Loss',
    desc: 'When rainfall rate exceeds subsurface drainage capacity, water fills void pores. Positive pore-water pressure (u) physically buoys soil particles apart, reducing effective normal stress (σ′ = σ − u).',
    effectiveStress: 'Critically reduced',
    porePressure: 'Excess positive pressure',
    stability: 'Threshold imminent',
    illustrationStyle: 'bg-orange-950/30 border-orange-500/40 text-orange-200',
  },
  {
    step: 4,
    name: 'Shear Failure & Runoff',
    tag: 'Mass Downslope Release',
    desc: 'Mobilized shear stress overpowers diminished shear resistance. A slip surface forms along weak geological planes or cut slopes, cascading down the valley with intense surface runoff erosion.',
    effectiveStress: 'Overcome by driving shear',
    porePressure: 'Liquefaction / saturation point',
    stability: 'Active failure',
    illustrationStyle: 'bg-red-950/30 border-red-500/40 text-red-200',
  },
];

export default function MechanicsChapter() {
  const [activeStage, setActiveStage] = useState(0);
  const current = MECHANIC_STAGES[activeStage];

  return (
    <section
      id="chapter-2"
      aria-labelledby="mechanics-title"
      className="py-20 md:py-28 px-4 sm:px-6 max-w-5xl mx-auto w-full border-b border-slate-800/80"
    >
      {/* Chapter Marker */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-xs font-semibold text-sky-400 uppercase tracking-widest px-2 py-0.5 rounded border border-sky-400/30 bg-sky-950/40">
          Chapter 02 &middot; Mechanics
        </span>
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">
          Geotechnical Principles
        </span>
      </div>

      <h2
        id="mechanics-title"
        className="text-2xl sm:text-4xl font-serif text-white tracking-tight mb-4"
      >
        Why Landslides Happen: The Physics of Slope Failure
      </h2>

      <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-3xl">
        Slope failures in high-relief mountainous topography can involve complex combinations of debris
        flows, planar slides, and rotational slumps. While rainfall triggers individual events, geological
        steepness, soil mechanical composition, groundwater pathways, and anthropogenic modifications
        (such as road benching) govern which slopes are susceptible to collapse.
      </p>

      {/* Interactive Cross-Section Stage */}
      <div className="rounded border border-slate-800 bg-[#0d1527] p-5 sm:p-7 shadow-xl mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80 mb-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Interactive Cross-Section &middot; Conceptual Model
            </span>
            <div className="text-sm font-semibold text-white mt-0.5">
              Phase {current.step} of 4: {current.name}
            </div>
          </div>

          {/* Stepper controls */}
          <div className="flex items-center gap-1.5" role="group" aria-label="Slope failure phases">
            {MECHANIC_STAGES.map((s, idx) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStage(idx)}
                className={`h-8 px-3 rounded text-xs font-mono font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  activeStage === idx
                    ? 'bg-sky-600 text-white border border-sky-400'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
                aria-pressed={activeStage === idx}
              >
                Phase {s.step}
              </button>
            ))}
          </div>
        </div>

        {/* Stylized Cross-Section Diagram (SVG, labeled illustrative) */}
        <div className="relative w-full h-56 sm:h-64 rounded bg-[#090e17] border border-slate-800/90 overflow-hidden mb-6 flex items-center justify-center">
          <svg
            viewBox="0 0 600 240"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            aria-label="Conceptual mountain slope failure cross-section"
            role="img"
          >
            {/* Mountain bedrock wedge */}
            <path
              d="M 50 220 L 550 220 L 550 40 L 450 40 L 50 220 Z"
              fill="#131e33"
              stroke="#334155"
              strokeWidth="2"
            />
            {/* Colluvium / soil layer above bedrock */}
            <path
              d="M 50 220 L 450 40 L 470 40 L 70 220 Z"
              fill={activeStage >= 2 ? '#1e293b' : '#1e3a5f'}
              stroke="#64748b"
              strokeWidth="1.5"
            />

            {/* Road incision shelf */}
            <path
              d="M 230 140 L 270 140 L 270 155 L 230 155 Z"
              fill="#334155"
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <text x="280" y="150" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              Road Cut-Slope (OSM)
            </text>

            {/* Water table & Infiltration indicator */}
            {activeStage >= 1 && (
              <path
                d="M 120 188 C 220 145 320 100 420 55"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray={activeStage >= 2 ? 'none' : '4 4'}
              />
            )}

            {/* Dynamic Failure Slip Surface in Stage 3 and 4 */}
            {activeStage >= 2 && (
              <path
                d="M 160 170 Q 280 120 400 65"
                fill="none"
                stroke={activeStage === 3 ? '#dc2626' : '#ea580c'}
                strokeWidth={activeStage === 3 ? '3.5' : '2'}
                strokeDasharray="6 3"
              />
            )}

            {/* Labels */}
            <text x="70" y="210" fill="#64748b" fontSize="11" fontFamily="sans-serif">
              Bedrock Basement (NASADEM)
            </text>
            <text x="350" y="32" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              Crest (Elevation)
            </text>

            {/* Dynamic Status Callout in Diagram */}
            <g transform="translate(60, 25)">
              <rect
                width="200"
                height="45"
                rx="3"
                fill="#0d1527"
                stroke={activeStage === 3 ? '#dc2626' : '#38bdf8'}
                strokeWidth="1"
                fillOpacity="0.9"
              />
              <text x="10" y="18" fill="#cbd5e1" fontSize="10" fontFamily="monospace" fontWeight="bold">
                PORE PRESSURE (u):
              </text>
              <text
                x="10"
                y="34"
                fill={activeStage === 3 ? '#f87171' : '#38bdf8'}
                fontSize="11"
                fontFamily="sans-serif"
                fontWeight="bold"
              >
                {current.porePressure}
              </text>
            </g>
          </svg>

          {/* Illustrative disclaimer badge */}
          <span className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            Illustrative slope physics model
          </span>
        </div>

        {/* Phase Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Mechanics Summary
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">{current.desc}</p>
          </div>

          <div className="rounded border border-slate-800 bg-[#090e17] p-3 text-xs space-y-1.5 font-mono">
            <div>
              <span className="text-slate-500">Effective Stress: </span>
              <span className="text-slate-200 font-semibold">{current.effectiveStress}</span>
            </div>
            <div>
              <span className="text-slate-500">Slope State: </span>
              <span className="text-sky-300 font-semibold">{current.stability}</span>
            </div>
            <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/80">
              Terzaghi effective stress: σ′ = σ − u
            </div>
          </div>
        </div>
      </div>

      {/* MANDATORY VISIBLE DIVIDING LINE: General Science vs GeoShield Model */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-700/80" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#090e17] px-4 font-mono font-bold uppercase tracking-wider text-sky-400 border border-slate-700/90 rounded py-1">
            Separating General Landslide Science from GeoShield&apos;s Computational Design
          </span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="rounded border border-slate-800 bg-[#0d1527] p-4 text-xs space-y-2">
          <div className="font-mono font-semibold uppercase text-slate-400 tracking-wider">
            General Geotechnical Science
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">
            Assumes continuously monitored pore-water sensors, borehole core lithology, and
            micro-catchment drainage modeling across individual slope faces. Real-time factor-of-safety
            calculations require extensive physical field instrumentation that cannot scale across entire
            mountain ranges.
          </p>
        </div>

        <div className="rounded border border-sky-900/60 bg-[#0d1527] p-4 text-xs space-y-2">
          <div className="font-mono font-semibold uppercase text-sky-400 tracking-wider">
            What GeoShield&apos;s Model Uses
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">
            Because continuous subsurface sensor networks do not exist across Kullu and Mandi, GeoShield
            decouples the problem: an XGBoost ML model evaluates static topographic, geologic, and
            spatial susceptibility, while empirical multi-day antecedent rainfall thresholds assess
            the meteorological trigger state.
          </p>
        </div>
      </div>
    </section>
  );
}
