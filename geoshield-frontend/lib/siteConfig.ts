// ---------------------------------------------------------------------------
// GeoShield — Central Site Configuration & Publication Metadata
// ---------------------------------------------------------------------------

export const siteConfig = {
  name: 'GeoShield',
  title: 'GeoShield — Landslide Risk Intelligence for Kullu & Mandi',
  description:
    'A scientific investigation into mountain landslide susceptibility and empirical rainfall triggers across Kullu and Mandi districts, Himachal Pradesh.',

  /** Canonical site URL — defaults to verified deployed Vercel production domain. */
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || 'https://geoshield-hazel.vercel.app').replace(/\/+$/, ''),

  /** API Base URL — defaults to local dev server; configured to Render in production. */
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, ''),

  /** Deployed infrastructure endpoints (verified facts). */
  deployedFrontendUrl: 'https://geoshield-hazel.vercel.app',
  deployedBackendUrl: 'https://geoshield-api-9nl7.onrender.com',

  /**
   * Operator & Contact Metadata (Verified):
   * Display Name: GeoShield Project Team
   * Project Operators: Aum Lenka and Amishi Kingrani
   * Contact Email: aumlenka51@gmail.com
   */
  operator: {
    teamName: 'GeoShield Project Team',
    operators: 'Aum Lenka and Amishi Kingrani',
    name: 'the GeoShield Project Team (Aum Lenka and Amishi Kingrani)',
    contactEmail: 'aumlenka51@gmail.com',
    privacyLastUpdated: 'October 12, 2026',
    termsLastUpdated: 'October 12, 2026',
  },

  /**
   * Verified Hosting Infrastructure:
   * Frontend: Vercel Hobby (Runtime log retention: 1 hour for runtime logs on the Vercel Hobby plan)
   * Backend API: Render Hobby (Service log retention: 7 days for service logs on the Render Hobby workspace plan)
   * Database: Supabase (PostgreSQL/PostGIS, accessed internally by Render backend)
   */
  hosting: {
    frontend: 'Vercel',
    backend: 'Render',
    database: 'Supabase',
    vercelLogRetention: '1 hour for runtime logs on the Vercel Hobby plan',
    renderLogRetention: '7 days for service logs on the Render Hobby workspace plan',
  },

  /**
   * Legal & Compliance:
   * Kept explicitly marked as DRAFT — PENDING LEGAL REVIEW.
   */
  legal: {
    isReviewed: false,
    jurisdictionClause: '[[PLACEHOLDER: DRAFT — PENDING LEGAL REVIEW: Governing law and jurisdiction clause to be reviewed by counsel]]',
    pendingNotice:
      'A formal governing law and dispute jurisdiction clause has not yet been approved by legal counsel. The Terms of Use and dispute-jurisdiction terms have not been legally reviewed or finalized, and remain a draft pending counsel review prior to public release.',
  },
} as const;
