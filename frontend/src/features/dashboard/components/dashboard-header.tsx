import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartPulse } from 'lucide-react';
import type { DashboardHeaderProps } from '../types';

export function DashboardHeader({
  title,
  badgeText,
  description,
}: DashboardHeaderProps): React.JSX.Element {
  return (
    <CardHeader className="space-y-4 text-center">
      {/* Brand Icon with Blue/Purple Gradient Accent */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-primary transition-transform duration-300 hover:scale-105">
        <HeartPulse className="h-8 w-8 text-white" />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-center gap-2.5">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
            {title}
          </CardTitle>
          <Badge variant="gradient" className="px-2.5 py-0.5 text-xs font-semibold">
            {badgeText}
          </Badge>
        </div>
        <CardDescription className="text-sm font-normal text-muted-foreground max-w-sm mx-auto">
          {description}
        </CardDescription>
      </div>
    </CardHeader>
  );
}
