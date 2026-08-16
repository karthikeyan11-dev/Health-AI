import React from 'react';
import { Button } from '@/components/ui';
import { HeartPulse, UserPlus, Activity } from 'lucide-react';
import { VERIFY_OTP_TEXTS } from '../constants/verifyOtp.constants';

export interface OtpHeroPanelProps {
  onNavigateRegister: () => void;
}

export const OtpHeroPanel: React.FC<OtpHeroPanelProps> = ({ onNavigateRegister }) => {
  return (
    <div className="bg-gradient-primary text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top: Logo Badge */}
      <div className="relative z-10">
        <div className="bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full inline-flex items-center gap-2 text-white font-bold text-sm w-fit shadow-sm">
          <HeartPulse className="w-5 h-5 text-white" />
          <span>{VERIFY_OTP_TEXTS.logo}</span>
        </div>
      </div>

      {/* Middle: Headline & Subtitle & Metric Badge */}
      <div className="relative z-10 my-8 space-y-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
          {VERIFY_OTP_TEXTS.heroTitle}
        </h2>
        <p className="text-sm sm:text-base text-white/85 leading-relaxed font-medium">
          {VERIFY_OTP_TEXTS.heroSubtitle}
        </p>

        {/* Info pill card */}
        <div className="bg-white/15 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3.5 text-white shadow-sm mt-6">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-base font-bold leading-tight">{VERIFY_OTP_TEXTS.badgeTitle}</p>
            <p className="text-xs text-white/80 leading-tight">{VERIFY_OTP_TEXTS.badgeSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Bottom: Switch Panel CTA */}
      <div className="relative z-10 space-y-3 pt-4 border-t border-white/15">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-white/90">{VERIFY_OTP_TEXTS.switchPrompt}</p>
            <p className="text-[11px] text-white/70">{VERIFY_OTP_TEXTS.switchSubprompt}</p>
          </div>
          <Button
            type="button"
            onClick={onNavigateRegister}
            className="bg-white text-primary hover:bg-white/90 font-bold shadow-md border-0 px-5 text-sm"
          >
            <span>{VERIFY_OTP_TEXTS.switchButtonText}</span>
            <UserPlus className="w-4 h-4 shrink-0" />
          </Button>
        </div>
      </div>
    </div>
  );
};
