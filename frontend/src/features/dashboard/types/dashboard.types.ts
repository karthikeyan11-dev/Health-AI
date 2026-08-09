import type { HealthCheckResponse } from '@/sdk';

/**
 * Feature TypeScript types and UI interface definitions for Dashboard.
 * Only defines UI-specific component props not present in generated backend DTOs.
 */

export interface FoundationItem {
  id: string;
  label: string;
  value: string;
  isReady: boolean;
}

export interface GatewayInfo {
  name: string;
  port: number;
  status: 'ONLINE' | 'OFFLINE' | 'CONNECTING';
  baseUrl: string;
  healthData?: HealthCheckResponse;
}

export interface DashboardHeaderProps {
  title: string;
  badgeText: string;
  description: string;
}

export interface FoundationGridProps {
  sectionTitle: string;
  statusBadgeText: string;
  items: readonly FoundationItem[];
}

export interface DashboardViewProps {
  header: DashboardHeaderProps;
  foundationGrid: FoundationGridProps;
  gateway: GatewayInfo;
  ctaText: string;
  onExplore: () => void;
}
