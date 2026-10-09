# GeoShield

**AI/ML-Powered Landslide Risk Platform for Kullu & Mandi Districts, Himachal Pradesh, India**

GeoShield is a high-resolution landslide hazard assessment and early-warning decision platform that couples a static machine-learning susceptibility index with dynamic meteorological rainfall triggering across a 500m × 500m spatial grid.

---

## 🏛️ System Architecture

GeoShield operates on a decoupled two-layer hazard framework:

1. **Susceptibility Layer (Static ML)**:
   - Trained XGBoost model trained on historical landslide inventory, terrain morphology (slope, aspect, elevation, curvature from DEM), geology, and soil parameters.
   - Outputs a static **Susceptibility Score** (0–100 relative index) binned into `Low`, `Moderate`, and `High`.

2. **Rainfall Trigger Layer (Dynamic Meteorological)**:
   - Evaluates multi-day antecedent rainfall and intensity thresholds (calibrated against empirical Himalayan thresholds from Singh et al., 2025).
   - Classifies meteorological stress into `LOW` (0 conditions exceeded), `ELEVATED` (1 condition exceeded), or `HIGH` (2+ conditions exceeded).

3. **Current Risk Evaluation**:
   - A deterministic 3×3 decision matrix merges Susceptibility Bin and Trigger State into operational **Current Risk** levels (`Low`, `Low-Moderate`, `Moderate`, `Elevated`, `High`, `Critical`).

---

## 📂 Repository Structure

```
GeoShield/
├── geoshield-frontend/                 # Web Application
│   ├── app/                            # Next.js App Router (pages & layout)
│   ├── components/                     # MapLibre map, panels, legends, search
│   ├── lib/                            # Risk calculation & styling utilities
│   ├── services/                       # API integration layer with fallback
│   ├── public/                         # Static assets & web worker
│   └── verify_fixes.py                 # Real-browser Playwright test suite
│
├── GeoShield_Backend/                  # Backend & Data Engine
│   └── GeoShield_Backend/
│       ├── backend/                    # FastAPI application & ML inference endpoints
│       ├── database/                   # PostGIS schemas & data loader scripts
│       ├── data/                       # Processed grid feature datasets
│       └── supporting/                 # GeoPackage grids & reference models
│
├── data_sources.md.txt                 # Remote GIS & meteorological data sources reference
└── README.md                           # Monorepo documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.18+ (Node.js 20+ recommended)
- **Python**: 3.10+
- **PostgreSQL**: 15+ with **PostGIS** extension enabled

---

### 2. Backend Setup (FastAPI + PostGIS)

```bash
cd GeoShield_Backend/GeoShield_Backend/backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials:
# DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/geoshield

# Initialize database schema and import grid data
python ../database/import_data.py

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API will be available at `http://127.0.0.1:8000` (docs at `http://127.0.0.1:8000/docs`).

---

### 3. Frontend Setup (Next.js + MapLibre GL JS)

```bash
cd geoshield-frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# Run development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

### 4. Running Production Build

```bash
cd geoshield-frontend
npm run build
npm start
```

---

## 🧪 Testing & Verification

Run the automated Playwright Chromium end-to-end test suite:

```bash
cd geoshield-frontend
python verify_fixes.py
```

This verifies:
- MapLibre worker serialization & zero console errors
- Next.js dev overlay indicator state
- Full WCAG AA color contrast ratios (≥ 4.5:1 text, ≥ 3.0:1 UI boundaries)
- Cell selection, search lookup, quick examples, and rainfall what-if simulations
