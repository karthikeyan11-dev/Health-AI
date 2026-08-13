import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { FoundationGridProps } from '../types';

export function FoundationGrid({
  sectionTitle,
  statusBadgeText,
  items,
}: FoundationGridProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-border/70 bg-slate-50/70 p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2.5">
        <span className="font-semibold text-foreground tracking-wide">{sectionTitle}</span>
        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          <CheckCircle2 className="h-3.5 w-3.5" /> {statusBadgeText}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 text-xs">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-lg bg-white border border-border/60 shadow-sm space-y-0.5"
          >
            <span className="text-muted-foreground font-normal">{item.label}</span>
            <p className="font-semibold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
