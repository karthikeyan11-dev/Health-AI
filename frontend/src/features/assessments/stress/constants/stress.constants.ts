export const STRESS_LEVEL_COLORS = {
  LOW: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-400/30',
    text: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    barColor: '#10b981',
    gradient: 'from-emerald-400 to-teal-600',
    label: 'Low / Relaxed',
    state: 'Parasympathetic Dominant',
    description:
      'Sympathetic nervous tone is relaxed. Optimal autonomic recovery and heart rate variability.',
  },
  MODERATE: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-400/30',
    text: 'text-amber-700',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    barColor: '#f59e0b',
    gradient: 'from-amber-400 to-amber-600',
    label: 'Moderate Stress',
    state: 'Active Homeostasis',
    description:
      'Mild physiological activation or cognitive engagement observed. Standard daytime response.',
  },
  HIGH: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-400/30',
    text: 'text-orange-700',
    badgeBg: 'bg-orange-50 text-orange-800 border-orange-200',
    barColor: '#f97316',
    gradient: 'from-orange-500 to-rose-500',
    label: 'High Stress',
    state: 'Sympathetic Elevation',
    description:
      'Noticeable sympathetic excitation detected. Guided breathing or short break recommended.',
  },
  SEVERE: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-400/30',
    text: 'text-rose-700',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
    barColor: '#ef4444',
    gradient: 'from-rose-500 to-red-600',
    label: 'Severe Stress',
    state: 'Acute Fight-or-Flight',
    description:
      'Elevated sustained physiological arousal. Immediate calming exercise and rest strongly suggested.',
  },
} as const;
