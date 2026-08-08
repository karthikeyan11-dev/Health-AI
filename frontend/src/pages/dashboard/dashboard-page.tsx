import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

export function DashboardPage(): React.JSX.Element {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 bg-slate-50/80 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Subtle Ambient Background Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-100/60 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-lg border border-border/80 bg-white/95 backdrop-blur-md shadow-card transition-all duration-300">
        <CardHeader className="space-y-4 text-center">
          {/* Brand Icon with Blue/Purple Gradient Accent */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-primary transition-transform duration-300 hover:scale-105">
            <HeartPulse className="h-8 w-8 text-white" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2.5">
              <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
                Health AI
              </CardTitle>
              <Badge variant="gradient" className="px-2.5 py-0.5 text-xs font-semibold">
                Frontend Ready
              </Badge>
            </div>
            <CardDescription className="text-sm font-normal text-muted-foreground max-w-sm mx-auto">
              Smart Healthcare Monitoring & Physiological Digital Twin Architecture
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Foundation Verification Grid */}
          <div className="rounded-xl border border-border/70 bg-slate-50/70 p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2.5">
              <span className="font-semibold text-foreground tracking-wide">
                Foundation Verification
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-white border border-border/60 shadow-sm space-y-0.5">
                <span className="text-muted-foreground font-normal">Framework</span>
                <p className="font-semibold text-foreground">React 18 + Vite</p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-border/60 shadow-sm space-y-0.5">
                <span className="text-muted-foreground font-normal">Styling</span>
                <p className="font-semibold text-foreground">Tailwind + shadcn/ui</p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-border/60 shadow-sm space-y-0.5">
                <span className="text-muted-foreground font-normal">Router</span>
                <p className="font-semibold text-foreground">React Router v7</p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-border/60 shadow-sm space-y-0.5">
                <span className="text-muted-foreground font-normal">API Layer</span>
                <p className="font-semibold text-foreground">Axios + OpenAPI SDK</p>
              </div>
            </div>
          </div>

          {/* Footer Action and Gateway Info */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Cpu className="h-4 w-4 text-primary" />
              <span className="font-medium text-slate-700">Backend Gateway: Port 5000</span>
            </div>
            <Button size="sm" className="gap-2 px-4 py-2 text-xs font-semibold">
              <span>Explore Platform</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
