import React, { useState } from 'react';
import type {
  RiskAssessmentRequest,
  RiskAssessmentRequestSexEnum,
  RiskAssessmentRequestSmokingStatusEnum,
  RiskAssessmentRequestFamilyHistoryCvdEnum,
  RiskAssessmentRequestActivityTypeEnum,
} from '@/sdk';
import type { CardioFormValues } from '../types/cardiovascular.types';
import { X, Sparkles, HeartPulse, Activity, Moon, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewCardioAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: RiskAssessmentRequest) => Promise<void>;
  isSubmitting: boolean;
  defaultVitals?: {
    userId?: string;
    age?: number;
    sex?: number;
    heartRate?: number;
    spo2?: number;
    temperature?: number;
  };
}

export const NewCardioAssessmentModal: React.FC<NewCardioAssessmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  defaultVitals,
}) => {
  const [activeTab, setActiveTab] = useState<'demographics' | 'vitals' | 'activity' | 'sleep'>(
    'demographics',
  );

  const [form, setForm] = useState<CardioFormValues>({
    age: defaultVitals?.age || 32,
    sex: defaultVitals?.sex !== undefined ? defaultVitals.sex : 1,
    bmi: 24.5,
    smokingStatus: 0,
    familyHistoryCvd: 0,
    avgHeartRate: defaultVitals?.heartRate || 74,
    restingHr: 68,
    spo2: defaultVitals?.spo2 || 98.5,
    bodyTempC: defaultVitals?.temperature || 36.6,
    bpSystolic: 120,
    bpDiastolic: 80,
    hrv: 55,
    steps: 8500,
    caloriesBurned: 2200,
    distanceKm: 6.2,
    sleepHours: 7.5,
    sleepEfficiency: 88,
    caloriesConsumed: 2100,
    waterIntakeL: 2.5,
    activityType: 'Walking',
    stressScore: 25,
    digitalTwinHealthScore: 88,
  });

  if (!isOpen) return null;

  const handleChange = (field: keyof CardioFormValues, value: number | string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: RiskAssessmentRequest = {
      userId: defaultVitals?.userId || '',
      age: Number(form.age),
      sex: Number(form.sex) as RiskAssessmentRequestSexEnum,
      bmi: Number(form.bmi),
      smokingStatus: Number(form.smokingStatus) as RiskAssessmentRequestSmokingStatusEnum,
      familyHistoryCvd: Number(form.familyHistoryCvd) as RiskAssessmentRequestFamilyHistoryCvdEnum,
      heartRate: Number(form.avgHeartRate),
      restingHr: Number(form.restingHr),
      spo2: Number(form.spo2),
      temperature: Number(form.bodyTempC),
      systolicBp: Number(form.bpSystolic),
      diastolicBp: Number(form.bpDiastolic),
      hrv: Number(form.hrv),
      steps: Number(form.steps),
      caloriesBurned: Number(form.caloriesBurned),
      distanceKm: Number(form.distanceKm),
      sleepHours: Number(form.sleepHours),
      sleepEfficiency:
        Number(form.sleepEfficiency) > 1
          ? Number(form.sleepEfficiency) / 100
          : Number(form.sleepEfficiency),
      caloriesConsumed: Number(form.caloriesConsumed),
      waterIntakeL: Number(form.waterIntakeL),
      activityType: form.activityType as RiskAssessmentRequestActivityTypeEnum,
      stressScore: Number(form.stressScore),
      digitalTwinHealthScore: Number(form.digitalTwinHealthScore),
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-[#083032] to-[#0d4648] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <HeartPulse className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                New Cardiovascular Assessment
              </h2>
              <p className="text-xs text-white/70">
                Run CatBoost 26-feature clinical prediction with PPO RL guidance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-600 px-6 pt-3 gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('demographics')}
            className={cn(
              'pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all',
              activeTab === 'demographics'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900',
            )}
          >
            <UserCheck className="w-4 h-4" /> Demographics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vitals')}
            className={cn(
              'pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all',
              activeTab === 'vitals'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900',
            )}
          >
            <Activity className="w-4 h-4" /> Hemodynamics & Vitals
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={cn(
              'pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all',
              activeTab === 'activity'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900',
            )}
          >
            <Activity className="w-4 h-4" /> Activity & Diet
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sleep')}
            className={cn(
              'pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all',
              activeTab === 'sleep'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900',
            )}
          >
            <Moon className="w-4 h-4" /> Sleep & Digital Twin
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tab 1: Demographics */}
          {activeTab === 'demographics' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Age (Years)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={form.age}
                  onChange={(e) => handleChange('age', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Biological Sex</label>
                <select
                  value={form.sex}
                  onChange={(e) => handleChange('sex', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800 bg-white"
                >
                  <option value={1}>Male</option>
                  <option value={0}>Female</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Body Mass Index (BMI)</label>
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="60"
                  value={form.bmi}
                  onChange={(e) => handleChange('bmi', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Smoking Status</label>
                <select
                  value={form.smokingStatus}
                  onChange={(e) => handleChange('smokingStatus', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800 bg-white"
                >
                  <option value={0}>Non-Smoker</option>
                  <option value={1}>Active / Former Smoker</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700">
                  Family History of Cardiovascular Disease (CVD)
                </label>
                <select
                  value={form.familyHistoryCvd}
                  onChange={(e) => handleChange('familyHistoryCvd', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800 bg-white"
                >
                  <option value={0}>No Family History</option>
                  <option value={1}>Yes (Parents / Siblings diagnosed with CVD)</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab 2: Hemodynamics & Vitals */}
          {activeTab === 'vitals' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Systolic Blood Pressure (mmHg)</label>
                <input
                  type="number"
                  min="70"
                  max="240"
                  value={form.bpSystolic}
                  onChange={(e) => handleChange('bpSystolic', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Diastolic Blood Pressure (mmHg)</label>
                <input
                  type="number"
                  min="40"
                  max="140"
                  value={form.bpDiastolic}
                  onChange={(e) => handleChange('bpDiastolic', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Average Heart Rate (BPM)</label>
                <input
                  type="number"
                  min="35"
                  max="220"
                  value={form.avgHeartRate}
                  onChange={(e) => handleChange('avgHeartRate', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Resting Heart Rate (BPM)</label>
                <input
                  type="number"
                  min="35"
                  max="150"
                  value={form.restingHr}
                  onChange={(e) => handleChange('restingHr', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Blood Oxygen SpO₂ (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="70"
                  max="100"
                  value={form.spo2}
                  onChange={(e) => handleChange('spo2', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Body Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  min="34"
                  max="43"
                  value={form.bodyTempC}
                  onChange={(e) => handleChange('bodyTempC', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">
                  Heart Rate Variability - HRV (ms)
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={form.hrv}
                  onChange={(e) => handleChange('hrv', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>
            </div>
          )}

          {/* Tab 3: Activity & Diet */}
          {activeTab === 'activity' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">Primary Daily Activity Type</label>
                <select
                  value={form.activityType}
                  onChange={(e) => handleChange('activityType', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800 bg-white"
                >
                  <option value="Walking">Walking</option>
                  <option value="Running">Running</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Mixed_Cardio">Mixed Cardio / HIIT</option>
                  <option value="Strength">Strength Training</option>
                  <option value="Yoga">Yoga / Flexibility</option>
                  <option value="Rest">Rest / Sedentary</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Daily Steps</label>
                <input
                  type="number"
                  min="0"
                  max="60000"
                  value={form.steps}
                  onChange={(e) => handleChange('steps', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Distance Covered (km)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={form.distanceKm}
                  onChange={(e) => handleChange('distanceKm', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Calories Burned (kcal)</label>
                <input
                  type="number"
                  min="500"
                  max="6000"
                  value={form.caloriesBurned}
                  onChange={(e) => handleChange('caloriesBurned', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Caloric Intake (kcal)</label>
                <input
                  type="number"
                  min="500"
                  max="6000"
                  value={form.caloriesConsumed}
                  onChange={(e) => handleChange('caloriesConsumed', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">Water Intake (Liters)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={form.waterIntakeL}
                  onChange={(e) => handleChange('waterIntakeL', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>
            </div>
          )}

          {/* Tab 4: Sleep & Digital Twin */}
          {activeTab === 'sleep' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Sleep Duration (Hours)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={form.sleepHours}
                  onChange={(e) => handleChange('sleepHours', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Sleep Efficiency (%)</label>
                <input
                  type="number"
                  min="20"
                  max="100"
                  value={form.sleepEfficiency}
                  onChange={(e) => handleChange('sleepEfficiency', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Autonomic Stress Score (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.stressScore}
                  onChange={(e) => handleChange('stressScore', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  Digital Twin Health Index (0 - 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.digitalTwinHealthScore}
                  onChange={(e) => handleChange('digitalTwinHealthScore', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-semibold text-slate-800"
                  required
                />
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#083032] hover:bg-[#0c4749] text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles
                className={cn('w-4 h-4 text-emerald-400', isSubmitting && 'animate-spin')}
              />
              <span>{isSubmitting ? 'Evaluating CatBoost AI...' : 'Run Prediction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
