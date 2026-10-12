import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Terms of Use & Scientific Limitations — GeoShield',
  description:
    'Terms of use, methodology caveats, and scientific limitations for GeoShield landslide risk assessment in Kullu & Mandi.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#090e17] text-slate-200 antialiased flex flex-col selection:bg-sky-500/30 selection:text-sky-200">
      {/* Header Landmark */}
      <header className="border-b border-slate-800/80 bg-[#0c1322]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-slate-100 hover:text-sky-400 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 focus-visible:outline-offset-2 rounded"
          >
            <span className="font-serif italic font-bold text-lg tracking-tight">GeoShield</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60 font-mono">
              Research
            </span>
          </Link>
          <nav aria-label="Page navigation" className="flex items-center gap-4 text-xs font-mono">
            <Link
              href="/"
              className="text-slate-400 hover:text-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 rounded px-1.5 py-1"
            >
              Story
            </Link>
            <Link
              href="/dashboard"
              className="text-sky-400 hover:text-sky-300 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 rounded px-1.5 py-1"
            >
              Risk Map
            </Link>
            <Link
              href="/privacy"
              className="text-slate-400 hover:text-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 rounded px-1.5 py-1"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <article className="prose prose-invert max-w-none space-y-8">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2">
              Academic Demonstration & Methodology Notice
            </p>
            <h1 className="font-serif text-3xl md:text-4xl text-slate-100 tracking-tight">
              Terms of Use & Scientific Limitations
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <p className="text-xs text-slate-400 font-mono">
                Last updated: {siteConfig.operator.termsLastUpdated}
              </p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium bg-amber-950/50 text-amber-300 border border-amber-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden="true" />
                Draft — Pending Legal Review
              </span>
            </div>
          </div>

          <div className="p-4 rounded border border-amber-500/40 bg-amber-950/20 text-sm text-amber-200/90 leading-relaxed">
            <p className="font-semibold text-amber-100 mb-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
              Important Safety & Emergency Notice
            </p>
            <p>
              GeoShield is a free student and academic research demonstration. It is <strong>NOT</strong> an official emergency early-warning system and must <strong>NEVER</strong> be relied upon for life-safety, disaster response, or property evacuation decisions. Always follow official advisories from the National Disaster Management Authority (NDMA), Himachal Pradesh State Disaster Management Authority (HPSDMA), and the India Meteorological Department (IMD).
            </p>
          </div>

          <section aria-labelledby="section-purpose" className="space-y-3">
            <h2 id="section-purpose" className="text-lg font-semibold text-slate-100 border-b border-slate-800/80 pb-2">
              1. Research & Educational Purpose
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              GeoShield was created as an educational case study to explore decoupled hazard modeling across steep Himalayan terrain in Kullu and Mandi districts. It couples a machine-learning susceptibility model with rule-based rainfall trigger heuristics across a 500m × 500m spatial grid.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              The service is provided free of charge for scholarly analysis, scientific scrutiny, and educational demonstration.
            </p>
          </section>

          {/* CRITICAL #limitations ANCHOR SECTION */}
          <section id="limitations" aria-labelledby="section-limitations" className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <h2 id="section-limitations" className="text-xl font-semibold text-sky-300 border-b border-sky-900/60 pb-2 flex-1">
                2. Key Scientific Limitations & Methodological Constraints
              </h2>
            </div>

            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded bg-slate-900/70 border border-slate-800 space-y-1.5">
                <h3 className="font-semibold text-slate-100 text-sm">
                  A. Susceptibility Score is a Relative Index, Not a Probability
                </h3>
                <p className="text-xs text-slate-300">
                  The static Susceptibility Score (scaled 0 to 100) represents a relative comparative hazard index based on terrain morphology, lithology, and historical slide density. It is <strong>not</strong> an actuarial probability, percentage likelihood, or frequency forecast of a slope failure occurring at any given moment.
                </p>
              </div>

              <div className="p-3.5 rounded bg-slate-900/70 border border-slate-800 space-y-1.5">
                <h3 className="font-semibold text-slate-100 text-sm">
                  B. Rule-Based Rainfall Triggers (Not ML-Trained)
                </h3>
                <p className="text-xs text-slate-300">
                  The meteorological trigger module is an empirical rule-based calculation based on antecedent precipitation (1-day, 3-day, 7-day, 30-day). It is <strong>not</strong> generated by a machine-learning neural network or predictive model.
                </p>
              </div>

              <div className="p-3.5 rounded bg-slate-900/70 border border-slate-800 space-y-1.5">
                <h3 className="font-semibold text-slate-100 text-sm">
                  C. Empirical Thresholds Calibrated to Shimla Region
                </h3>
                <p className="text-xs text-slate-300">
                  The intensity-duration equations implemented in the trigger logic originate from published research by Singh et al. (2025, DOI: 10.1016/j.nhres.2024.12.004), which were empirically derived for the Shimla region of Himachal Pradesh. They have <strong>not been independently calibrated</strong> to the specific micro-climates, geological thrust belts, or drainage basins of Kullu and Mandi.
                </p>
              </div>

              <div className="p-3.5 rounded bg-slate-900/70 border border-slate-800 space-y-1.5">
                <h3 className="font-semibold text-slate-100 text-sm">
                  D. Historical Rainfall Snapshot (Static, Not Live Weather)
                </h3>
                <p className="text-xs text-slate-300">
                  Rainfall values in the production database reflect a fixed historical observation snapshot as of <strong className="text-slate-100">2026-09-12</strong> sourced from Open-Meteo reanalysis across five representative weather points. The platform does <strong>not</strong> stream real-time weather radar, live telemetry, or precipitation radar.
                </p>
              </div>

              <div className="p-3.5 rounded bg-slate-900/70 border border-slate-800 space-y-1.5">
                <h3 className="font-semibold text-slate-100 text-sm">
                  E. Rainfall Simulation is a What-If Scenario, Not a Forecast
                </h3>
                <p className="text-xs text-slate-300">
                  Adjusting the rainfall slider (e.g. +10%, +20%, +30%) is a deterministic mathematical sensitivity exploration. It does <strong>not</strong> constitute a meteorological forecast, storm warning, or future hazard prediction.
                </p>
              </div>

              <div className="p-3.5 rounded bg-slate-900/70 border border-slate-800 space-y-1.5">
                <h3 className="font-semibold text-slate-100 text-sm">
                  F. Landslide Inventory Temporal Uncertainties & Recording Bias
                </h3>
                <p className="text-xs text-slate-300">
                  The underlying Geological Survey of India (GSI) Bhusanket inventory includes historical events where exact dates of failure are uncertain or clustered during post-monsoon road clearance surveys. Historical landslide density constitutes the highest-ranking feature in the susceptibility model; unmapped or remote backcountry slopes with sparse reporting may exhibit lower susceptibility scores simply due to lack of historical documentation rather than intrinsic geotechnical stability.
                </p>
              </div>

              <div className="p-3.5 rounded bg-slate-900/70 border border-slate-800 space-y-1.5">
                <h3 className="font-semibold text-slate-100 text-sm">
                  G. Rectangular Grid Boundary & Spatial Discretization
                </h3>
                <p className="text-xs text-slate-300">
                  The study domain is bounded by an arbitrary geographic rectangle covering 8,000 km² across Kullu and Mandi. Cells at the boundary margins do not represent the administrative limits of districts or natural watershed ridgelines.
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="section-data-sources" className="space-y-3 pt-2">
            <h2 id="section-data-sources" className="text-lg font-semibold text-slate-100 border-b border-slate-800/80 pb-2">
              3. Data Sources & Academic Attribution
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              GeoShield is built using open and scientific datasets. Complete attribution and licensing terms are cataloged in our{' '}
              <span className="text-sky-300 font-mono text-xs">docs/data-licenses.md</span> registry:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1 font-mono">
              <li>NASADEM Merged Global DEM — NASA JPL / OpenTopography (DOI: 10.5069/G93T9FD9)</li>
              <li>Bhusanket Landslide Inventory — Geological Survey of India (GSI)</li>
              <li>Historical Weather API — Open-Meteo (CC BY 4.0 / ECMWF ERA5)</li>
              <li>SoilGrids 2.0 — ISRIC World Soil Information (Poggio et al., 2021)</li>
              <li>Road Vector Network — © OpenStreetMap contributors (ODbL 1.0)</li>
              <li>Population Distribution — WorldPop (DOI: 10.5258/SOTON/WP00839)</li>
              <li>Copernicus Sentinel-2 — European Space Agency (ESA)</li>
              <li>Basemap Tiles — © CARTO, © OpenStreetMap contributors</li>
            </ul>
          </section>

          <section aria-labelledby="section-legal" className="space-y-3 pt-2">
            <h2 id="section-legal" className="text-lg font-semibold text-slate-100 border-b border-slate-800/80 pb-2">
              4. Disclaimer of Professional Advice & Legal Provisions
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              GeoShield and its authors make no representations or warranties of any kind, express or implied, regarding the accuracy, completeness, timeliness, or fitness for any particular purpose of the data, map visualizations, or simulated risk scores.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Under no circumstances shall GeoShield, the {siteConfig.operator.name}, or its contributing authors be held liable for any direct, indirect, incidental, consequential, or exemplary damages resulting from the use or inability to use this platform.
            </p>
            {!siteConfig.legal.isReviewed ? (
              <div className="p-3.5 rounded bg-amber-950/20 border border-amber-800/60 text-xs text-amber-200/90 leading-relaxed space-y-1.5">
                <div className="font-semibold text-amber-100 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
                  Governing Jurisdiction Clause — Pending Formal Legal Review
                </div>
                <p>
                  {siteConfig.legal.pendingNotice}
                </p>
                <p className="text-[11px] text-amber-300/70 italic">
                  Note: This terms page requires formal review by qualified legal counsel prior to full public publication.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-mono">
                {siteConfig.legal.jurisdictionClause}
              </div>
            )}
          </section>
        </article>
      </main>

      {/* Footer Landmark */}
      <footer className="border-t border-slate-800/80 bg-[#080d15] py-8 text-xs text-slate-400 mt-12">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 GeoShield. Free Academic & Research Project.</p>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-slate-200 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 rounded">
              Story
            </Link>
            <Link href="/dashboard" className="hover:text-slate-200 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 rounded">
              Risk Map
            </Link>
            <Link href="/privacy" className="hover:text-slate-200 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 rounded">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
