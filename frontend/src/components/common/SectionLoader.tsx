import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Activity } from 'lucide-react';
import type { LoaderColorTheme } from './PageLoader';

export interface SectionLoaderProps {
  icon?: LucideIcon;
  message?: string;
  colorTheme?: LoaderColorTheme;
  paddingY?: string;
  className?: string;
}

const THEME_COLORS: Record<LoaderColorTheme, { icon: string; text: string }> = {
  emerald: { icon: 'text-emerald-500', text: 'text-slate-500' },
  sky: { icon: 'text-sky-500', text: 'text-slate-500' },
  indigo: { icon: 'text-indigo-500', text: 'text-slate-500' },
  purple: { icon: 'text-purple-500', text: 'text-slate-500' },
  rose: { icon: 'text-rose-500', text: 'text-slate-500' },
  amber: { icon: 'text-amber-500', text: 'text-slate-500' },
  slate: { icon: 'text-slate-400', text: 'text-slate-400' },
};

export const SectionLoader: React.FC<SectionLoaderProps> = ({
  icon: IconComponent = Activity,
  message = 'Loading data...',
  colorTheme = 'emerald',
  paddingY = 'py-12',
  className = '',
}) => {
  const styles = THEME_COLORS[colorTheme] || THEME_COLORS.emerald;

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-2.5 ${paddingY} ${className} animate-in fade-in duration-200`}
    >
      <IconComponent className={`w-6 h-6 animate-spin ${styles.icon}`} />
      {message && <span className={`text-xs font-medium ${styles.text}`}>{message}</span>}
    </div>
  );
};
