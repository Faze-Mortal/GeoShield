// ---------------------------------------------------------------------------
// GeoShield — centralized risk / trigger / susceptibility styling (§6.4)
// High-legibility, desaturated GIS emergency-operations palette
// ---------------------------------------------------------------------------

import type { CurrentRisk, TriggerState, SusceptibilityBin } from '@/types/api';

// ---- Current Risk ---------------------------------------------------------

export interface RiskStyle {
  color: string;
  label: string;
  order: number;
  textColor: string;
}

/** Ordered list of Current Risk levels (Low → Critical). */
export const RISK_LEVELS: CurrentRisk[] = [
  'Low',
  'Low-Moderate',
  'Moderate',
  'Elevated',
  'High',
  'Critical',
];

/**
 * Color map for Current Risk — calibrated for high-contrast readability
 * on dark GIS basemaps without neon blooming.
 */
export const RISK_STYLES: Record<CurrentRisk, RiskStyle> = {
  Low:            { color: '#16a34a', label: 'Low',            order: 0, textColor: '#4ade80' },
  'Low-Moderate': { color: '#65a30d', label: 'Low-Moderate',   order: 1, textColor: '#a3e635' },
  Moderate:       { color: '#ca8a04', label: 'Moderate',       order: 2, textColor: '#facc15' },
  Elevated:       { color: '#ea580c', label: 'Elevated',       order: 3, textColor: '#fb923c' },
  High:           { color: '#dc2626', label: 'High',           order: 4, textColor: '#f87171' },
  Critical:       { color: '#9333ea', label: 'Critical',       order: 5, textColor: '#c084fc' },
};

export const RISK_FALLBACK_COLOR = '#475569';

/** Build a MapLibre `match` expression for fill-color by current_risk. */
export function riskMatchExpression(): (string | string[])[] {
  const expr: (string | string[])[] = ['match', ['get', 'current_risk']];
  for (const level of RISK_LEVELS) {
    expr.push(level, RISK_STYLES[level].color);
  }
  expr.push(RISK_FALLBACK_COLOR); // fallback
  return expr;
}

/** Get the style for a risk value (or fallback). */
export function getRiskStyle(risk: string): RiskStyle {
  return (
    RISK_STYLES[risk as CurrentRisk] ?? {
      color: RISK_FALLBACK_COLOR,
      label: risk,
      order: 99,
      textColor: '#94a3b8',
    }
  );
}

// ---- Trigger State --------------------------------------------------------

export interface TriggerStyle {
  color: string;
  label: string;
  meaning: string;
}

export const TRIGGER_STYLES: Record<TriggerState, TriggerStyle> = {
  LOW:      { color: '#16a34a', label: 'LOW',      meaning: 'No rainfall threshold conditions exceeded' },
  ELEVATED: { color: '#ea580c', label: 'ELEVATED', meaning: '1 threshold condition exceeded' },
  HIGH:     { color: '#dc2626', label: 'HIGH',     meaning: '2 or more threshold conditions exceeded' },
};

export function getTriggerStyle(state: string): TriggerStyle {
  return (
    TRIGGER_STYLES[state as TriggerState] ?? {
      color: RISK_FALLBACK_COLOR,
      label: state,
      meaning: 'Unknown trigger state',
    }
  );
}

// ---- Susceptibility Bin ---------------------------------------------------

export interface BinStyle {
  color: string;
  label: string;
}

export const BIN_STYLES: Record<SusceptibilityBin, BinStyle> = {
  Low:      { color: '#16a34a', label: 'Low (<33)' },
  Moderate: { color: '#ca8a04', label: 'Moderate (33–66)' },
  High:     { color: '#dc2626', label: 'High (≥66)' },
};

export function getBinStyle(bin: string): BinStyle {
  return (
    BIN_STYLES[bin as SusceptibilityBin] ?? {
      color: RISK_FALLBACK_COLOR,
      label: bin,
    }
  );
}

// ---- Risk matrix (static, for methodology modal) --------------------------

export const RISK_MATRIX: { susBin: SusceptibilityBin; low: CurrentRisk; elevated: CurrentRisk; high: CurrentRisk }[] = [
  { susBin: 'Low',      low: 'Low',      elevated: 'Low-Moderate', high: 'Moderate' },
  { susBin: 'Moderate', low: 'Moderate',  elevated: 'High',        high: 'High' },
  { susBin: 'High',     low: 'Elevated',  elevated: 'High',        high: 'Critical' },
];
