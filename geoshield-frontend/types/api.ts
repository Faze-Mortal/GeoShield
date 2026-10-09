// ---------------------------------------------------------------------------
// GeoShield — exact backend response types (§2)
// ---------------------------------------------------------------------------

/** Allowed Current Risk levels (ordered Low → Critical). */
export type CurrentRisk =
  | 'Low'
  | 'Low-Moderate'
  | 'Moderate'
  | 'Elevated'
  | 'High'
  | 'Critical';

/** Rainfall trigger classification. */
export type TriggerState = 'LOW' | 'ELEVATED' | 'HIGH';

/** ML susceptibility bucket. */
export type SusceptibilityBin = 'Low' | 'Moderate' | 'High';

// ---- /predict/{cell_id} ---------------------------------------------------

export interface PredictResponse {
  cell_id: string;
  rainfall_location_id: number;
  susceptibility_score: number;
  trigger_state: string;       // TriggerState, but accept unknown strings
  current_risk: string;        // CurrentRisk, but accept unknown strings
  susceptibility_bin: string;  // SusceptibilityBin
  rainfall_date: string;       // "YYYY-MM-DD"
}

// ---- /grid ----------------------------------------------------------------

export interface GridFeatureProperties {
  cell_id: string;
  nearest_rainfall_location_id: number;
  susceptibility_score: number;
  trigger_state: string;
  current_risk: string;
  susceptibility_bin: string;
}

export interface GridFeature {
  type: 'Feature';
  geometry: GeoJSON.Polygon | null;
  properties: GridFeatureProperties;
}

export interface GridResponse {
  type: 'FeatureCollection';
  features: GridFeature[];
  count: number;
  limit: number;
  offset: number;
}

// ---- /simulate ------------------------------------------------------------

export interface SimulateRequest {
  cell_id: string;
  rainfall_adjustment_percent: number;
  as_of_date?: string; // "YYYY-MM-DD" — omitted in MVP
}

export interface SimulateResponse {
  cell_id: string;
  as_of_date: string;
  rainfall_adjustment_percent: number;
  susceptibility_score: number;
  susceptibility_bin: string;
  original_trigger_state: string;
  simulated_trigger_state: string;
  original_current_risk: string;
  simulated_current_risk: string;
  rainfall_trigger: Record<string, unknown>;
}

// ---- health ---------------------------------------------------------------

export interface HealthResponse {
  message: string;
}
