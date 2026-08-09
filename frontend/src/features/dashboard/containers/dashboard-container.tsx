import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardView } from '../components';
import { dashboardApi } from '../api';
import {
  DASHBOARD_BRAND,
  FOUNDATION_VERIFICATION,
  DEFAULT_GATEWAY_INFO,
  DASHBOARD_ACTIONS,
} from '../constants';
import type { GatewayInfo } from '../types';

export function DashboardContainer(): React.JSX.Element {
  const navigate = useNavigate();
  const [gateway, setGateway] = useState<GatewayInfo>(DEFAULT_GATEWAY_INFO);

  useEffect(() => {
    let isMounted = true;

    async function loadGatewayStatus(): Promise<void> {
      const status = await dashboardApi.getGatewayStatus();
      if (isMounted) {
        setGateway(status);
      }
    }

    void loadGatewayStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleExplore = useCallback(() => {
    // Record visit timestamp in storage and navigate or trigger exploration intent
    localStorage.setItem(DASHBOARD_ACTIONS.STORAGE_KEY_LAST_VISIT, new Date().toISOString());
    navigate('/');
  }, [navigate]);

  return (
    <DashboardView
      header={{
        title: DASHBOARD_BRAND.TITLE,
        badgeText: DASHBOARD_BRAND.BADGE,
        description: DASHBOARD_BRAND.DESCRIPTION,
      }}
      foundationGrid={{
        sectionTitle: FOUNDATION_VERIFICATION.SECTION_TITLE,
        statusBadgeText: FOUNDATION_VERIFICATION.STATUS_BADGE,
        items: FOUNDATION_VERIFICATION.ITEMS,
      }}
      gateway={gateway}
      ctaText={DASHBOARD_ACTIONS.EXPLORE_CTA}
      onExplore={handleExplore}
    />
  );
}
