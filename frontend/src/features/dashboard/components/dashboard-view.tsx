import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cpu, ArrowRight } from 'lucide-react';
import { DashboardHeader } from './dashboard-header';
import { FoundationGrid } from './foundation-grid';
import { formatGatewayLabel } from '../utils';
import type { DashboardViewProps } from '../types';

export function DashboardView({
  header,
  foundationGrid,
  gateway,
  ctaText,
  onExplore,
}: DashboardViewProps): React.JSX.Element {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 bg-slate-50/80 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Subtle Ambient Background Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-100/60 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-lg border border-border/80 bg-white/95 backdrop-blur-md shadow-card transition-all duration-300">
        <DashboardHeader
          title={header.title}
          badgeText={header.badgeText}
          description={header.description}
        />

        <CardContent className="space-y-6">
          <FoundationGrid
            sectionTitle={foundationGrid.sectionTitle}
            statusBadgeText={foundationGrid.statusBadgeText}
            items={foundationGrid.items}
          />

          {/* Footer Action and Gateway Info */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Cpu className="h-4 w-4 text-primary" />
              <span className="font-medium text-slate-700">{formatGatewayLabel(gateway)}</span>
            </div>
            <Button
              size="sm"
              className="gap-2 px-4 py-2 text-xs font-semibold cursor-pointer"
              onClick={onExplore}
            >
              <span>{ctaText}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
