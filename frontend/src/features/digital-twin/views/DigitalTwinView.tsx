import React, { useState } from 'react';
import { useDigitalTwin } from '../hooks/useDigitalTwin';
import { DigitalTwinHeaderCard } from '../components/DigitalTwinHeaderCard';
import { PhysiologicalStateCard } from '../components/PhysiologicalStateCard';
import { AIModelStatesCard } from '../components/AIModelStatesCard';
import { HealthScoreTrendChart } from '../components/HealthScoreTrendChart';
import { VitalTrendChart } from '../components/VitalTrendChart';
import { TrendAnalysisInsightsCard } from '../components/TrendAnalysisInsightsCard';
import { TemporalTrajectoryForecastCard } from '../components/TemporalTrajectoryForecastCard';
import { EvolutionTimelineCard } from '../components/EvolutionTimelineCard';
import { TimeTravelSnapshotModal } from '../components/TimeTravelSnapshotModal';
import { CalibrateBaselinesModal } from '../components/CalibrateBaselinesModal';
import { PageLoader } from '@/components/common';
import { AlertCircle } from 'lucide-react';

export const DigitalTwinView: React.FC = () => {
  const {
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
    refreshTwin,
    calibrateBaselines,
    changeSnapshotPage,
    filterSnapshotsByTrigger,
    setSelectedSnapshot,
  } = useDigitalTwin('7_DAYS');

  const [isCalibrateModalOpen, setIsCalibrateModalOpen] = useState(false);

  if (isLoading && !twin) {
    return <PageLoader page="digital-twin" />;
  }

  const userId = twin?.userId || '';

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Card with Composite Health Score, State Badge & Live Sync */}
      <DigitalTwinHeaderCard
        twin={twin}
        isSyncing={isSyncing}
        onRefresh={refreshTwin}
        onOpenCalibration={() => setIsCalibrateModalOpen(true)}
      />

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200/80 p-4 text-xs text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Physiological Biometric Baselines & Deviation Telemetry */}
      <PhysiologicalStateCard twin={twin} />

      {/* 3. AI-Derived Subsystems State (Cardiovascular & Autonomic Stress) */}
      <AIModelStatesCard twin={twin} />

      {/* 4. Longitudinal Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthScoreTrendChart history={history} period={period} onPeriodChange={changePeriod} />
        <VitalTrendChart
          history={history}
          baselineHeartRate={twin?.baselineHeartRate ?? 72}
          baselineSpO2={twin?.baselineSpO2 ?? 98}
        />
      </div>

      {/* 5. Health Trajectory Analysis & Synthesized Clinical Observations */}
      <TrendAnalysisInsightsCard trends={trends} />

      {/* 6. PyTorch GRU-Attention 30-Day Trajectory Simulation Engine */}
      {userId && <TemporalTrajectoryForecastCard userId={userId} />}

      {/* 7. Digital Twin Evolution History & Immutable Snapshot Ledger */}
      <EvolutionTimelineCard
        snapshots={snapshots}
        currentPage={snapshotPage}
        selectedTrigger={snapshotTrigger}
        isLoading={isSnapshotsLoading}
        onPageChange={changeSnapshotPage}
        onTriggerChange={filterSnapshotsByTrigger}
        onInspectSnapshot={setSelectedSnapshot}
      />

      {/* 8. Baseline Calibration Modal */}
      <CalibrateBaselinesModal
        isOpen={isCalibrateModalOpen}
        twin={twin}
        isCalibrating={isCalibrating}
        onClose={() => setIsCalibrateModalOpen(false)}
        onSave={calibrateBaselines}
      />

      {/* 9. Snapshot Time-Travel Comparison Modal */}
      <TimeTravelSnapshotModal
        snapshot={selectedSnapshot}
        currentTwin={twin}
        onClose={() => setSelectedSnapshot(null)}
      />
    </div>
  );
};
