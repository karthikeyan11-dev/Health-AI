import React from 'react';
import type { Recommendation, PatientOverviewActivityItem } from '@/sdk';
import { Lightbulb, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface RecentActivityListProps {
  recommendations?: Recommendation[];
  activity?: PatientOverviewActivityItem[];
}

export function RecentActivityList({
  recommendations = [],
  activity = [],
}: RecentActivityListProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* High-Priority Recommendations */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Active Recommendations</span>
          </h3>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            {recommendations.length} Active
          </span>
        </div>

        <div className="space-y-3">
          {recommendations.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 text-center">
              No active recommendations at this time. Telemetry is stable.
            </div>
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{rec.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.priority === 'HIGH' || rec.priority === 'URGENT'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                  <span>Category: {rec.category}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Recent Activity & Reports</span>
          </h3>
        </div>

        <div className="space-y-3">
          {activity.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 text-center">
              No recent activity recorded.
            </div>
          ) : (
            activity.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  {item.type === 'ASSESSMENT' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-teal-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-slate-900 truncate">{item.title}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
