import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Notice — GeoShield',
  description:
    'Privacy notice for the GeoShield mountain landslide risk assessment and research platform.',
};

export default function PrivacyPage() {
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
              href="/terms"
              className="text-slate-400 hover:text-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 rounded px-1.5 py-1"
            >
              Terms
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <article className="prose prose-invert max-w-none space-y-8">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-sky-400 mb-2">
              Transparency & Data Practice
            </p>
            <h1 className="font-serif text-3xl md:text-4xl text-slate-100 tracking-tight">
              Privacy Notice
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-2">
              Last updated: [[PLACEHOLDER: date]]
            </p>
          </div>

          <div className="p-4 rounded border border-slate-800 bg-[#0d1627]/60 text-sm text-slate-300 leading-relaxed">
            <p>
              GeoShield is a free student and academic research project operated by{' '}
              <strong className="text-slate-100">[[PLACEHOLDER: operator name]]</strong>.
              For research inquiries or data inquiries, contact:{' '}
              <span className="text-sky-300 font-mono">[[PLACEHOLDER: contact email]]</span>.
            </p>
          </div>

          <section aria-labelledby="section-collection" className="space-y-3">
            <h2 id="section-collection" className="text-lg font-semibold text-slate-100 border-b border-slate-800/80 pb-2">
              1. What the Site Collects and Processes
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              GeoShield does not maintain user registration, accounts, authentication tokens, profile databases, or commercial payment systems. We do not collect names, personal email addresses, phone numbers, or physical addresses from general visitors.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              When you use the interactive risk map at <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-slate-200">/dashboard</code>, your browser submits non-personal spatial query parameters to the GeoShield API:
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
              <li>Bounding box coordinates (<code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-slate-200">min_lon, min_lat, max_lon, max_lat</code>) to retrieve polygon risk features.</li>
              <li>Grid cell identifiers (e.g. <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-slate-200">r0142_c0087</code>) to load detailed susceptibility metrics.</li>
              <li>Percentage adjustment values submitted to the what-if simulation tool.</li>
            </ul>
          </section>

          <section aria-labelledby="section-cookies" className="space-y-3">
            <h2 id="section-cookies" className="text-lg font-semibold text-slate-100 border-b border-slate-800/80 pb-2">
              2. Cookies and Browser Storage
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Based on automated inspection using headless Chromium:
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
              <li><strong>Cookies:</strong> GeoShield sets <strong className="text-slate-100">zero HTTP cookies</strong>.</li>
              <li><strong>Local Storage & Session Storage:</strong> No personal or persistent data is written to your browser&apos;s localStorage or sessionStorage.</li>
              <li><strong>IndexedDB:</strong> No client-side databases are registered.</li>
              <li><strong>Analytics / Trackers:</strong> No advertising pixels, session recorders, fingerprinting scripts, or third-party behavioral trackers are loaded.</li>
            </ul>
            <p className="text-sm text-slate-400 text-xs italic">
              Because no non-essential cookies or tracking technologies are employed, no intrusive cookie consent banner is displayed.
            </p>
          </section>

          <section aria-labelledby="section-third-parties" className="space-y-3">
            <h2 id="section-third-parties" className="text-lg font-semibold text-slate-100 border-b border-slate-800/80 pb-2">
              3. External Network Connections & Third-Party Services
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              To render cartographic layers, your browser establishes direct network connections to the following external services:
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="p-3 rounded bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-slate-200 block">CARTO Basemap CDN</span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Hosts: <code className="text-xs text-sky-300">basemaps.cartocdn.com</code>, <code className="text-xs text-sky-300">tiles-*.basemaps.cartocdn.com</code>
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  Transmits raster/vector basemap tiles and glyph fonts to render geographic context. CARTO processes requests under their standard privacy terms.
                </p>
              </div>
              <div className="p-3 rounded bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-slate-200 block">Next.js Typography</span>
                <p className="text-xs text-slate-300 mt-1">
                  Typography fonts (<code className="text-xs text-slate-200">Geist</code>, <code className="text-xs text-slate-200">Newsreader</code>) are compiled and self-hosted locally from our web domain at build time. No live requests are made to Google Fonts servers during runtime.
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="section-server-logs" className="space-y-3">
            <h2 id="section-server-logs" className="text-lg font-semibold text-slate-100 border-b border-slate-800/80 pb-2">
              4. Server Logs & Hosting Infrastructure
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              GeoShield is hosted on <strong className="text-slate-100">[[PLACEHOLDER: hosting provider]]</strong>. In common with all web hosting environments, incoming HTTP requests generate standard access logs containing:
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
              <li>Client IP address and requesting port.</li>
              <li>Date, time, and timezone of the request.</li>
              <li>Requested URL path and HTTP method.</li>
              <li>HTTP response status code and byte count.</li>
              <li>User-agent string (browser type and operating system).</li>
            </ul>
            <p className="text-sm text-slate-300 leading-relaxed">
              These technical logs are processed solely to maintain system availability, prevent denial-of-service disruptions, and troubleshoot network errors. Server logs are automatically purged after <strong className="text-slate-100">[[PLACEHOLDER: log retention period]]</strong>.
            </p>
          </section>

          <section aria-labelledby="section-security" className="space-y-3">
            <h2 id="section-security" className="text-lg font-semibold text-slate-100 border-b border-slate-800/80 pb-2">
              5. Transport Security & Inquiries
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              All communications between your browser and GeoShield are encrypted using Transport Layer Security (HTTPS).
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              If you have questions regarding data handling or wish to inquire about the scientific data sources, please reach out to:{' '}
              <span className="text-sky-300 font-mono">[[PLACEHOLDER: contact email]]</span>.
            </p>
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
            <Link href="/terms" className="hover:text-slate-200 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 rounded">
              Terms & Limitations
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
