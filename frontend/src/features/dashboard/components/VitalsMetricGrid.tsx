import React from 'react';
import type {
  PatientOverviewVitals,
  PatientOverviewCardioRisk,
  PatientOverviewStress,
} from '@/sdk';
import {
  Heart,
  Activity,
  Thermometer,
  HeartPulse,
  Brain,
  Footprints,
  Gauge,
  Sparkles,
} from 'lucide-react';
import type { TelemetryReadingPayload } from '@/lib/socket';

interface VitalsMetricGridProps {
  vitals?: PatientOverviewVitals;
  cardioRisk?: PatientOverviewCardioRisk;
  stress?: PatientOverviewStress;
  liveReadings?: Record<string, TelemetryReadingPayload>;
}

export function VitalsMetricGrid({
  vitals,
  cardioRisk,
  stress,
  liveReadings = {},
}: VitalsMetricGridProps): React.JSX.Element {
  // Live values from Smartwatch telemetry stream override static snapshot
  const heartRate = liveReadings['HEART_RATE']?.value ?? vitals?.heartRateBpm ?? 72;
  const restingHr = liveReadings['RESTING_HEART_RATE']?.value ?? 64;
  const spo2 = liveReadings['SPO2']?.value ?? vitals?.spo2Percent ?? 98.5;
  const temp = liveReadings['TEMPERATURE']?.value ?? vitals?.temperatureCelsius ?? 36.6;
  const sysBp = liveReadings['BLOOD_PRESSURE_SYSTOLIC']?.value ?? 120;
  const diaBp = liveReadings['BLOOD_PRESSURE_DIASTOLIC']?.value ?? 80;
  const hrv = liveReadings['HRV']?.value ?? 65;
  const steps = liveReadings['STEPS']?.value ?? 7500;

  const cardioLevel = cardioRisk?.riskLevel || 'OPTIMAL';
  const stressLevel = stress?.stressLevel || 'LOW';

  const cards = [
    {
      title: 'Pulse Rate',
      value: `${heartRate} BPM`,
      subtitle: `Resting: ${restingHr} bpm`,
      icon: Heart,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-50/70 border-rose-200/80',
      badgeColor: 'bg-rose-100 text-rose-700',
      live: !!liveReadings['HEART_RATE'],
    },
    {
      title: 'Blood Pressure',
      value: `${sysBp}/${diaBp}`,
      subtitle: 'Optimal (<120/80 mmHg)',
      icon: Gauge,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50/70 border-blue-200/80',
      badgeColor: 'bg-blue-100 text-blue-800',
      live: !!liveReadings['BLOOD_PRESSURE_SYSTOLIC'],
    },
    {
      title: 'Blood Oxygen (SpO₂)',
      value: `${spo2}%`,
      subtitle: 'Optimal Saturation (≥95%)',
      icon: Activity,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/70 border-emerald-200/80',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      live: !!liveReadings['SPO2'],
    },
    {
      title: 'Heart Rate Variability',
      value: `${hrv} ms`,
      subtitle: 'Autonomic Balance (SDNN)',
      icon: Sparkles,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50/70 border-purple-200/80',
      badgeColor: 'bg-purple-100 text-purple-800',
      live: !!liveReadings['HRV'],
    },
    {
      title: 'Body Temperature',
      value: `${temp}°C`,
      subtitle: 'Normal Range (36.1 - 37.2)',
      icon: Thermometer,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50/70 border-amber-200/80',
      badgeColor: 'bg-amber-100 text-amber-800',
      live: !!liveReadings['TEMPERATURE'],
    },
    {
      title: 'Daily Steps',
      value: Number(steps).toLocaleString(),
      subtitle: 'Activity Goal: 8,500 steps',
      icon: Footprints,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/70 border-indigo-200/80',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      live: !!liveReadings['STEPS'],
    },
    {
      title: 'Cardiovascular Risk',
      value: cardioLevel,
      subtitle: `Risk Score: ${cardioRisk?.riskScore ?? 18.5}`,
      icon: HeartPulse,
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-50/70 border-teal-200/80',
      badgeColor: 'bg-teal-100 text-teal-800',
      live: false,
    },
    {
      title: 'Stress State',
      value: stressLevel,
      subtitle: `Stress Score: ${stress?.stressScore ?? 22.0}`,
      icon: Brain,
      iconColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50/70 border-cyan-200/80',
      badgeColor: 'bg-cyan-100 text-cyan-800',
      live: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden p-5 rounded-3xl border ${card.bgColor} shadow-sm hover:shadow-md transition-all duration-300 space-y-3 bg-white`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="flex items-center gap-1.5">
                {card.live && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center ${card.badgeColor} shadow-sm`}
                >
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
            </div>

            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</div>
              <p className="text-xs text-slate-500 font-medium mt-1">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
