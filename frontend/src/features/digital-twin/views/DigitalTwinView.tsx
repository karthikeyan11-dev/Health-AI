import React, { useState } from 'react';
import { useDigitalTwin } from '../hooks/useDigitalTwin';
import { DigitalTwinHeaderCard } from '../components/DigitalTwinHeaderCard';
import { PhysiologicalStateCard } from '../components/PhysiologicalStateCard';
import { AIModelStatesCard } from '../components/AIModelStatesCard';
import { HealthScoreTrendChart } from '../components/HealthScoreTrendChart';
import { VitalTrendChart } from '../components/VitalTrendChart';
import { TrendAnalysisInsightsCard } from '../components/TrendAnalysisInsightsCard';
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

  return (
    <div className="space-y-6 pb-12">
      {/* Error Alert Banner */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={refreshTwin}
            className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all text-xs cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 1. Master Digital Twin Header Card (Radial Health Gauge + State) */}
      <DigitalTwinHeaderCard
        twin={twin}
        isSyncing={isSyncing}
        onRefresh={refreshTwin}
        onOpenCalibration={() => setIsCalibrateModalOpen(true)}
      />

      {/* 2. Physiological Biometrics & Sensor Telemetry Grid */}
      <PhysiologicalStateCard twin={twin} />

      {/* 3. AI Diagnostic Subsystems (Cardio & Stress Models) */}
      <AIModelStatesCard twin={twin} />

      {/* 4. Charts Grid: Health Score Trajectory + Vital Progression */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <HealthScoreTrendChart history={history} period={period} onPeriodChange={changePeriod} />
        <VitalTrendChart
          history={history}
          baselineHeartRate={twin?.baselineHeartRate ?? 72}
          baselineSpO2={twin?.baselineSpO2 ?? 98}
        />
      </div>

      {/* 5. Health Trajectory Analysis & Synthesized Clinical Observations */}
      <TrendAnalysisInsightsCard trends={trends} />

      {/* 6. Digital Twin Evolution History & Immutable Snapshot Ledger */}
      <EvolutionTimelineCard
        snapshots={snapshots}
        currentPage={snapshotPage}
        selectedTrigger={snapshotTrigger}
        isLoading={isSnapshotsLoading}
        onPageChange={changeSnapshotPage}
        onTriggerChange={filterSnapshotsByTrigger}
        onInspectSnapshot={setSelectedSnapshot}
      />

      {/* 7. Baseline Calibration Modal */}
      <CalibrateBaselinesModal
        isOpen={isCalibrateModalOpen}
        twin={twin}
        isCalibrating={isCalibrating}
        onClose={() => setIsCalibrateModalOpen(false)}
        onSave={calibrateBaselines}
      />

      {/* 8. Snapshot Time-Travel Comparison Modal */}
      <TimeTravelSnapshotModal
        snapshot={selectedSnapshot}
        currentTwin={twin}
        onClose={() => setSelectedSnapshot(null)}
      />
    </div>
  );
};
