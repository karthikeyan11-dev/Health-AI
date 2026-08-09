import type { FoundationItem, GatewayInfo } from '../types';

export const DASHBOARD_BRAND = {
  TITLE: 'Health AI',
  BADGE: 'Frontend Ready',
  DESCRIPTION: 'Smart Healthcare Monitoring & Physiological Digital Twin Architecture',
} as const;

export const FOUNDATION_VERIFICATION = {
  SECTION_TITLE: 'Foundation Verification',
  STATUS_BADGE: 'Ready',
  ITEMS: [
    {
      id: 'framework',
      label: 'Framework',
      value: 'React 18 + Vite',
      isReady: true,
    },
    {
      id: 'styling',
      label: 'Styling',
      value: 'Tailwind + shadcn/ui',
      isReady: true,
    },
    {
      id: 'router',
      label: 'Router',
      value: 'React Router v7',
      isReady: true,
    },
    {
      id: 'api-layer',
      label: 'API Layer',
      value: 'Axios + OpenAPI SDK',
      isReady: true,
    },
  ] as const satisfies readonly FoundationItem[],
} as const;

export const DEFAULT_GATEWAY_INFO: GatewayInfo = {
  name: 'Backend Gateway',
  port: 5000,
  status: 'ONLINE',
  baseUrl: 'http://localhost:5000/api/v1',
};

export const DASHBOARD_ACTIONS = {
  EXPLORE_CTA: 'Explore Platform',
  STORAGE_KEY_LAST_VISIT: 'health_ai_dashboard_last_visit',
} as const;
