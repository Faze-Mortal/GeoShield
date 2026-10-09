'use client';

import { useState, useCallback } from 'react';
import type { SimulateResponse } from '@/types/api';
import { getRiskStyle } from '@/lib/risk';

export function useSimulation() {
  const [simulationData, setSimulationData] = useState<SimulateResponse | null>(null);

  const handleSimulationChange = useCallback((sim: SimulateResponse | null) => {
    setSimulationData(sim);
  }, []);

  const resetSimulation = useCallback(() => {
    setSimulationData(null);
  }, []);

  const simulatedRiskColor = simulationData
    ? getRiskStyle(simulationData.simulated_current_risk).color
    : null;

  return {
    simulationData,
    simulatedRiskColor,
    handleSimulationChange,
    resetSimulation,
  };
}
