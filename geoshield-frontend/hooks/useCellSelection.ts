'use client';

import { useState, useRef, useCallback } from 'react';
import { getPrediction } from '@/services/predictService';
import { getCellGeometry } from '@/services/gridService';
import type { PredictResponse, GridFeature } from '@/types/api';

export function useCellSelection() {
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [selectedCellFeature, setSelectedCellFeature] = useState<GridFeature | null>(null);
  const [predictData, setPredictData] = useState<PredictResponse | null>(null);
  const [loadingPredict, setLoadingPredict] = useState<boolean>(false);
  const [predictError, setPredictError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const seqRef = useRef<number>(0);

  const selectCell = useCallback(
    async (cellId: string, feature?: GridFeature | null) => {
      // Abort any previous in-flight predict request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const seq = ++seqRef.current;

      setSelectedCellId(cellId);
      setLoadingPredict(true);
      setPredictError(null);
      setPredictData(null);

      // If feature is provided, use it directly; otherwise fetch geometry in background
      if (feature && feature.geometry) {
        setSelectedCellFeature(feature);
      } else {
        getCellGeometry(cellId, controller.signal)
          .then((feat) => {
            if (seq === seqRef.current && feat) {
              setSelectedCellFeature(feat);
            }
          })
          .catch(() => {
            // Geometry fetch error handled gracefully
          });
      }

      try {
        const data = await getPrediction(cellId, controller.signal);
        if (seq !== seqRef.current) return;
        setPredictData(data);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (seq !== seqRef.current) return;
        setPredictError(err instanceof Error ? err.message : 'Failed to fetch prediction');
      } finally {
        if (seq === seqRef.current) {
          setLoadingPredict(false);
        }
      }
    },
    [],
  );

  const clearSelection = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setSelectedCellId(null);
    setSelectedCellFeature(null);
    setPredictData(null);
    setPredictError(null);
    setLoadingPredict(false);
  }, []);

  const retryPredict = useCallback(() => {
    if (selectedCellId) {
      selectCell(selectedCellId, selectedCellFeature);
    }
  }, [selectedCellId, selectedCellFeature, selectCell]);

  return {
    selectedCellId,
    selectedCellFeature,
    predictData,
    loadingPredict,
    predictError,
    selectCell,
    clearSelection,
    retryPredict,
    setSelectedCellFeature,
  };
}
