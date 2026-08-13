import React from 'react';
import {
  Activity,
  BrainCircuit,
  ChartNoAxesColumnIncreasing,
  CircuitBoard,
  Cross,
  HeartPulse,
  ShieldPlus,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AuthDecorationVariant = 'login' | 'register' | 'verify-otp';

type AuthDecorativeElementsProps = {
  variant: AuthDecorationVariant;
};

type AuthDecorationIcon =
  'ai' | 'chart' | 'cross' | 'heart' | 'iot' | 'shield' | 'signal' | 'vitals';

type AuthDecorationBase = {
  className: string;
  delay: string;
  duration: string;
  motion: 'auth-decor-float-a' | 'auth-decor-float-b' | 'auth-decor-float-c' | 'auth-decor-float-d';
};

type AuthIconDecoration = AuthDecorationBase & {
  icon: AuthDecorationIcon;
  size: string;
};

type AuthGlowDecoration = AuthDecorationBase & {
  glow: true;
  size: string;
};

type AuthRingDecoration = AuthDecorationBase & {
  ring: true;
  size: string;
};

type AuthDecoration = AuthIconDecoration | AuthGlowDecoration | AuthRingDecoration;

const AUTH_DECORATION_ICONS: Record<AuthDecorationIcon, LucideIcon> = {
  ai: BrainCircuit,
  chart: ChartNoAxesColumnIncreasing,
  cross: Cross,
  heart: HeartPulse,
  iot: CircuitBoard,
  shield: ShieldPlus,
  signal: Wifi,
  vitals: Activity,
};

const AUTH_DECORATIONS: Record<AuthDecorationVariant, readonly AuthDecoration[]> = {
  login: [
    // Top-right corner
    {
      icon: 'heart',
      className: 'right-[6%] top-[6%] h-24 w-24 opacity-85 sm:h-28 sm:w-28',
      size: 'h-10 w-10 sm:h-12 sm:w-12',
      delay: '0s',
      duration: '14s',
      motion: 'auth-decor-float-a',
    },
    // Bottom-left corner
    {
      icon: 'ai',
      className: 'left-[5%] bottom-[8%] h-28 w-28 opacity-80 sm:h-32 sm:w-32',
      size: 'h-11 w-11 sm:h-12 sm:w-12',
      delay: '1.2s',
      duration: '16s',
      motion: 'auth-decor-float-b',
    },
    // Left-middle (partial card area)
    {
      icon: 'signal',
      className: 'left-[-8%] top-[38%] h-24 w-24 opacity-65 sm:h-28 sm:w-28',
      size: 'h-10 w-10',
      delay: '2.1s',
      duration: '18s',
      motion: 'auth-decor-float-c',
    },
    // Right-middle glow (behind card)
    {
      glow: true,
      className: 'right-[-10%] top-[42%] opacity-72',
      size: 'h-40 w-40 sm:h-48 sm:w-48',
      delay: '0.7s',
      duration: '19s',
      motion: 'auth-decor-float-d',
    },
    // Top-center ring
    {
      ring: true,
      className: 'left-[50%] top-[8%] -translate-x-1/2 h-16 w-16 opacity-60 sm:h-20 sm:w-20',
      size: 'h-full w-full',
      delay: '1.9s',
      duration: '15s',
      motion: 'auth-decor-float-b',
    },
    // Bottom-right area
    {
      icon: 'chart',
      className: 'bottom-[12%] right-[8%] h-20 w-20 opacity-72 sm:h-24 sm:w-24',
      size: 'h-9 w-9 sm:h-10 sm:w-10',
      delay: '3s',
      duration: '17s',
      motion: 'auth-decor-float-a',
    },
  ],
  register: [
    // Top-right corner
    {
      icon: 'ai',
      className: 'right-[5%] top-[5%] h-24 w-24 opacity-82 sm:h-32 sm:w-32',
      size: 'h-11 w-11 sm:h-14 sm:w-14',
      delay: '0.4s',
      duration: '16s',
      motion: 'auth-decor-float-c',
    },
    // Bottom-left glow
    {
      glow: true,
      className: 'left-[-12%] bottom-[6%] opacity-75',
      size: 'h-40 w-40 sm:h-52 sm:w-52',
      delay: '1s',
      duration: '20s',
      motion: 'auth-decor-float-b',
    },
    // Left-upper middle
    {
      icon: 'vitals',
      className: 'left-[3%] top-[24%] h-24 w-24 opacity-62 sm:h-28 sm:w-28',
      size: 'h-10 w-10',
      delay: '2.4s',
      duration: '18s',
      motion: 'auth-decor-float-a',
    },
    // Right-middle (near card)
    {
      icon: 'iot',
      className: 'right-[-8%] top-[48%] h-28 w-28 opacity-58 sm:h-32 sm:w-32',
      size: 'h-11 w-11 sm:h-12 sm:w-12',
      delay: '3.2s',
      duration: '19s',
      motion: 'auth-decor-float-d',
    },
    // Bottom-right corner
    {
      icon: 'cross',
      className: 'bottom-[8%] right-[6%] h-20 w-20 opacity-75 sm:h-24 sm:w-24',
      size: 'h-9 w-9 sm:h-10 sm:w-10',
      delay: '1.7s',
      duration: '15s',
      motion: 'auth-decor-float-a',
    },
    // Top-center ring
    {
      ring: true,
      className: 'left-[50%] top-[10%] -translate-x-1/2 h-20 w-20 opacity-58 sm:h-24 sm:w-24',
      size: 'h-full w-full',
      delay: '2.8s',
      duration: '17s',
      motion: 'auth-decor-float-b',
    },
    // Bottom-center ring (lower position)
    {
      ring: true,
      className: 'left-[50%] bottom-[18%] -translate-x-1/2 h-16 w-16 opacity-55 sm:h-20 sm:w-20',
      size: 'h-full w-full',
      delay: '3.6s',
      duration: '21s',
      motion: 'auth-decor-float-c',
    },
  ],
  'verify-otp': [
    // Top-right corner
    {
      icon: 'shield',
      className: 'right-[7%] top-[7%] h-24 w-24 opacity-82 sm:h-28 sm:w-28',
      size: 'h-10 w-10 sm:h-12 sm:w-12',
      delay: '0.2s',
      duration: '16s',
      motion: 'auth-decor-float-d',
    },
    // Bottom-left corner
    {
      icon: 'signal',
      className: 'left-[6%] bottom-[10%] h-24 w-24 opacity-78 sm:h-32 sm:w-32',
      size: 'h-10 w-10 sm:h-12 sm:w-12',
      delay: '1.5s',
      duration: '18s',
      motion: 'auth-decor-float-a',
    },
    // Left-middle glow (partial behind card)
    {
      glow: true,
      className: 'left-[-10%] top-[40%] opacity-70',
      size: 'h-40 w-40 sm:h-44 sm:w-44',
      delay: '0.8s',
      duration: '20s',
      motion: 'auth-decor-float-c',
    },
    // Right-middle icon (partial behind card)
    {
      icon: 'chart',
      className: 'right-[-10%] top-[36%] h-20 w-20 opacity-60 sm:h-24 sm:w-24',
      size: 'h-9 w-9 sm:h-10 sm:w-10',
      delay: '2.6s',
      duration: '17s',
      motion: 'auth-decor-float-b',
    },
    // Bottom-right ring
    {
      ring: true,
      className: 'right-[8%] bottom-[12%] h-20 w-20 opacity-65 sm:h-24 sm:w-24',
      size: 'h-full w-full',
      delay: '1.1s',
      duration: '15s',
      motion: 'auth-decor-float-a',
    },
    // Top-center
    {
      icon: 'heart',
      className:
        'left-[50%] top-[10%] -translate-x-1/2 h-[4.5rem] w-[4.5rem] opacity-60 sm:h-24 sm:w-24',
      size: 'h-8 w-8 sm:h-10 sm:w-10',
      delay: '3.3s',
      duration: '19s',
      motion: 'auth-decor-float-d',
    },
  ],
};

export const AuthDecorativeElements: React.FC<AuthDecorativeElementsProps> = ({ variant }) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {AUTH_DECORATIONS[variant].map((decoration) => (
        <div
          key={`${decoration.className}-${decoration.delay}`}
          className={cn('auth-decor-float absolute', decoration.motion, decoration.className)}
          style={{
            animationDelay: decoration.delay,
            animationDuration: decoration.duration,
          }}
        >
          {'glow' in decoration ? (
            <span
              className={cn(
                'auth-decor-pulse block rounded-full bg-gradient-glow blur-lg',
                decoration.size,
              )}
            />
          ) : 'ring' in decoration ? (
            <span
              className={cn(
                'auth-decor-pulse block rounded-full border-2 border-primary/30 bg-white/30 shadow-primary backdrop-blur-sm',
                decoration.size,
              )}
            />
          ) : (
            <span className="auth-decor-pulse flex h-full w-full items-center justify-center rounded-full border border-primary/25 bg-white/90 text-primary shadow-primary backdrop-blur-md">
              {React.createElement(AUTH_DECORATION_ICONS[decoration.icon], {
                className: decoration.size,
                strokeWidth: 2,
              })}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
