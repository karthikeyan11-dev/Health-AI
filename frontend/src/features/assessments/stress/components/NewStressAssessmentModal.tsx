import React, { useState } from 'react';
import type { StressAssessmentRequest, EmotionEnum } from '@/sdk';
import type { StressFormValues } from '../types/stress.types';
import { X, Brain, Sparkles, HeartPulse, Activity, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewStressAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: StressAssessmentRequest) => Promise<void>;
  isSubmitting: boolean;
  defaultVitals?: {
    userId?: string;
    heartRate?: number;
    spo2?: number;
    temperature?: number;
  };
}

export const NewStressAssessmentModal: React.FC<NewStressAssessmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  defaultVitals,
}) => {
  const [form, setForm] = useState<StressFormValues>({
    heartRate: defaultVitals?.heartRate || 76,
    spo2: defaultVitals?.spo2 || 98.4,
    temperature: defaultVitals?.temperature || 36.6,
    currentEmotion: 'Neutral',
  });

  if (!isOpen) return null;

  const handleChange = (field: keyof StressFormValues, value: number | string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: StressAssessmentRequest = {
      userId: defaultVitals?.userId || '',
      heartRate: Number(form.heartRate),
      spo2: Number(form.spo2),
      temperature: Number(form.temperature),
      currentEmotion: form.currentEmotion as EmotionEnum,
    };
    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-[#083032] to-[#0d4648] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-400/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Brain className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                New Stress Assessment
              </h2>
              <p className="text-xs text-white/70">SVM RBF non-linear autonomic classification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-500" /> Current Heart Rate (BPM)
            </label>
            <input
              type="number"
              min="35"
              max="220"
              value={form.heartRate}
              onChange={(e) => handleChange('heartRate', Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm font-semibold text-slate-800"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-600" /> Blood Oxygen SpO₂ (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="70"
              max="100"
              value={form.spo2}
              onChange={(e) => handleChange('spo2', Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm font-semibold text-slate-800"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-500" /> Body Temperature (°C)
            </label>
            <input
              type="number"
              step="0.1"
              min="34"
              max="43"
              value={form.temperature}
              onChange={(e) => handleChange('temperature', Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm font-semibold text-slate-800"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Observed Facial Emotion Tone</label>
            <select
              value={form.currentEmotion}
              onChange={(e) => handleChange('currentEmotion', e.target.value as EmotionEnum)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm font-semibold text-slate-800 bg-white"
            >
              <option value="Happy">Happy / Relaxed</option>
              <option value="Neutral">Neutral / Calm</option>
              <option value="Surprise">Surprised / Alert</option>
              <option value="Fear">Anxious / Fear</option>
              <option value="Sad">Sad / Depressed</option>
              <option value="Angry">Angry / Agitated</option>
              <option value="Disgust">Disgusted / Stressed</option>
            </select>
          </div>

          {/* Footer */}
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
              <span>{isSubmitting ? 'Evaluating SVM Model...' : 'Assess Stress'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
