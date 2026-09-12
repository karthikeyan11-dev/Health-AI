import React, { useState } from 'react';
import { X, Sliders, Heart, Thermometer, Activity, Smile, AlertCircle } from 'lucide-react';
import { EmotionEnum } from '@/sdk';
import type {
  DigitalTwinData,
  EmotionType,
  UpdateDigitalTwinPayload,
} from '../types/digital-twin.types';

interface CalibrateBaselinesModalProps {
  isOpen: boolean;
  twin: DigitalTwinData | null;
  isCalibrating: boolean;
  onClose: () => void;
  onSave: (payload: UpdateDigitalTwinPayload) => Promise<boolean>;
}

export const CalibrateBaselinesModal: React.FC<CalibrateBaselinesModalProps> = ({
  isOpen,
  twin,
  isCalibrating,
  onClose,
  onSave,
}) => {
  const [heartRate, setHeartRate] = useState<number>(twin?.baselineHeartRate ?? 72);
  const [temperature, setTemperature] = useState<number>(twin?.baselineTemperature ?? 36.6);
  const [spo2, setSpo2] = useState<number>(twin?.baselineSpO2 ?? 98);
  const [dominantEmotion, setDominantEmotion] = useState<EmotionType>(
    twin?.dominantEmotion ?? EmotionEnum.Happy,
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (heartRate < 40 || heartRate > 180) {
      setError('Baseline Heart Rate must be between 40 and 180 bpm.');
      return;
    }
    if (temperature < 35.0 || temperature > 40.0) {
      setError('Baseline Temperature must be between 35.0°C and 40.0°C.');
      return;
    }
    if (spo2 < 85 || spo2 > 100) {
      setError('Baseline SpO₂ must be between 85% and 100%.');
      return;
    }

    const success = await onSave({
      baselineHeartRate: Number(heartRate),
      baselineTemperature: Number(temperature),
      baselineSpO2: Number(spo2),
      dominantEmotion,
    });

    if (success) {
      onClose();
    }
  };

  const emotions: EmotionType[] = [
    EmotionEnum.Happy,
    EmotionEnum.Neutral,
    EmotionEnum.Sad,
    EmotionEnum.Angry,
    EmotionEnum.Fear,
    EmotionEnum.Surprise,
    EmotionEnum.Disgust,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Calibrate Digital Twin Baselines</h3>
              <p className="text-xs text-slate-500">Tune personal resting physiology parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Baseline Heart Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Baseline Heart Rate (BPM)</span>
              </label>
              <span className="font-black text-slate-900">{heartRate} bpm</span>
            </div>
            <input
              type="range"
              min="45"
              max="130"
              value={heartRate}
              onChange={(e) => setHeartRate(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>45 bpm (Athlete)</span>
              <span>72 bpm (Normal)</span>
              <span>130 bpm (Elevated)</span>
            </div>
          </div>

          {/* Baseline Blood Oxygen SpO2 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-500" />
                <span>Baseline Blood Oxygen (SpO₂ %)</span>
              </label>
              <span className="font-black text-slate-900">{spo2}%</span>
            </div>
            <input
              type="range"
              min="90"
              max="100"
              step="0.5"
              value={spo2}
              onChange={(e) => setSpo2(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>90% (Hypoxic)</span>
              <span>98% (Normal)</span>
              <span>100% (Max)</span>
            </div>
          </div>

          {/* Baseline Body Temperature */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                <span>Baseline Body Temperature (°C)</span>
              </label>
              <span className="font-black text-slate-900">{temperature.toFixed(1)}°C</span>
            </div>
            <input
              type="range"
              min="35.5"
              max="38.5"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>35.5°C</span>
              <span>36.6°C (Standard)</span>
              <span>38.5°C (Febrile)</span>
            </div>
          </div>

          {/* Dominant Emotion Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-indigo-500" />
              <span>Default Baseline Affective State</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {emotions.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setDominantEmotion(em)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    dominantEmotion === em
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-102'
                      : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCalibrating}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            >
              {isCalibrating ? 'Saving Calibrations...' : 'Save & Recalculate Twin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
