import type { GatewayInfo } from '../types';

/**
 * Formats the Gateway display text based on port and name.
 */
export function formatGatewayLabel(gateway: GatewayInfo): string {
  return `${gateway.name}: Port ${gateway.port}`;
}

/**
 * Resolves gateway status variant for visual indicators.
 */
export function resolveGatewayStatusColor(status: GatewayInfo['status']): string {
  switch (status) {
    case 'ONLINE':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200/60';
    case 'OFFLINE':
      return 'text-red-600 bg-red-50 border-red-200/60';
    case 'CONNECTING':
      return 'text-amber-600 bg-amber-50 border-amber-200/60';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200/60';
  }
}
