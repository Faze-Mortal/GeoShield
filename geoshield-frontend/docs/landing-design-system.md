# GeoShield Landing Page Design System
**Art Direction**: Premium Cartographic Storytelling × Scientific Editorial Design × Cinematic Terrain Visualization

---

## 1. Design Concept & Philosophy
The landing page tells the scientific and engineering journey of GeoShield as a scroll-driven narrative across 8 chapters. It avoids SaaS marketing tropes (no neon glow, no generic card grids, no empty buzzwords) in favor of restrained, authoritative GIS editorial design:
- **Tone**: Rigorous, transparent, cartographic, restrained, honest about limitations.
- **Visual Vocabulary**: Contours, cross-sections, data grids, tactile matrix, clean typography, selective elevation profiles.
- **Narrative Arc**: The physical hazard → Earth science mechanisms → Evidence gathering & 12 model features → Methodological pivot (event dates reality) → Decoupled two-layer architecture → 3×3 Risk Matrix → What-if simulation → System boundaries and limits.

---

## 2. Typography Hierarchy (Max 3 Font Families)

| Role | Font Family | Weights / Style | Purpose |
| :--- | :--- | :--- | :--- |
| **Editorial Display** | `Newsreader` (serif, `var(--font-serif)`) | Regular (400), Medium (500), Italic | Chapter headlines, conceptual quotes, hero statement, editorial narrative hooks |
| **Interface / Body** | `Geist Sans` (sans, `var(--font-sans)`) | Regular (400), Medium (500), Semibold (600) | Explanatory prose, labels, table headers, descriptions, controls |
| **Data / Technical** | `Geist Mono` (mono, `var(--font-mono)`) | Regular (400), Medium (500) | Numerical figures, cell IDs (`r0142_c0087`), formula equations, coordinates, status tokens |

### Type Scale
- **Display 1 (Hero)**: `text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-[1.08]`
- **Display 2 (Chapter Headline)**: `text-2xl md:text-4xl font-serif tracking-tight leading-snug`
- **Subheading**: `text-base md:text-lg text-slate-300 font-sans leading-relaxed`
- **Body Regular**: `text-sm md:text-base text-slate-300 font-sans leading-relaxed`
- **Technical Caption / Small**: `text-xs text-slate-400 font-sans leading-normal`
- **Micro / Data Label**: `text-[11px] font-mono tracking-wider uppercase text-slate-400`

---

## 3. Color Architecture & Tokens

### Base & Surface Tokens (Shared with Dashboard)
- **Deep Void / Background**: `#090e17` (`var(--background)`)
- **Primary Surface Panel**: `#0d1527` (`var(--surface-panel)`)
- **Raised Stage / Container**: `#111a2e` (`var(--surface-raised)`)
- **Card Surface**: `#131e33` (`var(--surface-card)`)
- **Input / Recessed**: `#152238` (`var(--surface-input)`)
- **Subtle Borders**: `rgba(51, 65, 85, 0.45)` (`border-slate-800/80`)
- **Strong Borders**: `#94a3b8` / `#64748b` (`border-slate-400` / `border-slate-500`)

### Brand Accent (Restrained Cyan/Blue)
- **Accent Primary**: `#38bdf8` (sky-400) — used exclusively for active chapter markers, focus rings, and primary interactive links.

### Decoupled Layer Palettes (Distinct from Risk Palette)
To maintain scientific clarity, the two input layers use distinct ramps that never collide with risk colors:
- **Layer A (Susceptibility)**: Warm Ochre / Stone Earth Ramp
  - Soft amber/stone: `#d97706` (amber-600) / `#f59e0b` (amber-500) / `#fde68a` (amber-200)
- **Layer B (Rainfall Trigger)**: Atmospheric Deep Azure Ramp
  - Slate-blue / cyan: `#0284c7` (sky-600) / `#38bdf8` (sky-400) / `#bae6fd` (sky-200)

### Current Risk Palette (Strictly from `lib/risk.ts`)
Only applied when representing final Current Risk outcomes from the 3×3 matrix:
- **Low**: `#16a34a` (green-600)
- **Low-Moderate**: `#65a30d` (lime-600)
- **Moderate**: `#d97706` (amber-600)
- **Elevated**: `#ea580c` (orange-600)
- **High**: `#dc2626` (red-600)
- **Critical**: `#9333ea` (purple-600)

---

## 4. Spacing, Layout & Grid
- **Global Container**: Max width `max-w-5xl` (1024px) for narrative reading comfort; `max-w-6xl` (1152px) for interactive stages.
- **Section Rhythm**: Generous vertical breathing room `py-20 md:py-28 lg:py-32`.
- **Chapter Markers**: Each chapter has a semantic `h2` preceded by a clean mono chapter index (`01 / PROBLEM`, `02 / MECHANICS`, etc.).
- **Side Rail Navigation**: Desktop fixed right rail (`right-6 top-1/2 -translate-y-1/2`) with 8 micro-ticks and accessible hover/focus labels (`aria-current`).

---

## 5. Motion & Interaction Principles
1. **Purpose-Driven Only**: No ambient looping distractions or gratuitous animations. Every motion explains physics or data structure.
2. **Selective Parallax & Contours**: Procedural SVG topographic contours translate subtly on scroll via passive `requestAnimationFrame`.
3. **Hardware Acceleration**: Only animate `transform` and `opacity`.
4. **Accessible Reduced Motion**: Full compliance with `prefers-reduced-motion: reduce`. All continuous loops and scroll-linked transformations collapse into clean, complete static states.
5. **Native Scroll Integrity**: Zero scroll-jacking. No intercepting default wheel/touch events. Sticky visual stages release smoothly.

---

## 6. Accessibility & Contrast (WCAG 2.2 AA)
- Normal body and descriptive text: ≥ 4.5:1 against composited background.
- UI components, button borders, and focus rings: ≥ 3:1.
- All SVG diagrams accompanied by descriptive `aria-label` or accessible text fallback.
- Full keyboard operability (Tab order, Enter/Space/arrows for matrix cells, visible focus outlines in `#38bdf8`).
- Mobile touch targets: ≥ 44px for all interactive elements.
