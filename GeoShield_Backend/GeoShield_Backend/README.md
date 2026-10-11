# GeoShield Backend Handoff

This package is the completed handoff of the **existing GeoShield backend**. The existing `/` and `/predict/{cell_id}` implementation is preserved, with the required `/grid` and `/simulate` endpoints added around the same PostgreSQL/PostGIS data and supplied rainfall-trigger logic.

GeoShield covers a 500m × 500m grid for Kullu + Mandi with 96,118 cells. The supplied `grid_current_risk.csv` contains the precomputed susceptibility/risk values. The supplied rainfall trigger module is used by `/simulate`. The susceptibility score is a **0-100 susceptibility score, not a probability**.

## Folder structure

```text
GeoShield_Backend_Handoff/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── main.py
│   │   └── models.py
│   ├── .env.example
│   └── requirements.txt
├── data/
│   ├── grid_current_risk.csv
│   └── grid_kullu_mandi_geometry.csv
├── database/
│   ├── schema.sql
│   ├── import_data.py
│   └── IMPORT_DATA.md
└── supporting/
    ├── grid_kullu_mandi.gpkg
    ├── master_features_static.csv
    ├── rainfall_kullu_mandi_v2.csv
    └── rainfall_trigger.py
```

There is deliberately **no real `.env` file**, password, token, virtual environment, `__pycache__`, or `.pyc` file in this ZIP.

## 1. Install prerequisites

Install:

- Python 3.10+ recommended
- PostgreSQL
- PostGIS for the same PostgreSQL installation

Create a PostgreSQL database named:

```text
geoshield
```

Enable PostGIS in that database:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

The project uses PostGIS polygons in `grid_risk.geometry`.

## 2. Configure the backend

Open PowerShell in the project root:

```powershell
cd GeoShield_Backend_Handoff
```

Copy the environment template:

```powershell
Copy-Item backend\.env.example backend\.env
```

Open `backend\.env` and replace `YOUR_PASSWORD` with your own PostgreSQL password.

Example:

```text
DATABASE_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/geoshield
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ENABLE_DOCS=true
```

In production, set `CORS_ALLOWED_ORIGINS` to your production frontend domain (e.g. `https://[[PLACEHOLDER: your-domain.com]]`) and set `ENABLE_DOCS=false` to disable interactive documentation endpoints.

**Do not send your real `.env` to anyone or commit it to version control.**

## 3. Create a virtual environment

From the project root:

```powershell
python -m venv backend\venv
backend\venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r backend\requirements.txt
```

## 4. Import the database

The supplied database importer uses:

- `data/grid_current_risk.csv`
- `data/grid_kullu_mandi_geometry.csv`

Run it from the project root:

```powershell
python database\import_data.py
```

The importer creates:

```text
grid_risk
```

with:

```text
cell_id
nearest_rainfall_location_id
susceptibility_score
trigger_state
current_risk
susceptibility_bin
geometry Polygon SRID 4326
```

It also creates the GiST spatial index.

Expected verification:

```text
Total grid cells: 96118
Cells with geometry: 96118
```

The detailed database instructions are in `database/IMPORT_DATA.md`.

## 5. Start FastAPI

### Development Mode
From `backend\`:

```powershell
uvicorn app.main:app --reload
```

### Production Mode (no reload)
In production, run without `--reload` and bind to your production interface/port:

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Swagger UI (when `ENABLE_DOCS=true`):

```text
http://127.0.0.1:8000/docs
```

OpenAPI JSON (when `ENABLE_DOCS=true`):

```text
http://127.0.0.1:8000/openapi.json
```

## 6. Endpoints

### `GET /`

Health check.

Example:

```text
GET http://127.0.0.1:8000/
```

Response:

```json
{
  "message": "GeoShield API is running"
}
```

### `GET /predict/{cell_id}`

Returns the existing precomputed values for one grid cell.

Example:

```text
GET http://127.0.0.1:8000/predict/r0142_c0087
```

Actual supplied-data example:

```json
{
  "cell_id": "r0142_c0087",
  "rainfall_location_id": 10,
  "susceptibility_score": 32.7,
  "trigger_state": "ELEVATED",
  "current_risk": "Low-Moderate",
  "susceptibility_bin": "Low",
  "rainfall_date": "2026-09-12"
}
```

### `GET /grid`

Returns PostGIS polygon geometry as a GeoJSON `FeatureCollection`.

For a single cell:

```text
GET http://127.0.0.1:8000/grid?cell_id=r0142_c0087&limit=1
```

Actual supplied-data example:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [76.93235921097369, 31.40442759669518],
          [76.93245163861458, 31.408936349131743],
          [76.92719458657437, 31.409015521749396],
          [76.92710240999423, 31.404506755380208],
          [76.93235921097369, 31.40442759669518]
        ]]
      },
      "properties": {
        "cell_id": "r0142_c0087",
        "nearest_rainfall_location_id": 10,
        "susceptibility_score": 32.7,
        "trigger_state": "ELEVATED",
        "current_risk": "Low-Moderate",
        "susceptibility_bin": "Low"
      }
    }
  ],
  "count": 1,
  "limit": 1,
  "offset": 0
}
```

Pagination:

```text
GET /grid?limit=1000&offset=0
```

Optional bounding box:

```text
GET /grid?min_lon=76.9&min_lat=31.3&max_lon=77.0&max_lat=31.5&limit=1000
```

All four bounding-box parameters must be supplied together.

### `POST /simulate`

Runs the **existing `rainfall_trigger.py` logic** for one cell after applying a user-specified rainfall scenario adjustment.

The susceptibility score is not retrained or changed. The endpoint only recalculates rainfall-trigger state and then applies the existing susceptibility-bin/risk matrix.

Example request:

```http
POST http://127.0.0.1:8000/simulate
Content-Type: application/json
```

```json
{
  "cell_id": "r0142_c0087",
  "rainfall_adjustment_percent": 30,
  "as_of_date": "2026-09-12"
}
```

Actual supplied-data example:

```json
{
  "cell_id": "r0142_c0087",
  "as_of_date": "2026-09-12",
  "rainfall_adjustment_percent": 30.0,
  "susceptibility_score": 32.7,
  "susceptibility_bin": "Low",
  "original_trigger_state": "ELEVATED",
  "simulated_trigger_state": "HIGH",
  "original_current_risk": "Low-Moderate",
  "simulated_current_risk": "Moderate",
  "rainfall_trigger": {
    "R1_mm": 5.46,
    "R3_mm": 16.9,
    "R7_mm": 27.69,
    "R30_mm": 180.05,
    "I1_mm_per_day": 5.46,
    "I3_mm_per_day": 5.633333333333333,
    "I7_mm_per_day": 3.955714285714286,
    "id_threshold_1d": 7.2,
    "id_threshold_3d": 5.411042813666358,
    "id_threshold_7d": 4.341172128187195,
    "id_exceed_1d": false,
    "id_exceed_3d": true,
    "id_exceed_7d": false,
    "antecedent_exceed_30d": true,
    "n_conditions_exceeded": 2,
    "trigger_state": "HIGH"
  }
}
```

The rainfall history supplied with this handoff ends on `2026-09-12`, so that is the default evaluation date when `as_of_date` is omitted.

## 7. Important architecture rule

`/predict` and `/grid` read the precomputed PostgreSQL/PostGIS values.

`/simulate` does **not** retrain or run a new ML model. It uses the supplied `rainfall_trigger.py` logic and the supplied rainfall history, then combines the resulting trigger state with the existing susceptibility score through the existing risk matrix.

The supplied rainfall trigger defines:

- `LOW`: zero rainfall conditions exceeded
- `ELEVATED`: exactly one condition exceeded
- `HIGH`: two or more conditions exceeded

Its susceptibility bins and risk matrix are retained unchanged.

## 8. What is intentionally not included

- Real `.env`
- PostgreSQL password
- API keys/tokens
- Python virtual environment
- `__pycache__`
- `.pyc` files
- A new ML model
- A replacement rainfall formula

The original supplied rainfall trigger module is included as `supporting/rainfall_trigger.py`.
