'use client';

import React, { useState } from 'react';
import ScrollReveal from './ScrollReveal';

const MECHANIC_STAGES = [
  {
    step: 1,
    name: 'Stable Equilibrium',
    tag: 'Dry Terrain',
    desc: 'Under dry or drained conditions, gravitational driving forces on the slope face are countered by the internal friction and cohesion of the soil and rock matrix (Coulomb shear strength).',
    effectiveStress: 'Maximum (High friction)',
    porePressure: 'Low / Negative suction',
    stability: 'Stable (Safety factor > 1.0)',
    saturationLevel: '15%',
    waterColor: '#0284c7',
  },
  {
    step: 2,
    name: 'Rainfall Infiltration',
    tag: 'Progressive Saturation',
    desc: 'Monsoon storms deliver sustained water volumes. Rain percolates downward through permeable colluvium, increasing overburden weight and migrating toward impermeable bedrock boundaries.',
    effectiveStress: 'Declining',
    porePressure: 'Rising toward saturation',
    stability: 'Marginal',
    saturationLevel: '55%',
    waterColor: '#38bdf8',
  },
  {
    step: 3,
    name: 'Pore-Water Buildup',
    tag: 'Effective Stress Loss',
    desc: 'When rainfall rate exceeds subsurface drainage capacity, water fills void pores. Positive pore-water pressure (u) physically buoys soil particles apart, reducing effective normal stress (σ′ = σ − u).',
    effectiveStress: 'Critically reduced',
    porePressure: 'Excess positive pressure',
    stability: 'Threshold imminent',
    saturationLevel: '88%',
    waterColor: '#f97316',
  },
  {
    step: 4,
    name: 'Shear Failure & Runoff',
    tag: 'Mass Downslope Release',
    desc: 'Mobilized shear stress overpowers diminished shear resistance. A slip surface forms along weak geological planes or cut slopes, cascading down the valley with intense surface runoff erosion.',
    effectiveStress: 'Overcome by driving shear',
    porePressure: 'Liquefaction / saturation point',
    stability: 'Active failure',
    saturationLevel: '100%',
    waterColor: '#dc2626',
  },
];

export default function MechanicsChapter() {
  const [activeStage, setActiveStage] = useState(0);
  const current = MECHANIC_STAGES[activeStage];

  return (
    <section
      id="chapter-2"
      aria-labelledby="mechanics-title"
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-b border-slate-800/80"
    >
      {/* 2-Column Alternating Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-16">
        {/* Left Column (Narrative & Stepper) */}
        <div className="lg:col-span-6 flex flex-col items-start">
          <ScrollReveal variant="fade-up" delay={0}>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-semibold text-sky-400 uppercase tracking-widest px-2.5 py-1 rounded border border-sky-400/30 bg-sky-950/40">
                Chapter 02 &middot; Mechanics
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                Geotechnical Principles
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={80}>
            <h2
              id="mechanics-title"
              className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight mb-5 leading-tight"
            >
              Why Landslides Happen: <br />
              <span className="text-slate-300 font-normal italic">The Physics of Slope Failure</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={140}>
            <p className="text-slate-300 text-base leading-relaxed mb-6 max-w-xl">
              Slope failures in high-relief mountainous topography can involve complex combinations of debris
              flows, planar slides, and rotational slumps. While rainfall triggers individual events, geological
              steepness, soil mechanical composition, groundwater pathways, and anthropogenic modifications
              (such as road benching) govern which slopes are susceptible to collapse.
            </p>
          </ScrollReveal>

          {/* Stepper controls */}
          <ScrollReveal variant="fade-up" delay={200} className="w-full">
            <div className="rounded-lg border border-slate-800 bg-[#0d1527] p-4 shadow-lg mb-6">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5">
                Slope Mechanics Stepper (Click to inspect phases)
              </div>
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Slope failure phases">
                {MECHANIC_STAGES.map((s, idx) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setActiveStage(idx)}
                    className={`h-9 px-3.5 rounded text-xs font-mono font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                      activeStage === idx
                        ? 'bg-sky-600 text-white border border-sky-400 shadow-md shadow-sky-950'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                    aria-pressed={activeStage === idx}
                  >
                    Phase {s.step}: {s.name}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Active Phase Details */}
          <ScrollReveal variant="fade-up" delay={260} className="w-full">
            <div className="rounded-lg border border-slate-800 bg-[#0d1527] p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">
                  Phase {current.step} Analysis: {current.tag}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Saturation: <strong className="text-white">{current.saturationLevel}</strong>
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans mb-4">
                {current.desc}
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-3 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-400">Effective Stress: </span>
                  <div className="text-slate-100 font-semibold mt-0.5">{current.effectiveStress}</div>
                </div>
                <div>
                  <span className="text-slate-400">Pore Pressure (u): </span>
                  <div className="text-sky-300 font-semibold mt-0.5">{current.porePressure}</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column (Expanded Visual Cross-Section) */}
        <div className="lg:col-span-6 w-full">
          <ScrollReveal variant="fade-right" delay={180}>
            <div className="relative rounded-xl border border-slate-800 bg-[#0d1527] p-5 sm:p-6 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  <span className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
                    Physical Cross-Section &middot; Illustrative Model
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Phase {current.step} / 4
                </span>
              </div>

              {/* Large Cross-Section SVG Diagram */}
              <div className="relative w-full aspect-[16/11] rounded-lg bg-[#070b13] border border-slate-800/90 overflow-hidden flex items-center justify-center">
                <svg
                  viewBox="0 0 600 360"
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMid meet"
                  aria-label="Conceptual mountain slope failure cross-section"
                  role="img"
                >
                  <defs>
                    <linearGradient id="bedrockGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#334155" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>
                  </defs>

                  {/* Bedrock Basement */}
                  <path
                    d="M 50,330 L 550,330 L 550,60 L 450,60 L 50,330 Z"
                    fill="url(#bedrockGrad)"
                    stroke="#475569"
                    strokeWidth="2"
                  />

                  {/* Colluvial Overburden Layer */}
                  <path
                    d="M 50,330 L 450,60 L 480,60 L 80,330 Z"
                    fill={activeStage >= 2 ? '#24344d' : 'url(#soilGrad)'}
                    stroke="#64748b"
                    strokeWidth="1.5"
                  />

                  {/* Road Cut-Slope Incision (OSM Anthropogenic Feature) */}
                  <path
                    d="M 230,210 L 280,210 L 280,230 L 230,230 Z"
                    fill="#334155"
                    stroke="#94a3b8"
                    strokeWidth="1.2"
                  />
                  <text x="290" y="222" fill="#94a3b8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    Road Cut-Slope (OSM)
                  </text>

                  {/* Rain Stream Vectors in Phase 2, 3, 4 */}
                  {activeStage >= 1 && (
                    <g opacity="0.8">
                      {[120, 180, 240, 300, 360, 420].map((rx, idx) => (
                        <line
                          key={`rain-${idx}`}
                          x1={rx}
                          y1="20"
                          x2={rx - 15}
                          y2="70"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                        />
                      ))}
                    </g>
                  )}

                  {/* Descending Infiltration Boundary (Water Table) */}
                  {activeStage >= 1 && (
                    <path
                      d="M 110,290 C 220,225 330,150 440,80"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                      strokeDasharray={activeStage >= 2 ? 'none' : '6 4'}
                    />
                  )}

                  {/* Failure Slip Surface Plane in Phase 3 and 4 */}
                  {activeStage >= 2 && (
                    <g>
                      <path
                        d="M 140,270 Q 280,190 410,95"
                        fill="none"
                        stroke={activeStage === 3 ? '#dc2626' : '#ea580c'}
                        strokeWidth={activeStage === 3 ? '4' : '2.5'}
                        strokeDasharray="8 4"
                      />
                      {activeStage === 3 && (
                        <path
                          d="M 250,230 L 220,260 L 235,265 Z"
                          fill="#dc2626"
                        />
                      )}
                    </g>
                  )}

                  {/* Geological Annotation Labels */}
                  <text x="70" y="320" fill="#64748b" fontSize="12" fontFamily="sans-serif">
                    Bedrock Basement (NASADEM)
                  </text>
                  <text x="350" y="50" fill="#cbd5e1" fontSize="12" fontFamily="sans-serif">
                    Mountain Crest (Elevation)
                  </text>

                  {/* Callout Box on Top Left */}
                  <g transform="translate(30, 30)">
                    <rect
                      width="230"
                      height="60"
                      rx="4"
                      fill="#0d1527"
                      stroke={activeStage === 3 ? '#dc2626' : '#38bdf8'}
                      strokeWidth="1.2"
                      fillOpacity="0.95"
                    />
                    <text x="12" y="24" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      PORE-WATER PRESSURE (u):
                    </text>
                    <text
                      x="12"
                      y="46"
                      fill={activeStage === 3 ? '#f87171' : '#38bdf8'}
                      fontSize="13"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                    >
                      {current.porePressure}
                    </text>
                  </g>
                </svg>

                {/* Conceptual Watermark */}
                <div className="absolute bottom-2.5 right-3 rounded bg-slate-900/80 px-2 py-0.5 border border-slate-700/60 text-[10px] font-mono text-slate-400">
                  Illustrative slope physics model &middot; Not a specific slope
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Terzaghi Effective Stress: σ′ = σ − u</span>
                <span className="text-sky-300">Coulomb Shear Criterion</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* MANDATORY VISIBLE DIVIDING LINE: General Science vs GeoShield Model */}
      <ScrollReveal variant="fade-up" delay={100} className="w-full">
        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#090e17] px-5 py-1.5 font-mono font-bold uppercase tracking-wider text-sky-400 border border-slate-700 rounded-md shadow-md">
              Separating General Landslide Science from GeoShield&apos;s Computational Design
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ScrollReveal variant="fade-left" delay={150}>
          <div className="rounded-lg border border-slate-800 bg-[#0d1527] p-6 text-xs space-y-3 h-full shadow-lg">
            <div className="font-mono font-semibold uppercase text-slate-300 tracking-wider text-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              General Geotechnical Science
            </div>
            <p className="text-slate-300 leading-relaxed font-sans text-sm">
              Assumes continuously monitored pore-water sensors, borehole core lithology, and
              micro-catchment drainage modeling across individual slope faces. Real-time factor-of-safety
              calculations require extensive physical field instrumentation that cannot scale across entire
              mountain ranges.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-right" delay={200}>
          <div className="rounded-lg border border-sky-900/60 bg-[#0d1527] p-6 text-xs space-y-3 h-full shadow-lg">
            <div className="font-mono font-semibold uppercase text-sky-400 tracking-wider text-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              What GeoShield&apos;s Model Uses
            </div>
            <p className="text-slate-300 leading-relaxed font-sans text-sm">
              Because continuous subsurface sensor networks do not exist across Kullu and Mandi, GeoShield
              decouples the problem: an XGBoost ML model evaluates static topographic, geologic, and
              spatial susceptibility, while empirical multi-day antecedent rainfall thresholds assess
              the meteorological trigger state.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
