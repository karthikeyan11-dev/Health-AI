import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Activity, Heart, Brain, LayoutDashboard, User, Users, Radio, Loader2 } from 'lucide-react';

export type PageLoaderPreset =
  | 'digital-twin'
  | 'dashboard'
  | 'overview'
  | 'cardiovascular'
  | 'stress'
  | 'health-monitoring'
  | 'profile'
  | 'users'
  | 'generic';

export type LoaderColorTheme = 'emerald' | 'sky' | 'indigo' | 'purple' | 'rose' | 'amber' | 'slate';

export interface PageLoaderProps {
  page?: PageLoaderPreset;
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  colorTheme?: LoaderColorTheme;
  minHeight?: string;
  className?: string;
}

interface PagePresetConfig {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  theme: LoaderColorTheme;
}

const PRESET_CONFIGS: Record<PageLoaderPreset, PagePresetConfig> = {
  'digital-twin': {
    icon: Activity,
    title: 'Synthesizing Patient Digital Twin',
    subtitle: 'Calibrating PPG vitals, cardiovascular risk, and autonomic stress state...',
    theme: 'emerald',
  },
  dashboard: {
    icon: LayoutDashboard,
    title: 'Loading Patient Overview',
    subtitle: 'Aggregating real-time vitals, active health alerts, and clinical metrics...',
    theme: 'sky',
  },
  overview: {
    icon: LayoutDashboard,
    title: 'Loading Patient Overview',
    subtitle: 'Aggregating real-time vitals, active health alerts, and clinical metrics...',
    theme: 'sky',
  },
  cardiovascular: {
    icon: Heart,
    title: 'Evaluating Cardiovascular Risk',
    subtitle: 'Analyzing hemodynamics, lipid biomarkers, and Framingham risk markers...',
    theme: 'rose',
  },
  stress: {
    icon: Brain,
    title: 'Analyzing Autonomic Stress State',
    subtitle: 'Computing HRV spectral indices, sympathetic tone, and stress levels...',
    theme: 'purple',
  },
  'health-monitoring': {
    icon: Radio,
    title: 'Connecting to Health Telemetry',
    subtitle: 'Streaming real-time biometric readings from connected medical sensors...',
    theme: 'sky',
  },
  profile: {
    icon: User,
    title: 'Loading Patient Profile',
    subtitle: 'Retrieving demographic details, medical identifiers, and contact data...',
    theme: 'indigo',
  },
  users: {
    icon: Users,
    title: 'Loading Registered Users',
    subtitle: 'Fetching user directory, patient linkages, and account roles...',
    theme: 'indigo',
  },
  generic: {
    icon: Loader2,
    title: 'Loading Health AI Platform',
    subtitle: 'Please wait while we retrieve your clinical data...',
    theme: 'emerald',
  },
};

const THEME_STYLES: Record<
  LoaderColorTheme,
  { box: string; icon: string; border: string; glow: string }
> = {
  emerald: {
    box: 'bg-emerald-500/10 text-emerald-600',
    icon: 'text-emerald-600',
    border: 'border-emerald-500/20',
    glow: 'bg-emerald-500/20',
  },
  sky: {
    box: 'bg-sky-500/10 text-sky-600',
    icon: 'text-sky-600',
    border: 'border-sky-500/20',
    glow: 'bg-sky-500/20',
  },
  indigo: {
    box: 'bg-indigo-500/10 text-indigo-600',
    icon: 'text-indigo-600',
    border: 'border-indigo-500/20',
    glow: 'bg-indigo-500/20',
  },
  purple: {
    box: 'bg-purple-500/10 text-purple-600',
    icon: 'text-purple-600',
    border: 'border-purple-500/20',
    glow: 'bg-purple-500/20',
  },
  rose: {
    box: 'bg-rose-500/10 text-rose-600',
    icon: 'text-rose-600',
    border: 'border-rose-500/20',
    glow: 'bg-rose-500/20',
  },
  amber: {
    box: 'bg-amber-500/10 text-amber-600',
    icon: 'text-amber-600',
    border: 'border-amber-500/20',
    glow: 'bg-amber-500/20',
  },
  slate: {
    box: 'bg-slate-500/10 text-slate-600',
    icon: 'text-slate-600',
    border: 'border-slate-500/20',
    glow: 'bg-slate-500/20',
  },
};

export const PageLoader: React.FC<PageLoaderProps> = ({
  page = 'generic',
  icon: CustomIcon,
  title: customTitle,
  subtitle: customSubtitle,
  colorTheme: customTheme,
  minHeight = 'min-h-[55vh]',
  className = '',
}) => {
  const preset = PRESET_CONFIGS[page] || PRESET_CONFIGS.generic;
  const IconComponent = CustomIcon || preset.icon;
  const title = customTitle || preset.title;
  const subtitle = customSubtitle || preset.subtitle;
  const theme = customTheme || preset.theme;
  const styles = THEME_STYLES[theme] || THEME_STYLES.emerald;

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-4 px-4 py-8 animate-in fade-in duration-300 ${minHeight} ${className}`}
    >
      <div className="relative">
        {/* Subtle pulsing background aura */}
        <div
          className={`absolute -inset-2 rounded-full blur-xl animate-pulse opacity-75 ${styles.glow}`}
        />
        {/* Glassmorphic Icon Container */}
        <div
          className={`relative w-16 h-16 rounded-3xl border flex items-center justify-center backdrop-blur-md shadow-sm transition-all animate-pulse ${styles.box} ${styles.border}`}
        >
          <IconComponent className={`w-8 h-8 animate-spin ${styles.icon}`} />
        </div>
      </div>

      <div className="text-center space-y-1.5 max-w-md">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 leading-relaxed">{subtitle}</p>}
      </div>
    </div>
  );
};
