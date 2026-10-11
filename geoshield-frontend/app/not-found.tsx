import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found — GeoShield',
  description: "This page isn't part of GeoShield. Return to the story or open the risk map.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090e17] text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-sky-500/30 selection:text-sky-200">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-rose-500" aria-hidden="true" />
          Error 404
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
          Terrain Unknown
        </h1>

        <p className="text-sm text-slate-400 leading-relaxed">
          This page isn&apos;t part of GeoShield. Return to the story or open the risk map.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-mono font-medium text-slate-200 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 focus-visible:outline-offset-2"
          >
            ← Return to the Story
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 focus-visible:outline-offset-2"
          >
            Open the Risk Map →
          </Link>
        </div>
      </div>
    </div>
  );
}
