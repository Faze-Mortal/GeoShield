"""
GeoShield Rainfall Trigger Layer
==================================
Implements the locked spec: Shimla (Singh et al. 2025) as primary threshold source,
threshold EXCEEDANCE (boolean), not continuous ratios. No invented weights.

PRIMARY SOURCE: Singh et al. (2025), Shimla, Himachal Pradesh, Natural Hazards Research
  ID threshold:        I_threshold(D) = 7.20 * D^(-0.26)   [I in mm/day, D in days]
  Antecedent threshold: R_30 >= 110 mm

Trigger state:
  LOW      - no ID threshold exceeded AND R_30 < 110mm
  ELEVATED - exactly one rainfall condition exceeded
  HIGH     - two or more rainfall conditions exceeded
"""
import pandas as pd
import numpy as np

def id_threshold(D):
    """Singh et al. (2025) Shimla ID threshold: I(D) = 7.20 * D^-0.26, I in mm/day"""
    return 7.20 * (D ** -0.26)

def compute_rainfall_trigger_for_station(rainfall_series, as_of_date):
    """
    rainfall_series: DataFrame with columns ['date','precipitation_mm'] for ONE station, sorted by date
    as_of_date: the date to evaluate "current" conditions as of (inclusive)
    Returns dict with exceedance flags and trigger state.
    """
    rainfall_series = rainfall_series.sort_values('date')
    window = rainfall_series[rainfall_series['date'] <= as_of_date].tail(30)

    if len(window) < 30:
        return None  # not enough history to evaluate 30-day antecedent

    R1 = window['precipitation_mm'].tail(1).sum()
    R3 = window['precipitation_mm'].tail(3).sum()
    R7 = window['precipitation_mm'].tail(7).sum()
    R30 = window['precipitation_mm'].tail(30).sum()

    I1, I3, I7 = R1/1, R3/3, R7/7

    id_exceed_1 = I1 >= id_threshold(1)
    id_exceed_3 = I3 >= id_threshold(3)
    id_exceed_7 = I7 >= id_threshold(7)
    antecedent_exceed = R30 >= 110

    n_exceeded = sum([id_exceed_1, id_exceed_3, id_exceed_7, antecedent_exceed])

    if n_exceeded == 0:
        trigger_state = 'LOW'
    elif n_exceeded == 1:
        trigger_state = 'ELEVATED'
    else:
        trigger_state = 'HIGH'

    return {
        'R1_mm': R1, 'R3_mm': R3, 'R7_mm': R7, 'R30_mm': R30,
        'I1_mm_per_day': I1, 'I3_mm_per_day': I3, 'I7_mm_per_day': I7,
        'id_threshold_1d': id_threshold(1), 'id_threshold_3d': id_threshold(3), 'id_threshold_7d': id_threshold(7),
        'id_exceed_1d': id_exceed_1, 'id_exceed_3d': id_exceed_3, 'id_exceed_7d': id_exceed_7,
        'antecedent_exceed_30d': antecedent_exceed,
        'n_conditions_exceeded': n_exceeded,
        'trigger_state': trigger_state
    }

def susceptibility_bin(score):
    """Bins the 0-100 susceptibility score into Low/Moderate/High for the 2D matrix."""
    if score < 33:
        return 'Low'
    elif score < 66:
        return 'Moderate'
    else:
        return 'High'

# 2D decision matrix (Susceptibility bin, Trigger state) -> Current Risk
RISK_MATRIX = {
    ('Low', 'LOW'): 'Low',
    ('Low', 'ELEVATED'): 'Low-Moderate',
    ('Low', 'HIGH'): 'Moderate',
    ('Moderate', 'LOW'): 'Moderate',
    ('Moderate', 'ELEVATED'): 'High',
    ('Moderate', 'HIGH'): 'High',
    ('High', 'LOW'): 'Elevated',
    ('High', 'ELEVATED'): 'High',
    ('High', 'HIGH'): 'Critical',
}

def current_risk(susceptibility_score, trigger_state):
    s_bin = susceptibility_bin(susceptibility_score)
    return RISK_MATRIX[(s_bin, trigger_state)], s_bin
