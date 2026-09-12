import { useState, useEffect, useCallback } from 'react';
import { digitalTwinServiceApi } from '../api/digital-twin.api';
import type {
  DigitalTwinData,
  DigitalTwinSnapshotData,
  HealthHistoryPoint,
  HealthTrendAnalysisData,
  PaginatedSnapshots,
  SnapshotTriggerReason,
  TrendPeriod,
  UpdateDigitalTwinPayload,
} from '../types/digital-twin.types';
import { storage } from '@/lib/storage';
import { extractErrorMessage } from '@/utils/error.util';

export function useDigitalTwin(initialPeriod: TrendPeriod = '7_DAYS') {
  const [twin, setTwin] = useState<DigitalTwinData | null>(null);
  const [history, setHistory] = useState<HealthHistoryPoint[]>([]);
  const [trends, setTrends] = useState<HealthTrendAnalysisData | null>(null);
  const [snapshots, setSnapshots] = useState<PaginatedSnapshots | null>(null);
  const [snapshotPage, setSnapshotPage] = useState<number>(1);
  const [snapshotTrigger, setSnapshotTrigger] = useState<SnapshotTriggerReason | undefined>(
    undefined,
  );
  const [selectedSnapshot, setSelectedSnapshot] = useState<DigitalTwinSnapshotData | null>(null);

  const [period, setPeriod] = useState<TrendPeriod>(initialPeriod);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [isSnapshotsLoading, setIsSnapshotsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getDaysFromPeriod = (p: TrendPeriod): number => {
    switch (p) {
      case '90_DAYS':
        return 90;
      case '30_DAYS':
        return 30;
      case '7_DAYS':
      default:
        return 7;
    }
  };

  const fetchSnapshots = useCallback(async (page: number = 1, trigger?: SnapshotTriggerReason) => {
    setIsSnapshotsLoading(true);
    try {
      const userId = storage.getUserId() || 'me';
      const snapshotData = await digitalTwinServiceApi.getSnapshots(userId, {
        page,
        limit: 10,
        trigger,
      });
      setSnapshots(snapshotData);
      setSnapshotPage(page);
      setSnapshotTrigger(trigger);
    } catch (err: unknown) {
      // Non-blocking error for snapshots
      console.error('Failed to load snapshots:', err);
    } finally {
      setIsSnapshotsLoading(false);
    }
  }, []);

  const fetchTwinData = useCallback(
    async (showSyncSpinner: boolean = false) => {
      if (showSyncSpinner) {
        setIsSyncing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const userId = storage.getUserId() || 'me';
        const days = getDaysFromPeriod(period);
        const [currentTwin, historyData, trendData, snapshotData] = await Promise.all([
          digitalTwinServiceApi.getCurrentTwinState(userId),
          digitalTwinServiceApi.getHealthHistory(userId, days),
          digitalTwinServiceApi.getHealthTrendAnalysis(userId, period),
          digitalTwinServiceApi.getSnapshots(userId, {
            page: 1,
            limit: 10,
            trigger: snapshotTrigger,
          }),
        ]);

        setTwin(currentTwin);
        setHistory(historyData);
        setTrends(trendData);
        setSnapshots(snapshotData);
        setSnapshotPage(1);
      } catch (err: unknown) {
        setError(extractErrorMessage(err, 'Failed to load Digital Twin health state.'));
      } finally {
        setIsLoading(false);
        setIsSyncing(false);
      }
    },
    [period, snapshotTrigger],
  );

  useEffect(() => {
    void fetchTwinData();
  }, [fetchTwinData]);

  const calibrateBaselines = async (payload: UpdateDigitalTwinPayload): Promise<boolean> => {
    setIsCalibrating(true);
    setError(null);
    try {
      const userId = storage.getUserId() || 'me';
      const updated = await digitalTwinServiceApi.updateDigitalTwin(userId, payload);
      setTwin(updated);
      // Re-fetch history, trends, and snapshots after calibration
      await fetchTwinData(true);
      return true;
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Failed to update Digital Twin baselines.'));
      return false;
    } finally {
      setIsCalibrating(false);
    }
  };

  const changePeriod = (newPeriod: TrendPeriod): void => {
    setPeriod(newPeriod);
  };

  const changeSnapshotPage = (newPage: number): void => {
    void fetchSnapshots(newPage, snapshotTrigger);
  };

  const filterSnapshotsByTrigger = (trigger?: SnapshotTriggerReason): void => {
    setSnapshotTrigger(trigger);
    void fetchSnapshots(1, trigger);
  };

  return {
    twin,
    history,
    trends,
    snapshots,
    snapshotPage,
    snapshotTrigger,
    selectedSnapshot,
    period,
    isLoading,
    isSyncing,
    isCalibrating,
    isSnapshotsLoading,
    error,
    changePeriod,
    refreshTwin: () => void fetchTwinData(true),
    calibrateBaselines,
    fetchSnapshots,
    changeSnapshotPage,
    filterSnapshotsByTrigger,
    setSelectedSnapshot,
  };
}
