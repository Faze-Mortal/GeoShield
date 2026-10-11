import type { Metadata } from 'next';
import { Geist, Geist_Mono, Newsreader } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const newsreader = Newsreader({
  variable: '--font-serif',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
});

// Configure metadataBase using NEXT_PUBLIC_SITE_URL with safe fallback
// Production URL placeholder: [[PLACEHOLDER: production site url]]
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://geoshield.research.org';
let metadataBaseUrl: URL;
try {
  metadataBaseUrl = new URL(siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`);
} catch {
  metadataBaseUrl = new URL('https://geoshield.research.org');
}

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl,
  title: {
    default: 'GeoShield — Landslide Risk Intelligence for Kullu & Mandi',
    template: '%s — GeoShield',
  },
  description:
    'A scientific investigation into mountain landslide susceptibility and empirical rainfall triggers across Kullu and Mandi districts, Himachal Pradesh.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'GeoShield — Landslide Risk Intelligence for Kullu & Mandi',
    description:
      'High-resolution landslide hazard assessment and empirical rainfall triggers across 500m spatial cells.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased dark`}
    >
      <body className="min-h-full w-full bg-[#090e17] text-slate-100 font-sans">
        {/* Skip to Content Accessibility Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-sky-400 focus:text-slate-950 focus:font-mono focus:text-xs focus:font-semibold focus:rounded focus:shadow-xl focus:outline-2 focus:outline-white"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
