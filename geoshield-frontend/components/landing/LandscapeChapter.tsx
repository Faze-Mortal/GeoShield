'use client';

import React from 'react';

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

export default function LandscapeChapter() {
  return (
    <section
      id="chapter-3"
      aria-labelledby="landscape-title"
      className="py-20 md:py-28 px-4 sm:px-6 max-w-5xl mx-auto w-full border-b border-slate-800/80"
    >
      {/* Chapter Marker */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-xs font-semibold text-sky-400 uppercase tracking-widest px-2 py-0.5 rounded border border-sky-400/30 bg-sky-950/40">
          Chapter 03 &middot; Data Architecture
        </span>
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">
          96,118 Spatial Cells (500&thinsp;m Grid)
        </span>
      </div>

      <h2
        id="landscape-title"
        className="text-2xl sm:text-4xl font-serif text-white tracking-tight mb-4"
      >
        Understanding the Landscape: Spatial Evidence &amp; The 12 Features
      </h2>

      <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-10 max-w-3xl font-sans">
        GeoShield transforms satellite topographies, global soil databases, open infrastructure
        vectors, and geological inventories into a unified 500&thinsp;m regular grid spanning 257 columns
        by 374 rows across Kullu and Mandi districts. Every collected dataset fulfills a distinct role in
        the system architecture.
      </p>

      {/* THREE EXPLICIT DATA ROLES (Fact Sheet Classification) */}
      <div className="space-y-8">
        {/* ROLE 1: Used by the trained susceptibility model */}
        <div className="rounded border border-slate-700/80 bg-[#0d1527] p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 text-xs font-mono font-bold">
                1
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white font-sans uppercase tracking-wide">
                Used by the Trained Susceptibility Model (12 Features)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-sky-300 bg-sky-950/60 px-2.5 py-0.5 rounded border border-sky-500/30">
              Input to XGBoost Classifier
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            The trained model uses exactly these 12 static geo-environmental features. Historical
            landslide density is by far the single largest contributor to the model&apos;s susceptibility
            output. Population is included as a spatial layer summed over each cell&apos;s full area, but is
            not a major driver.
          </p>

          {/* Equal-weight 12 features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {MODEL_FEATURES.map((feat, idx) => (
              <div
                key={feat.name}
                className="rounded border border-slate-800 bg-[#090e17] p-3 text-xs flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-1 mb-1">
                    <span className="font-semibold text-slate-100 font-sans">{feat.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">#{idx + 1}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{feat.role}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 font-mono text-[10px] text-sky-400/90 truncate">
                  {feat.source}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Labels provided by 1,377 GSI Bhusanket landslide records</span>
            <span>Feature count: 12 static inputs</span>
          </div>
        </div>

        {/* ROLE 2: Used only by the rainfall-trigger layer */}
        <div className="rounded border border-sky-800/60 bg-[#0d1527] p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 text-xs font-mono font-bold">
                2
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white font-sans uppercase tracking-wide">
                Used Only by the Rainfall-Trigger Layer (Not a Model Feature)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-sky-300 bg-sky-950/60 px-2.5 py-0.5 rounded border border-sky-500/30">
              Rule-Based Trigger Only
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
              <p>
                Historical weather data at 21 locations across the region (2015-01-01 to 2026-09-12,
                sourced from the Open-Meteo Historical Weather API). Each cell is linked to its nearest
                precipitation location (up to 34.7&thinsp;km away, mean 15.2&thinsp;km).
              </p>
              <p className="text-slate-400 text-xs">
                Rainfall feeds the deterministic empirical trigger rules directly. Rainfall is{' '}
                <strong className="text-slate-200">NOT an input</strong> to the XGBoost machine learning
                model.
              </p>
            </div>
            <div className="rounded border border-slate-800 bg-[#090e17] p-3 text-xs font-mono space-y-1.5 flex flex-col justify-center">
              <div className="text-slate-500">Coverage: 21 point locations</div>
              <div className="text-slate-500">Timespan: 2015 – 2026</div>
              <div className="text-sky-300 font-semibold">Decoupled from ML training</div>
            </div>
          </div>
        </div>

        {/* ROLE 3: Collected but not used in training */}
        <div className="rounded border border-slate-800 bg-[#0d1527] p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-slate-300 text-xs font-mono font-bold">
                3
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white font-sans uppercase tracking-wide">
                Collected But Not Used in Training
              </h3>
            </div>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/50 px-2.5 py-0.5 rounded border border-amber-500/30">
              Excluded Due to Partial Coverage
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
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
            <div className="rounded border border-slate-800 bg-[#090e17] p-3 text-xs font-mono space-y-1.5 flex flex-col justify-center">
              <div className="text-slate-500">Sentinel-2 Scene: 2026-03-09</div>
              <div className="text-slate-500">Grid Cell Coverage: ~32%</div>
              <div className="text-amber-400 font-semibold">Excluded from XGBoost</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
