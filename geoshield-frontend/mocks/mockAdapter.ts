// ---------------------------------------------------------------------------
// GeoShield — optional dev mock adapter (§11)
// Strictly OFF unless NEXT_PUBLIC_USE_MOCKS === 'true'
// ---------------------------------------------------------------------------

import type { PredictResponse, SimulateResponse, GridResponse } from '@/types/api';

export const IS_MOCK_ENABLED: boolean =
  process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

export const MOCK_PREDICT_EXAMPLES: Record<string, PredictResponse> = {
  r0142_c0087: {
    cell_id: 'r0142_c0087',
    rainfall_location_id: 10,
    susceptibility_score: 32.7,
    trigger_state: 'ELEVATED',
    current_risk: 'Low-Moderate',
    susceptibility_bin: 'Low',
    rainfall_date: '2026-09-12',
  },
  r0137_c0204: {
    cell_id: 'r0137_c0204',
    rainfall_location_id: 12,
    susceptibility_score: 73.3,
    trigger_state: 'HIGH',
    current_risk: 'Critical',
    susceptibility_bin: 'High',
    rainfall_date: '2026-09-12',
  },
};

export const MOCK_SIMULATE_EXAMPLE: SimulateResponse = {
  cell_id: 'r0142_c0087',
  as_of_date: '2026-09-12',
  rainfall_adjustment_percent: 30,
  susceptibility_score: 32.7,
  susceptibility_bin: 'Low',
  original_trigger_state: 'ELEVATED',
  simulated_trigger_state: 'HIGH',
  original_current_risk: 'Low-Moderate',
  simulated_current_risk: 'Moderate',
  rainfall_trigger: {
    n_conditions_exceeded: 2,
    trigger_state: 'HIGH',
  },
};

export const MOCK_GRID_SAMPLE: GridResponse = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.145, 31.595],
            [77.155, 31.595],
            [77.155, 31.605],
            [77.145, 31.605],
            [77.145, 31.595],
          ],
        ],
      },
      properties: {
        cell_id: 'r0142_c0087',
        nearest_rainfall_location_id: 10,
        susceptibility_score: 32.7,
        trigger_state: 'ELEVATED',
        current_risk: 'Low-Moderate',
        susceptibility_bin: 'Low',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.165, 31.615],
            [77.175, 31.615],
            [77.175, 31.625],
            [77.165, 31.625],
            [77.165, 31.615],
          ],
        ],
      },
      properties: {
        cell_id: 'r0137_c0204',
        nearest_rainfall_location_id: 12,
        susceptibility_score: 73.3,
        trigger_state: 'HIGH',
        current_risk: 'Critical',
        susceptibility_bin: 'High',
      },
    },
  ],
  count: 2,
  limit: 1000,
  offset: 0,
};
