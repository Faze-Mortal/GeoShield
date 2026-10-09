# GeoShield Frontend

GeoShield is a landslide risk intelligence platform for Kullu and Mandi districts, Himachal Pradesh, India. It combines a static machine-learning susceptibility model with dynamic empirical rainfall thresholds to deliver high-resolution (500 m × 500 m) situational risk assessment and scenario simulation.

---

## 1. Scientific & System Architecture

GeoShield operates on a two-layer analytical model:
1. **Susceptibility Layer**: A static machine-learning model (XGBoost) evaluating terrain, slope, geology, soil, and historical landslide records. It outputs a **Susceptibility Score** (0–100 relative index) that remains constant regardless of weather conditions.
2. **Rainfall Trigger Layer**: A rule-based evaluation using cumulative multi-day precipitation thresholds to classify acute rainfall conditions into **LOW**, **ELEVATED**, or **HIGH**.

### Current Risk Lookup Matrix (3 × 3)
The Susceptibility Bin combines with the Trigger State to yield **Current Risk**:

| Susceptibility Bin \ Trigger | LOW | ELEVATED | HIGH |
|---|---|---|---|
| **Low (<33)** | Low | Low-Moderate | Moderate |
| **Moderate (33–66)** | Moderate | High | High |
| **High (≥66)** | Elevated | High | Critical |

*Trigger State Rules:*
- **LOW**: No rainfall conditions exceeded.
- **ELEVATED**: 1 rainfall condition exceeded.
- **HIGH**: 2 or more rainfall conditions exceeded.

---

## 2. Tech Stack

- **Framework**: Next.js (App Router) + React 19 + TypeScript (strict)
- **Styling**: Tailwind CSS (dark mode disaster-management theme)
- **Mapping**: MapLibre GL JS directly (`maplibre-gl`), loaded dynamically with `ssr: false`
- **Basemap**: CARTO Dark Matter keyless GL style
- **State Management**: Lightweight React hooks (`useCellSelection`, `useSimulation`) and refs

---

## 3. Project Structure

```
geoshield-frontend/
├── app/
│   ├── globals.css              # Dark theme tokens, scrollbars, MapLibre overrides
│   ├── layout.tsx               # Root layout with typography and metadata
│   └── page.tsx                 # Full-viewport application layout & state orchestration
├── components/
│   ├── map/
│   │   ├── GeoShieldMap.tsx     # MapLibre map with viewport grid loading & highlight
│   │   ├── MapLegend.tsx        # Floating risk color swatch legend
│   │   └── MapStatusOverlay.tsx # Status chip, zoom hints, truncation alerts, loaders
│   ├── panels/
│   │   ├── CellDetailPanel.tsx  # Monospace ID, gauge, badges, metadata, actions
│   │   ├── MethodologyModal.tsx # Scientific methodology & 3x3 matrix dialog
│   │   ├── SearchBar.tsx        # Cell search with format hint & quick-fill buttons
│   │   └── SimulationPanel.tsx  # +10%/+20%/+30% what-if scenario comparison
│   └── ui/
│       ├── ErrorBoundary.tsx    # React error boundary preventing blank screens
│       └── index.tsx            # Badge, Button, Spinner, Skeleton, ErrorNotice
├── hooks/
│   ├── useCellSelection.ts      # Selected cell state, geometry & predict fetching
│   └── useSimulation.ts         # Active scenario state & local highlight recoloring
├── lib/
│   ├── api.ts                   # Central fetch wrapper with ApiError, abort & timeout
│   ├── config.ts                # Environment variables, bounding box, map constants
│   ├── geo.ts                   # Bbox padding, containment check & polygon bounds
│   └── risk.ts                  # Single source of truth for risk/trigger/bin styles
├── mocks/
│   └── mockAdapter.ts           # Optional dev mock adapter (behind explicit flag)
├── services/
│   ├── gridService.ts           # /grid endpoint & getCellGeometry
│   ├── healthService.ts         # / health check
│   ├── predictService.ts        # /predict/{cell_id} endpoint
│   └── simulateService.ts       # POST /simulate endpoint
├── types/
│   └── api.ts                   # Exact backend response types
├── .env.local                   # Local env file (NEXT_PUBLIC_API_BASE_URL)
├── .env.local.example           # Template env file
└── package.json
```

---

## 4. Viewport-Based Grid Loading Strategy

The platform covers 96,118 grid cells (500 m × 500 m). Loading the entire dataset at once would degrade browser performance. GeoShield implements a high-performance viewport loading strategy:

1. **Min Zoom Gate (`MIN_GRID_ZOOM = 11`)**:
   Below zoom 11, grid queries are skipped to avoid requesting thousands of cells. A clear hint overlay informs the user to zoom in, with a one-click "Zoom to grid" action.
2. **Bounding Box Padding (`BBOX_PAD_FACTOR = 0.25`)**:
   Requested bounding boxes are expanded by 25% on all four sides. Panning within the loaded envelope reuses existing polygons without refetching.
3. **Moveend Debounce (`GRID_DEBOUNCE_MS = 400`)**:
   Queries are triggered only on `moveend` after a 400 ms quiet period, not on continuous drag events.
4. **Stale Request Cancellation**:
   Each new viewport movement aborts any in-flight grid request via `AbortController` and guards race conditions with sequence numbers.
5. **Bounded In-Memory Cache**:
   A 6-slot LRU cache keyed by rounded coordinates makes back-and-forth panning instantaneous.
6. **Truncation Handling**:
   Requests enforce the backend's `limit=10000`. If `count === limit`, the query retries with the unpadded viewport. If still capped, an unobtrusive warning banner is displayed.

---

## 5. Running Locally (PowerShell on Windows)

### Prerequisites
- Node.js (v18+)
- Python 3.10+ with PostgreSQL/PostGIS (for backend)

### Step 1: Start Backend (Port 8000)
Open PowerShell:
```powershell
cd "GeoShield_Backend\GeoShield_Backend\backend"
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Verify backend health: `http://127.0.0.1:8000/` returns `{"message":"GeoShield API is running"}`.

### Step 2: Start Frontend (Port 3000)
Open a new PowerShell terminal:
```powershell
cd geoshield-frontend
npm install
npm run dev -- -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note on Ports**: The backend CORS middleware strictly allows `http://localhost:3000` and `http://127.0.0.1:3000`. Running on any other port will trigger CORS blocks.

---

## 6. Environment Variables

Create `.env.local` in `geoshield-frontend`:
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Optional settings:
```env
# Custom MapLibre GL style JSON (defaults to Carto Dark Matter)
NEXT_PUBLIC_MAP_STYLE_URL=https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json

# Explicit mock adapter toggle (defaults to false)
NEXT_PUBLIC_USE_MOCKS=false
```

---

## 7. Build and Verification Commands

```powershell
# Typecheck and build production bundle
npm run build

# Run linting
npm run lint
```
