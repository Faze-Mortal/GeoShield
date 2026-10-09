CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS grid_risk (
    cell_id TEXT PRIMARY KEY,
    nearest_rainfall_location_id INTEGER,
    susceptibility_score DOUBLE PRECISION,
    trigger_state TEXT,
    current_risk TEXT,
    susceptibility_bin TEXT,
    geometry geometry(Polygon, 4326)
);

CREATE INDEX IF NOT EXISTS idx_grid_risk_geometry
ON grid_risk
USING GIST (geometry);
