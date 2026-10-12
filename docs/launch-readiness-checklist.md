# GeoShield — Public Launch Readiness Checklist

**Document Status:** Pre-Deployment Verification Gate  
**Last Verified:** 2026-10-11  
**Target Domains:**
- Frontend: `https://geoshield-hazel.vercel.app`
- Backend API: `https://geoshield-api-9nl7.onrender.com`
- Database: Supabase (AWS ap-south-1 / PostGIS 15+)

---

## 1. Public Content Readiness

| Item | Requirement | Verification Evidence / Current Status | Status |
|---|---|---|---|
| **Scientific Tone** | Relative score (0–100), not probability | Enforced in `LimitationsChapter.tsx`, `MethodologyModal.tsx`, `terms/page.tsx`, and `SearchBar.tsx`. | **PASS** |
| **Decoupled Architecture** | Susceptibility (static ML) vs Trigger (empirical rules) | Clear narrative across landing page, methodology modal, and documentation. | **PASS** |
| **Historical Weather Date** | Clear disclosure of 2026-09-12 snapshot date | Prominently displayed in banner, limitations chapter, terms, and metadata. | **PASS** |
| **Simulation Context** | What-if scenario sensitivity, not live forecast | Explicitly explained on landing page and dashboard simulation panel. | **PASS** |
| **Emergency Caveat** | Non-official tool warning | Dedicated banner linking to `/terms#limitations`; NDMA/HPSDMA advisories cited. | **PASS** |
| **Dead Links / Dead Routes** | Zero broken internal links or `href="#"` | All navigation links point to `/`, `/dashboard`, `/privacy`, `/terms`, or valid section anchors. | **PASS** |
| **Operator Identity** | Real operator or team name | **PASS** — Configured to GeoShield Project Team (Aum Lenka and Amishi Kingrani). | **PASS** |
| **Contact Address** | Valid inquiry email address | **PASS** — Configured to `aumlenka51@gmail.com` with mailto links. | **PASS** |
| **Publication Dates** | Real last-updated dates on legal notices | **PASS** — Configured to `October 12, 2026` across Privacy Notice and Terms of Use. | **PASS** |

---

## 2. Deployment Configuration

| Environment Key | Location | Intended Production Value | Verified in Code | Cloud Configuration Status |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Vercel (Frontend) | `https://geoshield-hazel.vercel.app` | Yes (in `siteConfig.ts`) | Must verify in Vercel Dashboard |
| `NEXT_PUBLIC_API_BASE_URL` | Vercel (Frontend) | `https://geoshield-api-9nl7.onrender.com` | Yes (in `lib/config.ts`) | **Must be set in Vercel Dashboard** |
| `NEXT_PUBLIC_USE_MOCKS` | Vercel (Frontend) | `false` | Yes (defaults to `false`) | Verified `false` |
| `NEXT_PUBLIC_MAP_STYLE_URL` | Vercel (Frontend) | Carto Dark Matter GL Style JSON | Yes (keyless CDN) | Verified working |
| `CORS_ALLOWED_ORIGINS` | Render (Backend) | `https://geoshield-hazel.vercel.app` | Yes (whitelisted in `main.py`) | **Must be set in Render Dashboard** |
| `ENABLE_DOCS` | Render (Backend) | `false` (recommended for production) | Yes (flag in `main.py`) | Set `false` in Render Dashboard |
| `DATABASE_URL` | Render (Backend) | `postgresql+psycopg2://...` (Supabase pooler) | Yes (in `database.py`) | Verified via Render env |

---

## 3. Privacy & Legal Review

| Item | Requirement | Verification Evidence / Finding | Status |
|---|---|---|---|
| **Zero Cookies** | No cookies stored | Chromium headless audit: 0 cookies registered. | **PASS** |
| **Zero Trackers** | No analytics or tracking beacons | Chromium audit: 0 third-party analytics scripts loaded. | **PASS** |
| **Local Storage Hygiene** | No tracking storage | Chromium audit: 0 localStorage / sessionStorage / IndexedDB keys. | **PASS** |
| **Hosting Disclosure** | Accurate infrastructure roles | Disclosed: Vercel Hobby (frontend), Render Hobby (API), Supabase (database). | **PASS** |
| **Vercel Log Retention** | Stated frontend log duration | **PASS** — Configured to `1 hour for runtime logs on the Vercel Hobby plan` based on official docs. | **PASS** |
| **Render Log Retention** | Stated backend log duration | **PASS** — Configured to `7 days for service logs on the Render Hobby workspace plan` based on official docs. | **PASS** |
| **Database Isolation** | PostGIS log isolation | Supabase queries are internal via Render pooler. No direct public visitor logs on DB. | **PASS** |
| **Jurisdiction Clause** | Stated dispute jurisdiction | Token in `lib/siteConfig.ts:56` (`[[PLACEHOLDER: DRAFT — PENDING LEGAL REVIEW...]]`). Explicit draft advisory rendered on `/terms`. | **BLOCKER** |

---

## 4. Data Licensing & Attribution

| Dataset | Licensor / Source | Licensing Status | Public Distribution Posture |
|---|---|---|---|
| **NASADEM (30m)** | NASA JPL / OpenTopography | Public Domain / CC0 equivalent | Permitted with attribution (present on site). |
| **GSI Bhusanket Inventory** | Geological Survey of India | Crown Copyright / Restricted | **Raw point data MUST NOT be redistributed**. Derived cell risk scores only. |
| **Open-Meteo ERA5** | Open-Meteo GmbH | CC BY 4.0 | Permitted with attribution (present on site). |
| **SoilGrids 2.0** | ISRIC | CC BY 4.0 | Permitted with attribution (present on site). |
| **OpenStreetMap Roads** | © OpenStreetMap contributors | ODbL 1.0 | Visual produced work compliant; raw DB must carry ODbL if published. |
| **WorldPop (100m)** | Univ. of Southampton | CC BY 4.0 | Permitted with academic citation. |
| **Sentinel-2** | ESA Copernicus | Open Data | Permitted with attribution. |
| **Basemap Tiles** | CARTO Dark Matter | Free Web Tile Terms | Keyless non-commercial tier allowed. |

---

## 5. Accessibility & Functional Verification

| Check | Tool / Standard | Result | Evidence |
|---|---|---|---|
| **Production Build** | `npm run build` | 10/10 routes static | Compiled cleanly in Turbopack with 0 warnings. |
| **Backend Neutrality** | Benchmark cells `r0142_c0087` & `r0137_c0204` | 100% matched | Score: 32.7 (Low-Moderate) & 73.3 (Critical). |
| **What-If Simulation** | 0% and +30% rainfall deltas | 100% matched | +30% elevates cell 1 trigger to HIGH and risk to Moderate. |
| **Security Headers** | HTTP response headers | All enforced | `nosniff`, `DENY`, `strict-origin`, Permissions-Policy active. |
| **CSP Report-Only** | Content-Security-Policy | Verified clean | Connect-src allows local, Render, Carto, and OSM. |
| **Skip Link** | WCAG 2.2 AA (`#main-content`) | Working | Bypasses header straight to main content. |
| **Modal Focus Trap** | Methodology Dialog | Working | Esc key closes modal; focus restored to trigger. |
| **Aria Live Alerts** | Search & Simulation | Working | Screen readers announce error and status changes. |
| **Mobile Responsiveness** | 390px Viewport | Working | Header and drawer collapse smoothly without covering map. |

---

## 6. Readiness Assessment: Demo vs. Full Public Launch

### A. Demo / Academic Presentation Readiness: ✅ **READY**
GeoShield is **fully prepared and approved for academic demonstration, user testing, and stakeholder review**:
- The UI, interactive 3D map, cell search, detail drawer, and rainfall slider simulation are 100% functional.
- Zero cookies, zero third-party tracking scripts, zero console errors.
- Visuals never expose raw placeholder tokens; transparent "Draft — Pending Legal Review" disclaimers are clearly presented to users.
- Production build compiles 10/10 static pages cleanly with zero TypeScript errors.

### B. Full Public Launch Readiness: 🛑 **BLOCKED**
GeoShield is **blocked from unrestricted public launch approval** due to the following pending items:
1. **Governing Law / Jurisdiction Legal Review:** `lib/siteConfig.ts:56` retains `[[PLACEHOLDER: DRAFT — PENDING LEGAL REVIEW: Governing law and jurisdiction clause to be reviewed by counsel]]` (exit code 1 on `npm run check:placeholders`). A qualified legal counsel must confirm the dispute venue clause before final un-gated deployment.
2. **Cloud Environment Variable Audit:**
   - Confirm `NEXT_PUBLIC_API_BASE_URL=https://geoshield-api-9nl7.onrender.com` is configured in the Vercel project environment.
   - Confirm `CORS_ALLOWED_ORIGINS` includes `https://geoshield-hazel.vercel.app` and `ENABLE_DOCS=false` in the Render web service settings.
