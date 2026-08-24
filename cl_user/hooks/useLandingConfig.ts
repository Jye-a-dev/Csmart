'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/libs/api-client';
import { LandingConfig, DEFAULT_LANDING_CONFIG } from '@/types/landing';

export const LANDING_STORAGE_KEY = 'csmart_landing_config';

export function useLandingConfig() {
  const [config, setConfig] = useState<LandingConfig>(DEFAULT_LANDING_CONFIG);

  useEffect(() => {
    let ignore = false;

    const fetchConfig = async () => {
      try {
        const data = await apiClient<LandingConfig>('/landing/config');
        if (!ignore && data && typeof data === 'object') {
          const merged = { ...DEFAULT_LANDING_CONFIG, ...data };
          setConfig(merged);
          if (typeof window !== 'undefined') {
            localStorage.setItem(LANDING_STORAGE_KEY, JSON.stringify(merged));
          }
        }
      } catch {
        // Fallback to local storage
        try {
          const stored = localStorage.getItem(LANDING_STORAGE_KEY);
          if (!ignore && stored) {
            setConfig({ ...DEFAULT_LANDING_CONFIG, ...JSON.parse(stored) });
          }
        } catch {
          // ignore
        }
      }
    };

    void fetchConfig();

    // Refresh on tab focus, storage changes, and broadcast messages
    const handleRefresh = () => {
      void fetchConfig();
    };

    window.addEventListener('focus', handleRefresh);
    window.addEventListener('visibilitychange', handleRefresh);
    window.addEventListener('storage', handleRefresh);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('csmart_landing_sync');
      channel.onmessage = () => {
        void fetchConfig();
      };
    } catch {
      // ignore
    }

    return () => {
      ignore = true;
      window.removeEventListener('focus', handleRefresh);
      window.removeEventListener('visibilitychange', handleRefresh);
      window.removeEventListener('storage', handleRefresh);
      if (channel) channel.close();
    };
  }, []);

  return { config };
}
