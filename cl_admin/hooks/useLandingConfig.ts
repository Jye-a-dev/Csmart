'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import { LandingConfig, DEFAULT_LANDING_CONFIG } from '@/types/landing';

export const LANDING_STORAGE_KEY = 'csmart_landing_config';

export function useLandingConfig() {
  const [config, setConfig] = useState<LandingConfig>(DEFAULT_LANDING_CONFIG);

  useEffect(() => {
    let ignore = false;

    async function load() {
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
        // Fallback to local
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, []);

  const saveConfig = useCallback(async (newConfig: LandingConfig) => {
    try {
      setConfig(newConfig);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANDING_STORAGE_KEY, JSON.stringify(newConfig));
      }

      await apiClient<LandingConfig>('/landing/config', {
        method: 'PUT',
        body: newConfig,
      });

      try {
        const channel = new BroadcastChannel('csmart_landing_sync');
        channel.postMessage({ type: 'UPDATE_LANDING_CONFIG' });
        channel.close();
      } catch {
        // ignore
      }

      return true;
    } catch {
      // If API fails, local copy is still updated
      return true;
    }
  }, []);

  const resetConfig = useCallback(async () => {
    try {
      setConfig(DEFAULT_LANDING_CONFIG);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANDING_STORAGE_KEY, JSON.stringify(DEFAULT_LANDING_CONFIG));
      }
      await apiClient<LandingConfig>('/landing/config/reset', {
        method: 'POST',
      });

      try {
        const channel = new BroadcastChannel('csmart_landing_sync');
        channel.postMessage({ type: 'UPDATE_LANDING_CONFIG' });
        channel.close();
      } catch {
        // ignore
      }

      return true;
    } catch {
      return true;
    }
  }, []);

  return { config, saveConfig, resetConfig };
}
