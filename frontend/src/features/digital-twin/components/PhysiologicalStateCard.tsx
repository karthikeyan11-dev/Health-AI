import React from 'react';
import {
  Heart,
  Activity,
  Thermometer,
  Smile,
  Frown,
  Meh,
  Flame,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { DigitalTwinData, EmotionType } from '../types/digital-twin.types';

interface PhysiologicalStateCardProps {
  twin: DigitalTwinData | null;
}

export const PhysiologicalStateCard: React.FC<PhysiologicalStateCardProps> = ({ twin }) => {
  const getEmotionIcon = (emotion?: EmotionType | string) => {
    const norm = (emotion || 'Neutral').toUpperCase();
    switch (norm) {
      case 'HAPPY':
        return <Smile className="w-5 h-5 text-emerald-500" />;
      case 'SAD':
        return <Frown className="w-5 h-5 text-blue-500" />;
      case 'ANGRY':
      case 'ANGER':
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'FEAR':
        return <AlertCircle className="w-5 h-5 text-purple-500" />;
      case 'SURPRISE':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'DISGUST':
        return <Zap className="w-5 h-5 text-orange-500" />;
      case 'NEUTRAL':
      default:
        return <Meh className="w-5 h-5 text-slate-500" />;
    }
  };

  const getEmotionBadgeColor = (emotion?: EmotionType | string) => {
    const norm = (emotion || 'Neutral').toUpperCase();
    switch (norm) {
      case 'HAPPY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SAD':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ANGRY':
      case 'ANGER':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'FEAR':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SURPRISE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DISGUST':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'NEUTRAL':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const hrVal = twin?.baselineHeartRate ?? 72;
  const spo2Val = twin?.baselineSpO2 ?? 98;
  const tempVal = twin?.baselineTemperature ?? 36.6;
  const dominantEmotion = twin?.dominantEmotion ?? 'Neutral';

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Physiological & Biometric State</h2>
            <p className="text-xs text-slate-500">
              Live sensor telemetry mapped against calibrated baselines
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          MAX30102 PPG & Telemetry
        </span>
      </div>

      {/* Grid of 4 Biometric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Heart Rate */}
        <div className="rounded-2xl bg-slate-50/70 border border-slate-200/60 p-4 transition-all hover:bg-slate-50 hover:border-slate-300/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">Heart Rate</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60">
              BPM
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-black text-slate-900">{hrVal}</span>
            <span className="text-xs text-slate-500">bpm</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 text-slate-500">
            <span>Baseline:</span>
            <span className="font-semibold text-slate-700">
              {twin?.baselineHeartRate ?? 72} bpm
            </span>
          </div>
        </div>

        {/* Blood Oxygen SpO2 */}
        <div className="rounded-2xl bg-slate-50/70 border border-slate-200/60 p-4 transition-all hover:bg-slate-50 hover:border-slate-300/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">Blood Oxygen (SpO₂)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/60">
              %
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-black text-slate-900">{spo2Val}</span>
            <span className="text-xs text-slate-500">%</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 text-slate-500">
            <span>Baseline:</span>
            <span className="font-semibold text-slate-700">{twin?.baselineSpO2 ?? 98}%</span>
          </div>
        </div>

        {/* Body Temperature */}
        <div className="rounded-2xl bg-slate-50/70 border border-slate-200/60 p-4 transition-all hover:bg-slate-50 hover:border-slate-300/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Thermometer className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">Temperature</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
              °C
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-black text-slate-900">{tempVal.toFixed(1)}</span>
            <span className="text-xs text-slate-500">°C</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 text-slate-500">
            <span>Baseline:</span>
            <span className="font-semibold text-slate-700">
              {twin?.baselineTemperature ? Number(twin.baselineTemperature).toFixed(1) : '36.6'}°C
            </span>
          </div>
        </div>

        {/* Dominant Emotion */}
        <div className="rounded-2xl bg-slate-50/70 border border-slate-200/60 p-4 transition-all hover:bg-slate-50 hover:border-slate-300/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                {getEmotionIcon(dominantEmotion)}
              </div>
              <span className="text-xs font-bold text-slate-700">Affective State</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Affect AI
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${getEmotionBadgeColor(
                dominantEmotion,
              )}`}
            >
              {getEmotionIcon(dominantEmotion)}
              <span>{dominantEmotion}</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 text-slate-500">
            <span>Autonomic Tone:</span>
            <span className="font-semibold text-slate-700">
              {String(dominantEmotion).toUpperCase() === 'HAPPY'
                ? 'Vagal / Parasympathetic'
                : String(dominantEmotion).toUpperCase() === 'ANGER' ||
                    String(dominantEmotion).toUpperCase() === 'ANGRY' ||
                    String(dominantEmotion).toUpperCase() === 'FEAR'
                  ? 'Sympathetic Arousal'
                  : 'Balanced Normative'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
