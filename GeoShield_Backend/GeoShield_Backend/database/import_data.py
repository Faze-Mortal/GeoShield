import csv
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"

RISK_CSV = DATA_DIR / "grid_current_risk.csv"
GEOMETRY_CSV = DATA_DIR / "grid_kullu_mandi_geometry.csv"

load_dotenv(PROJECT_ROOT / "backend" / ".env")
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL not found. Copy backend/.env.example to backend/.env "
        "and set your PostgreSQL connection string."
    )

engine = create_engine(DATABASE_URL, pool_pre_ping=True)


with engine.begin() as conn:
    print("Creating PostGIS extension...")
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))

    print("Creating grid_risk table...")
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS grid_risk (
            cell_id TEXT PRIMARY KEY,
            nearest_rainfall_location_id INTEGER,
            susceptibility_score DOUBLE PRECISION,
            trigger_state TEXT,
            current_risk TEXT,
            susceptibility_bin TEXT,
            geometry geometry(Polygon, 4326)
        );
    """))

    print("Loading risk data...")
    with open(RISK_CSV, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    conn.execute(
        text("""
            INSERT INTO grid_risk (
                cell_id,
                nearest_rainfall_location_id,
                susceptibility_score,
                trigger_state,
                current_risk,
                susceptibility_bin
            )
            VALUES (
                :cell_id,
                :nearest_rainfall_location_id,
                :susceptibility_score,
                :trigger_state,
                :current_risk,
                :susceptibility_bin
            )
            ON CONFLICT (cell_id) DO UPDATE SET
                nearest_rainfall_location_id = EXCLUDED.nearest_rainfall_location_id,
                susceptibility_score = EXCLUDED.susceptibility_score,
                trigger_state = EXCLUDED.trigger_state,
                current_risk = EXCLUDED.current_risk,
                susceptibility_bin = EXCLUDED.susceptibility_bin;
        """),
        rows,
    )
    print(f"Loaded {len(rows)} risk records.")

    print("Creating geometry staging table...")
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS grid_geometry_import (
            cell_id TEXT,
            geom_wkb_hex TEXT
        );
    """))
    conn.execute(text("TRUNCATE TABLE grid_geometry_import;"))

    print("Loading geometry data...")
    with open(GEOMETRY_CSV, newline="", encoding="utf-8") as f:
        geometry_rows = list(csv.DictReader(f))

    conn.execute(
        text("""
            INSERT INTO grid_geometry_import (cell_id, geom_wkb_hex)
            VALUES (:cell_id, :geom_wkb_hex);
        """),
        geometry_rows,
    )
    print(f"Loaded {len(geometry_rows)} geometry records.")

    print("Converting WKB geometry...")
    conn.execute(text("""
        UPDATE grid_risk
        SET geometry = ST_SetSRID(
            ST_GeomFromWKB(
                decode(grid_geometry_import.geom_wkb_hex, 'hex')
            ),
            4326
        )
        FROM grid_geometry_import
        WHERE grid_risk.cell_id = grid_geometry_import.cell_id;
    """))

    conn.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_grid_risk_geometry
        ON grid_risk
        USING GIST (geometry);
    """))

    total = conn.execute(text("SELECT COUNT(*) FROM grid_risk")).scalar()
    with_geometry = conn.execute(text("""
        SELECT COUNT(*) FROM grid_risk WHERE geometry IS NOT NULL
    """)).scalar()

    print()
    print("DATABASE IMPORT COMPLETE")
    print(f"Total grid cells: {total}")
    print(f"Cells with geometry: {with_geometry}")
