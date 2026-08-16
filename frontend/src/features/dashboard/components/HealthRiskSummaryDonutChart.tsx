import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { PatientHealthRiskSummary } from '@/sdk';
import { PieChart as PieIcon } from 'lucide-react';

interface HealthRiskSummaryDonutChartProps {
  summary?: PatientHealthRiskSummary;
}

export function HealthRiskSummaryDonutChart({
  summary,
}: HealthRiskSummaryDonutChartProps): React.JSX.Element {
  const data = [
    { name: 'Optimal', value: summary?.optimalPercent ?? 70, color: '#10b981' },
    { name: 'Stable', value: summary?.stablePercent ?? 20, color: '#14b8a6' },
    { name: 'Elevated Stress', value: summary?.elevatedPercent ?? 8, color: '#f59e0b' },
    { name: 'At Risk', value: summary?.atRiskPercent ?? 2, color: '#ef4444' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-600" />
            <span>Health Risk Summary</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Physiological state & risk score distribution
          </p>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                fontSize: '12px',
              }}
              formatter={(val?: unknown) => [`${String(val ?? 0)}%`, 'Distribution']}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
