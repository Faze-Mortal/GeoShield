# GeoShield — Complete Website Placeholder Audit & Public Launch Cleanup

**Audit Date:** 2026-10-11  
**Target Environment:** Next.js 16.4.0 (Turbopack) | FastAPI 0.142.4 | PostgreSQL/PostGIS  
**Production URLs Verified:**
- Deployed Frontend: `https://geoshield-hazel.vercel.app`
- Deployed Backend API: `https://geoshield-api-9nl7.onrender.com`
- Database Infrastructure: Supabase (PostgreSQL/PostGIS)

---

## 1. Executive Summary

This release audit conducted a full-repository inspection of the GeoShield monorepo (`geoshield-frontend/`, `GeoShield_Backend/`, and `docs/`) to identify unfinished placeholders, temporary configuration, broken references, and deployment blockers.

### Key Actions Taken
1. **Centralized Configuration:** Created [geoshield-frontend/lib/siteConfig.ts](file:///c:/Users/Aum%20Lenka/OneDrive/Desktop/projects/project-root/geoshield-frontend/lib/siteConfig.ts) as the single source of truth for site URLs, hosting infrastructure, operator metadata, and legal text.
2. **Resolved Production URLs:** Replaced dummy domain fallbacks (`https://geoshield.research.org`) and placeholder comments with the verified deployed production URL (`https://geoshield-hazel.vercel.app`) across [app/layout.tsx](file:///c:/Users/Aum%20Lenka/OneDrive/Desktop/projects/project-root/geoshield-frontend/app/layout.tsx), [app/sitemap.ts](file:///c:/Users/Aum%20Lenka/OneDrive/Desktop/projects/project-root/geoshield-frontend/app/sitemap.ts), and [app/robots.ts](file:///c:/Users/Aum%20Lenka/OneDrive/Desktop/projects/project-root/geoshield-frontend/app/robots.ts).
3. **Accurate Hosting Infrastructure:** Updated [app/privacy/page.tsx](file:///c:/Users/Aum%20Lenka/OneDrive/Desktop/projects/project-root/geoshield-frontend/app/privacy/page.tsx) with verified infrastructure roles: frontend on **Vercel**, API on **Render**, and spatial database on **Supabase**.
4. **Enhanced CSP Configuration:** Added `https://geoshield-api-9nl7.onrender.com` and `https://*.onrender.com` to `connect-src` in [geoshield-frontend/next.config.ts](file:///c:/Users/Aum%20Lenka/OneDrive/Desktop/projects/project-root/geoshield-frontend/next.config.ts) to ensure zero CSP Report-Only violations when calling the production backend.
5. **Backend CORS Alignment:** Added `https://geoshield-hazel.vercel.app` to default `CORS_ALLOWED_ORIGINS` in [GeoShield_Backend/GeoShield_Backend/backend/app/main.py](file:///c:/Users/Aum%20Lenka/OneDrive/Desktop/projects/project-root/GeoShield_Backend/GeoShield_Backend/backend/app/main.py).
6. **Publication Gate Enforcement:** Updated [geoshield-frontend/scripts/check-placeholders.mjs](file:///c:/Users/Aum%20Lenka/OneDrive/Desktop/projects/project-root/geoshield-frontend/scripts/check-placeholders.mjs) to scan `lib/` alongside `app/` and `components/`. The automated gate correctly exits with code 1 until remaining operator details are supplied.

---

## 2. Comprehensive Inventory of Discovered Placeholders

| # | Discovered Value / Token | Exact Location | Category / Classification | Status | Remediation / Action Taken |
|---|---|---|---|---|---|
| **1** | `[[PLACEHOLDER: production site url]]` | `app/layout.tsx:23` | Deployment Fact | **Resolved** | Configured to `https://geoshield-hazel.vercel.app` via `siteConfig.siteUrl`. |
| **2** | `https://geoshield.research.org` | `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts` | Dummy Domain | **Resolved** | Replaced with verified domain `https://geoshield-hazel.vercel.app`. |
| **3** | `[[PLACEHOLDER: hosting provider]]` | `app/privacy/page.tsx:144` | Deployment Fact | **Resolved** | Disclosed: Vercel Hobby (frontend), Render Hobby (API), Supabase (PostGIS database). |
| **4** | `[[PLACEHOLDER: operator name]]` | `lib/siteConfig.ts:28-30` | Operator Metadata | **Resolved** | Configured to **GeoShield Project Team (Aum Lenka and Amishi Kingrani)**. |
| **5** | `[[PLACEHOLDER: contact email]]` | `lib/siteConfig.ts:31` | Operator Metadata | **Resolved** | Configured to **`aumlenka51@gmail.com`** with accessible `mailto:` links. |
| **6** | `[[PLACEHOLDER: Vercel log retention period]]` | `lib/siteConfig.ts:46` | Provider Verification | **Resolved** | Configured to **`1 hour for runtime logs on the Vercel Hobby plan`** based on official Vercel documentation. |
| **7** | `[[PLACEHOLDER: Render log retention period]]` | `lib/siteConfig.ts:47` | Provider Verification | **Resolved** | Configured to **`7 days for service logs on the Render Hobby workspace plan`** based on official Render documentation. |
| **8** | `[[PLACEHOLDER: date]]` (Privacy Notice) | `lib/siteConfig.ts:32` | Publication Date | **Resolved** | Configured to agreed publication date: **`October 12, 2026`**. |
| **9** | `[[PLACEHOLDER: date]]` (Terms of Use) | `lib/siteConfig.ts:33` | Publication Date | **Resolved** | Configured to agreed publication date: **`October 12, 2026`** (accompanied by clear "Draft — Pending Legal Review" badge). |
| **10** | `[[PLACEHOLDER: DRAFT — PENDING LEGAL REVIEW...]]` | `lib/siteConfig.ts:56` | Legal Review | **Unresolved** | Marked explicitly as **DRAFT — PENDING LEGAL REVIEW**. Clear visitor notice rendered on `/terms` (zero raw syntax exposed). |

*Exact remaining unresolved placeholder count: 1*

---

## 3. Authoritative Log Retention Investigation (Multi-Provider)

A single retention statement (e.g. "purged after 7 days") is technically inaccurate because the architecture separates the frontend, backend, and database across three independent cloud providers.

### A. Vercel (Web Frontend)
- **Official Documentation:** [Vercel Runtime Logs Documentation](https://vercel.com/docs/observability/runtime-logs) (Accessed October 2026).
- **Documented Retention Schedule:**
  - **Hobby (Free):** 1 hour of runtime and edge request logs.
  - **Pro:** 1 day (24 hours).
  - **Enterprise:** 3 days.
  - **Observability Plus (Add-on):** Up to 30 days of queryable runtime logs.
  - **External Log Drains:** Real-time log forwarding to third-party endpoints (Syslog, Axiom, Datadog) where retention is determined by the external service.
  - **Build Logs:** Retained indefinitely.
- **Documented Fact vs. Account Verification Needed:**
  - *Documented Fact:* Vercel retains logs between 1 hour (Hobby) and 1 day (Pro) by default.
  - *Account Verification Needed:* Check the active team plan (Hobby vs Pro) and whether an external Log Drain or Observability Plus add-on is configured in the Vercel Project Settings > Observability dashboard.

### B. Render (Backend Inference API)
- **Official Documentation:** [Render Log Streams](https://render.com/docs/log-streams) & [Render Pricing & Specs](https://render.com/docs/pricing) (Accessed October 2026).
- **Documented Retention Schedule:**
  - **Free / Hobby Instance Types:** 7 days of service access and stderr/stdout logs in the dashboard and CLI.
  - **Pro Instance Types:** 14 days of service logs.
  - **Scale / Enterprise:** 30 days of service logs.
  - **Log Streams:** Real-time streaming over Syslog or HTTP to third-party providers (Papertrail, Better Stack, Datadog).
  - **Team Workspace Audit Logs:** Retained for 90 days.
- **Documented Fact vs. Account Verification Needed:**
  - *Documented Fact:* Render retains service logs for 7 days on free/hobby tiers and 14 days on Pro.
  - *Account Verification Needed:* Check the service plan tier (Free vs Starter vs Standard/Pro) and verify if external Log Streams are enabled in Render Dashboard > `geoshield-api` > Logs / Settings.

### C. Supabase (Spatial PostgreSQL/PostGIS Database)
- **Official Documentation:** [Supabase Platform Logging](https://supabase.com/docs/guides/platform/logs) (Accessed October 2026).
- **Documented Retention Schedule:**
  - **Free:** 1 day (24 hours). Degrades to 1 hour if log volume exceeds free quotas.
  - **Pro:** 7 days (degrades to 24 hours if quota exceeded).
  - **Team:** 28 days.
  - **Enterprise:** 90 days.
- **Architectural Isolation Note:**
  - Public web visitors **never connect directly** to the Supabase database. All database connections and PostGIS queries are executed internally by the Render FastAPI backend via pooled connection strings.
  - Visitor IP addresses and browser HTTP requests are terminated at Vercel and Render, not Supabase.

---

## 4. Governing Law & Dispute Jurisdiction

- **Status:** **DRAFT — PENDING LEGAL REVIEW (UNRESOLVED)**
- **Safeguard Compliance:**
  - No jurisdiction clause has been invented or inserted into production code.
  - The Terms of Use page is explicitly marked as "Draft — Pending Legal Review" in the header and displays a prominent notice in Section 4.
  - The token in `geoshield-frontend/lib/siteConfig.ts` is explicitly set to:
    `[[PLACEHOLDER: DRAFT — PENDING LEGAL REVIEW: Governing law and jurisdiction clause to be reviewed by counsel]]`.
  - Raw placeholder syntax is never rendered to public visitors; the component displays a clean pending-review advisory.
- **Draft Clause for Operator & Legal Counsel Review Only (NOT IN PRODUCTION):**
  ```text
  DRAFT FOR REVIEW ONLY (NOT YET FINALIZED OR APPROVED BY LEGAL COUNSEL):
  "These Terms of Use and any non-contractual disputes arising out of or in connection
  with GeoShield shall be governed by, and construed in accordance with, the laws of
  India. Any legal proceedings or dispute claims shall be submitted to the exclusive
  jurisdiction of the courts of competent jurisdiction located in Himachal Pradesh, India."
  ```

---

## 5. Publication Dates Decision

- **Status:** **CONFIGURED (OCTOBER 12, 2026)**
- **Applied Values:**
  - `privacyLastUpdated`: `"October 12, 2026"`
  - `termsLastUpdated`: `"October 12, 2026"` (accompanied by the "Draft — Pending Legal Review" pill)
- **Principle:** Reflects the agreed intended publication date for this release iteration. The Terms of Use document remains explicitly accompanied by a draft warning indicating that legal review is pending.

---

## 6. Scan Limitations & Verification Scope

1. **Static File Analysis:** Scanned all `.ts`, `.tsx`, `.mjs`, `.py`, `.md`, and `.env*` files in the repository.
2. **Browser Network Auditing:** Headless Chromium confirmed zero third-party tracking scripts, zero cookies, zero localStorage entries, and zero unauthorized network calls.
3. **Production Cloud Environment Variables:** Local inspection cannot modify variables already saved inside the Vercel or Render cloud dashboards. The operator must ensure the cloud dashboards reflect the verified environment keys.
