from datetime import date
from pathlib import Path
import sys
import json

import pandas as pd
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import GridRisk


# Make the supplied GeoShield rainfall logic importable without changing it.
PROJECT_ROOT = Path(__file__).resolve().parents[2]
SUPPORTING_DIR = PROJECT_ROOT / "supporting"
if str(SUPPORTING_DIR) not in sys.path:
    sys.path.insert(0, str(SUPPORTING_DIR))

from rainfall_trigger import (  # noqa: E402
    compute_rainfall_trigger_for_station,
    current_risk,
)


app = FastAPI(title="GeoShield API")

# Allow the local Next.js frontend to call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

def json_safe(value):
    """Convert NumPy scalar values returned by the supplied trigger module to JSON types."""
    if isinstance(value, dict):
        return {key: json_safe(item) for key, item in value.items()}
    if isinstance(value, list):
        return [json_safe(item) for item in value]
    if hasattr(value, "item"):
        try:
            return value.item()
        except (ValueError, TypeError):
            pass
    return value



RAINFALL_FILE = SUPPORTING_DIR / "rainfall_kullu_mandi_v2.csv"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class SimulationRequest(BaseModel):
    cell_id: str = Field(..., description="GeoShield grid cell ID, e.g. r0142_c0087")
    rainfall_adjustment_percent: float = Field(
        ...,
        description="Rainfall scenario adjustment in percent. Example: 30 means +30%.",
        gt=-100,
    )
    as_of_date: date | None = Field(
        default=None,
        description="Date to evaluate. Defaults to the latest date in the supplied rainfall history.",
    )


@app.get("/")
def root():
    return {"message": "GeoShield API is running"}


@app.get("/predict/{cell_id}")
def predict(cell_id: str, db: Session = Depends(get_db)):
    cell = db.query(GridRisk).filter(GridRisk.cell_id == cell_id).first()

    if cell is None:
        raise HTTPException(status_code=404, detail="Cell not found")

    return {
        "cell_id": cell.cell_id,
        "rainfall_location_id": cell.nearest_rainfall_location_id,
        "susceptibility_score": cell.susceptibility_score,
        "trigger_state": cell.trigger_state,
        "current_risk": cell.current_risk,
        "susceptibility_bin": cell.susceptibility_bin,
        "rainfall_date": "2026-09-12"
    }


@app.get("/grid")
def grid(
    cell_id: str | None = Query(default=None),
    min_lon: float | None = Query(default=None),
    min_lat: float | None = Query(default=None),
    max_lon: float | None = Query(default=None),
    max_lat: float | None = Query(default=None),
    limit: int = Query(default=1000, ge=1, le=10000),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    """Return PostGIS grid polygons as a GeoJSON FeatureCollection."""

    bbox_values = [min_lon, min_lat, max_lon, max_lat]
    supplied_bbox_values = [v is not None for v in bbox_values]

    if any(supplied_bbox_values) and not all(supplied_bbox_values):
        raise HTTPException(
            status_code=400,
            detail="Provide all four bounding-box parameters: min_lon, min_lat, max_lon, max_lat",
        )

    query = db.query(
        GridRisk.cell_id,
        GridRisk.nearest_rainfall_location_id,
        GridRisk.susceptibility_score,
        GridRisk.trigger_state,
        GridRisk.current_risk,
        GridRisk.susceptibility_bin,
        func.ST_AsGeoJSON(GridRisk.geometry).label("geometry"),
    )

    if cell_id is not None:
        query = query.filter(GridRisk.cell_id == cell_id)

    if all(supplied_bbox_values):
        envelope = func.ST_MakeEnvelope(
            min_lon, min_lat, max_lon, max_lat, 4326
        )
        query = query.filter(
            func.ST_Intersects(GridRisk.geometry, envelope)
        )

    rows = query.order_by(GridRisk.cell_id).offset(offset).limit(limit).all()

    features = []
    for row in rows:
        geometry = json.loads(row.geometry) if row.geometry else None

        features.append(
            {
                "type": "Feature",
                "geometry": geometry,
                "properties": {
                    "cell_id": row.cell_id,
                    "nearest_rainfall_location_id": row.nearest_rainfall_location_id,
                    "susceptibility_score": row.susceptibility_score,
                    "trigger_state": row.trigger_state,
                    "current_risk": row.current_risk,
                    "susceptibility_bin": row.susceptibility_bin,
                },
            }
        )

    return {
        "type": "FeatureCollection",
        "features": features,
        "count": len(features),
        "limit": limit,
        "offset": offset,
    }


@app.post("/simulate")
def simulate(request: SimulationRequest, db: Session = Depends(get_db)):
    """
    Run the existing rainfall-trigger logic for one cell under a rainfall
    percentage scenario. Susceptibility remains unchanged.
    """

    cell = db.query(GridRisk).filter(GridRisk.cell_id == request.cell_id).first()

    if cell is None:
        raise HTTPException(status_code=404, detail="Cell not found")

    if not RAINFALL_FILE.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Rainfall data file not found: {RAINFALL_FILE}",
        )

    rainfall = pd.read_csv(RAINFALL_FILE)
    rainfall["date"] = pd.to_datetime(rainfall["date"])

    station = rainfall[
        rainfall["location_id"] == cell.nearest_rainfall_location_id
    ].copy()

    if station.empty:
        raise HTTPException(
            status_code=404,
            detail="Rainfall history not found for this cell's assigned station",
        )

    evaluation_date = (
        pd.Timestamp(request.as_of_date)
        if request.as_of_date is not None
        else station["date"].max()
    )

    station = station[station["date"] <= evaluation_date].copy()

    if len(station) < 30:
        raise HTTPException(
            status_code=400,
            detail="At least 30 rainfall records are required for the selected date",
        )

    adjustment_factor = 1 + (request.rainfall_adjustment_percent / 100.0)
    station["precipitation_mm"] = (
        station["precipitation_mm"] * adjustment_factor
    )

    result = compute_rainfall_trigger_for_station(
        station[["date", "precipitation_mm"]],
        evaluation_date,
    )

    if result is None:
        raise HTTPException(
            status_code=400,
            detail="Not enough rainfall history to evaluate the selected date",
        )

    simulated_trigger = result["trigger_state"]
    simulated_risk, simulated_bin = current_risk(
        cell.susceptibility_score,
        simulated_trigger,
    )

    result = json_safe(result)

    return {
        "cell_id": cell.cell_id,
        "as_of_date": evaluation_date.date().isoformat(),
        "rainfall_adjustment_percent": request.rainfall_adjustment_percent,
        "susceptibility_score": cell.susceptibility_score,
        "susceptibility_bin": simulated_bin,
        "original_trigger_state": cell.trigger_state,
        "simulated_trigger_state": simulated_trigger,
        "original_current_risk": cell.current_risk,
        "simulated_current_risk": simulated_risk,
        "rainfall_trigger": result,
    }
