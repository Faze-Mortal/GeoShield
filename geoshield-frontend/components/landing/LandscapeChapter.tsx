'use client';

import React, { useState } from 'react';
import ScrollReveal from './ScrollReveal';

// The exact 12 model features (Fact Sheet authoritative specification)
const MODEL_FEATURES = [
  { name: 'Elevation', source: 'NASADEM 30 m', role: 'Vertical relief and alpine geomorphology' },
  { name: 'Slope', source: 'NASADEM 30 m', role: 'Gravitational shear gradient' },
  { name: 'Soil Bulk Density', source: 'SoilGrids (19 locations)', role: 'Compaction and subterranean pore volume' },
  { name: 'Clay Fraction', source: 'SoilGrids (19 locations)', role: 'Cohesive shear strength and plasticity' },
  { name: 'Sand Fraction', source: 'SoilGrids (19 locations)', role: 'Internal friction and percolation rate' },
  { name: 'Silt Fraction', source: 'SoilGrids (19 locations)', role: 'Erodibility and piping vulnerability' },
  { name: 'Soil pH', source: 'SoilGrids (19 locations)', role: 'Chemical weathering index' },
  { name: 'Soil Organic Carbon', source: 'SoilGrids (19 locations)', role: 'Topsoil aggregate stability and moisture retention' },
  { name: 'Distance to Nearest Road', source: 'OpenStreetMap (29,756 segments)', role: 'Toe cut slope steepening and drainage alteration' },
  { name: 'Population', source: 'WorldPop 2020 (summed over cell)', role: 'Spatial anthropogenic presence density' },
  { name: 'Historical Landslide Density within 2 km', source: 'GSI Bhusanket (excludes own cell)', role: 'Spatial clustering of past slope failures' },
  { name: 'Distance to Nearest River', source: 'OpenStreetMap (3,511 waterways)', role: 'Valley toe erosion and basal slope scour' },
];

const GRID_LAYERS = [
  { id: 'elevation', label: 'Elevation / Slope', icon: 'M12 2L2 22h20L12 2z', color: '#38bdf8' },
  { id: 'soil', label: 'SoilGrids (19 pts)', icon: 'M4 6h16M4 12h16M4 18h16', color: '#d4a373' },
  { id: 'roads', label: 'Roads (29,756)', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6', color: '#94a3b8' },
  { id: 'rivers', label: 'Rivers (3,511)', icon: 'M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0', color: '#0ea5e9' },
  { id: 'population', label: 'WorldPop', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7', color: '#cbd5e1' },
  { id: 'density', label: 'Historical Density (2km)', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: '#f59e0b' },
];

export default function LandscapeChapter() {
  const [activeLayer, setActiveLayer] = useState<string>('elevation');

  return (
    <section
      id="chapter-3"
      aria-labelledby="landscape-title"
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-b border-slate-800/80"
    >
      {/* Chapter Marker */}
      <ScrollReveal variant="fade-up" delay={0}>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-xs font-semibold text-sky-400 uppercase tracking-widest px-2.5 py-1 rounded border border-sky-400/30 bg-sky-950/40">
            Chapter 03 &middot; Data Architecture
          </span>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
            96,118 Spatial Cells (500&thinsp;m Grid)
          </span>
        </div>
      </ScrollReveal>

      <ScrollReveal variant="fade-up" delay={80}>
        <h2
          id="landscape-title"
          className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight mb-5 leading-tight"
        >
          Understanding the Landscape: <br />
          <span className="text-slate-300 font-normal italic">Spatial Evidence &amp; The 12 Features</span>
        </h2>
      </ScrollReveal>

      <ScrollReveal variant="fade-up" delay={140}>
        <p className="text-slate-300 text-base leading-relaxed mb-12 max-w-3xl font-sans">
          GeoShield transforms satellite topographies, global soil databases, open infrastructure
          vectors, and geological inventories into a unified 500&thinsp;m regular grid spanning 257 columns
          by 374 rows across Kullu and Mandi districts. Every collected dataset fulfills a distinct role in
          the system architecture.
        </p>
      </ScrollReveal>

      {/* Visual Focal Point: 96,118-Cell Grid Layer Fusion Visualizer */}
      <ScrollReveal variant="scale-in" delay={160} className="w-full mb-14">
        <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-5 sm:p-7 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">
                Grid Evidence Synthesis Visualizer &middot; 500&thinsp;m Resolution
              </span>
              <div className="text-base font-semibold text-white mt-0.5">
                96,118 Discrete Matrix Cells Across Kullu &amp; Mandi
              </div>
            </div>

            {/* Interactive Layer Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Evidence layers">
              {GRID_LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setActiveLayer(layer.id)}
                  className={`h-8 px-2.5 rounded text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 ${
                    activeLayer === layer.id
                      ? 'bg-sky-600 text-white border border-sky-400 font-semibold'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                  aria-pressed={activeLayer === layer.id}
                >
                  {layer.label}
                </button>
              ))}
            </div>
          </div>

          {/* Procedural Grid Mesh with Animated Highlight Cells */}
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/8] rounded-lg bg-[#070b13] border border-slate-800/90 overflow-hidden flex items-center justify-center p-4">
            <svg
              viewBox="0 0 900 300"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
              aria-label="Spatial 500m grid synthesis illustration"
              role="img"
            >
              <defs>
                <pattern id="matrixPattern" width="30" height="25" patternUnits="userSpaceOnUse">
                  <rect width="30" height="25" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                  <circle cx="15" cy="12.5" r="1" fill="#334155" />
                </pattern>
              </defs>

              <rect width="900" height="300" fill="url(#matrixPattern)" />

              {/* Shaded Terrain Box Boundaries (128km x 187km rectangular box) */}
              <rect
                x="80"
                y="30"
                width="740"
                height="240"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                strokeOpacity="0.5"
              />
              <text x="90" y="50" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                STUDY BOX: 128 &times; 187 km &middot; 257 COLS &times; 374 ROWS
              </text>

              {/* Layer Specific Vector Overlays */}
              {activeLayer === 'elevation' && (
                <g>
                  <path
                    d="M 120,240 C 240,160 360,70 500,100 C 620,130 720,200 800,180"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                  />
                  <path
                    d="M 140,255 C 260,185 380,105 520,135 C 640,165 740,230 800,215"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <text x="510" y="90" fill="#7dd3fc" fontSize="11" fontFamily="monospace">
                    Peak: 6,588m
                  </text>
                  <text x="130" y="260" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                    Base: 240m
                  </text>
                </g>
              )}

              {activeLayer === 'soil' && (
                <g>
                  {/* 19 soil points */}
                  {[
                    [150, 80], [220, 110], [290, 70], [350, 130], [420, 95], [490, 150],
                    [560, 110], [630, 85], [700, 140], [180, 180], [250, 220], [320, 175],
                    [390, 210], [460, 190], [530, 230], [600, 170], [670, 220], [740, 190],
                    [440, 140]
                  ].map(([px, py], i) => (
                    <g key={`soil-${i}`}>
                      <circle cx={px} cy={py} r="6" fill="#d4a373" fillOpacity="0.3" />
                      <circle cx={px} cy={py} r="3" fill="#bc6c25" />
                    </g>
                  ))}
                  <text x="120" y="250" fill="#d4a373" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    19 SoilGrids Global Sampling Locations (2 High-Altitude Points No Data)
                  </text>
                </g>
              )}

              {activeLayer === 'roads' && (
                <g>
                  <path
                    d="M 100,220 L 250,210 L 320,160 L 450,180 L 580,120 L 720,150 L 800,100"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M 320,160 L 400,100 L 480,80 L 600,60"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="1.8"
                    strokeDasharray="4 3"
                  />
                  <text x="120" y="245" fill="#e2e8f0" fontSize="11" fontFamily="monospace">
                    OpenStreetMap Roads: 29,756 vehicle segments &middot; Road-cut incisions
                  </text>
                </g>
              )}

              {activeLayer === 'rivers' && (
                <g>
                  <path
                    d="M 120,60 Q 280,120 420,190 T 780,240"
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="3.5"
                  />
                  <text x="440" y="180" fill="#38bdf8" fontSize="11" fontFamily="monospace">
                    OSM Waterways: 3,511 stream segments &middot; Valley toe erosion
                  </text>
                </g>
              )}

              {activeLayer === 'population' && (
                <g>
                  {[
                    [220, 200, 20], [330, 150, 30], [540, 120, 25], [680, 160, 18], [420, 180, 35]
                  ].map(([cx, cy, r], idx) => (
                    <circle key={`pop-${idx}`} cx={cx} cy={cy} r={r} fill="#cbd5e1" fillOpacity="0.25" stroke="#94a3b8" strokeWidth="1" />
                  ))}
                  <text x="120" y="250" fill="#cbd5e1" fontSize="11" fontFamily="monospace">
                    WorldPop 2020: 100m resolution summed over each cell full area
                  </text>
                </g>
              )}

              {activeLayer === 'density' && (
                <g>
                  {[
                    [280, 170, 35], [420, 140, 50], [580, 110, 40], [640, 190, 30]
                  ].map(([hx, hy, hr], idx) => (
                    <g key={`dens-${idx}`}>
                      <circle cx={hx} cy={hy} r={hr} fill="#f59e0b" fillOpacity="0.2" stroke="#d97706" strokeWidth="1.2" />
                      <circle cx={hx} cy={hy} r="3" fill="#b45309" />
                    </g>
                  ))}
                  <text x="120" y="250" fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    GSI Historical Landslide Density within 2 km (Largest Model Contributor)
                  </text>
                </g>
              )}
            </svg>
            <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/60">
              Layer: {GRID_LAYERS.find(l => l.id === activeLayer)?.label} &middot; Conceptual Overlay
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* THREE EXPLICIT DATA ROLES (Fact Sheet Classification) */}
      <div className="space-y-8">
        {/* ROLE 1: Used by the trained susceptibility model */}
        <ScrollReveal variant="fade-up" delay={100}>
          <div className="rounded-xl border border-slate-700/90 bg-[#0d1527] p-6 sm:p-7 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 text-xs font-mono font-bold">
                  1
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white font-sans uppercase tracking-wide">
                  Used by the Trained Susceptibility Model (12 Features)
                </h3>
              </div>
              <span className="text-xs font-mono text-sky-300 bg-sky-950/70 px-3 py-1 rounded border border-sky-500/30">
                Input to XGBoost Classifier
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6 font-sans">
              The trained model uses exactly these 12 static geo-environmental features. Historical
              landslide density is by far the single largest contributor to the model&apos;s susceptibility
              output. Population is included as a spatial layer summed over each cell&apos;s full area, but is
              not a major driver.
            </p>

            {/* Equal-weight 12 features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MODEL_FEATURES.map((feat, idx) => (
                <div
                  key={feat.name}
                  className="rounded-lg border border-slate-800 bg-[#090e17] p-3.5 text-xs flex flex-col justify-between hover:border-slate-700 transition-colors shadow-xs"
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-1 mb-1">
                      <span className="font-semibold text-slate-100 font-sans">{feat.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">#{idx + 1}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-normal font-sans">{feat.role}</p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 font-mono text-[10px] text-sky-400 truncate">
                    {feat.source}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Labels provided by 1,377 GSI Bhusanket landslide records</span>
              <span className="text-sky-300 font-semibold">Feature count: 12 static inputs</span>
            </div>
          </div>
        </ScrollReveal>

        {/* ROLE 2: Used only by the rainfall-trigger layer */}
        <ScrollReveal variant="fade-up" delay={150}>
          <div className="rounded-xl border border-sky-800/60 bg-[#0d1527] p-6 sm:p-7 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 text-xs font-mono font-bold">
                  2
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white font-sans uppercase tracking-wide">
                  Used Only by the Rainfall-Trigger Layer (Not a Model Feature)
                </h3>
              </div>
              <span className="text-xs font-mono text-sky-300 bg-sky-950/70 px-3 py-1 rounded border border-sky-500/30">
                Rule-Based Trigger Only
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 text-sm text-slate-300 leading-relaxed space-y-3 font-sans">
                <p>
                  Historical weather data at 21 locations across the region (2015-01-01 to 2026-09-12,
                  sourced from the Open-Meteo Historical Weather API). Each cell is linked to its nearest
                  precipitation location (up to 34.7&thinsp;km away, mean 15.2&thinsp;km).
                </p>
                <p className="text-slate-400 text-xs">
                  Rainfall feeds the deterministic empirical trigger rules directly. Rainfall is{' '}
                  <strong className="text-slate-100 font-semibold">NOT an input</strong> to the XGBoost machine learning
                  model.
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#090e17] p-4 text-xs font-mono space-y-2 flex flex-col justify-center">
                <div className="text-slate-400">Coverage: 21 point locations</div>
                <div className="text-slate-400">Timespan: 2015 – 2026</div>
                <div className="text-sky-300 font-semibold">Decoupled from ML training</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ROLE 3: Collected but not used in training */}
        <ScrollReveal variant="fade-up" delay={200}>
          <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-6 sm:p-7 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-slate-300 text-xs font-mono font-bold">
                  3
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white font-sans uppercase tracking-wide">
                  Collected But Not Used in Training
                </h3>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-3 py-1 rounded border border-amber-500/30">
                Excluded Due to Partial Coverage
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 text-sm text-slate-300 leading-relaxed space-y-3 font-sans">
                <p>
                  Vegetation and water indices (NDVI and NDWI) derived from a single Sentinel-2 optical scene
                  (2026-03-09). While this scene captures approximately 70% of historical landslide points, it
                  covers only about 32% of all 96,118 grid cells.
                </p>
                <p className="text-slate-400 text-xs">
                  Including partially missing spectral features would have biased spatial predictions or forced
                  artificial imputation over alpine glaciers and valleys. Consequently, NDVI and NDWI are
                  retained in project records but strictly excluded from model training.
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#090e17] p-4 text-xs font-mono space-y-2 flex flex-col justify-center">
                <div className="text-slate-400">Sentinel-2 Scene: 2026-03-09</div>
                <div className="text-slate-400">Grid Cell Coverage: ~32%</div>
                <div className="text-amber-400 font-semibold">Excluded from XGBoost</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
