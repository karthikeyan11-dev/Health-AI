import React from 'react';
import type {
  PatientOverviewVitals,
  PatientOverviewCardioRisk,
  PatientOverviewStress,
} from '@/sdk';
import { Heart, Activity, Thermometer, HeartPulse, Brain } from 'lucide-react';

interface VitalsMetricGridProps {
  vitals?: PatientOverviewVitals;
  cardioRisk?: PatientOverviewCardioRisk;
  stress?: PatientOverviewStress;
}

export function VitalsMetricGrid({
  vitals,
  cardioRisk,
  stress,
}: VitalsMetricGridProps): React.JSX.Element {
  const heartRate = vitals?.heartRateBpm ?? 72;
  const spo2 = vitals?.spo2Percent ?? 98.5;
  const temp = vitals?.temperatureCelsius ?? 36.6;
  const cardioLevel = cardioRisk?.riskLevel || 'LOW';
  const stressLevel = stress?.stressLevel || 'LOW';

  const cards = [
    {
      title: 'Heart Rate',
      value: `${heartRate} BPM`,
      subtitle: 'Normal Baseline (60-100)',
      icon: Heart,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-50 border-rose-100',
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      title: 'Blood Oxygen (SpO₂)',
      value: `${spo2}%`,
      subtitle: 'Optimal Saturation (≥95%)',
      icon: Activity,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-100',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      title: 'Body Temperature',
      value: `${temp}°C`,
      subtitle: 'Normal Range (36.1 - 37.2)',
      icon: Thermometer,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50 border-amber-100',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      title: 'Cardiovascular Risk',
      value: cardioLevel,
      subtitle: `Risk Score: ${cardioRisk?.riskScore ?? 18.5}`,
      icon: HeartPulse,
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-50 border-teal-100',
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      title: 'Stress Level',
      value: stressLevel,
      subtitle: `Stress Score: ${stress?.stressScore ?? 22.0}`,
      icon: Brain,
      iconColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50 border-cyan-100',
      badgeColor: 'bg-cyan-100 text-cyan-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl border ${card.bgColor} shadow-sm hover:shadow-md transition-all space-y-3`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl bg-white shadow-sm ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{card.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
