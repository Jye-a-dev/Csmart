'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAiTasks } from '@/hooks';
import { CircuitBreakerState } from '@/types/ai/task';
import {
  SettingsHeader,
  ConfidenceThresholdSection,
  CircuitBreakerSection,
  StoreInfoSection,
  AdminSettings,
} from './sections';

const SETTINGS_KEY = 'csmart_admin_settings';

const DEFAULT_SETTINGS: AdminSettings = {
  confidence_threshold: 0.7,
  store_name: 'CsmartAI Store',
  store_hotline: '',
  store_address: '',
};

export default function SettingsPage() {
  const { getCircuitStatus } = useAiTasks();

  const [settings, setSettings] = useState<AdminSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...(JSON.parse(stored) as AdminSettings) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });
  const [circuit, setCircuit] = useState<CircuitBreakerState | null>(null);
  const [circuitLoading, setCircuitLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCircuit = useCallback(async () => {
    setCircuitLoading(true);
    try {
      const state = await getCircuitStatus();
      setCircuit(state);
    } catch {
      showToast('Không thể lấy trạng thái Circuit Breaker', 'err');
    } finally {
      setCircuitLoading(false);
    }
  }, [getCircuitStatus]);

  useEffect(() => {
    const t = setTimeout(() => void loadCircuit(), 0);
    return () => clearTimeout(t);
  }, [loadCircuit]);

  const handleSave = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setSaved(true);
      showToast('Đã lưu cài đặt!');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      showToast('Lỗi khi lưu cài đặt', 'err');
    }
  };

  const set = <K extends keyof AdminSettings>(key: K, val: AdminSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-8 font-sans max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 border-2 border-[#09090B] font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#09090B] ${toast.type === 'ok' ? 'bg-emerald-400 text-[#09090B]' : 'bg-rose-400 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header Section */}
      <SettingsHeader saved={saved} onSave={handleSave} />

      {/* AI Confidence Threshold Section */}
      <ConfidenceThresholdSection
        confidenceThreshold={settings.confidence_threshold}
        onChange={(val) => set('confidence_threshold', val)}
      />

      {/* Circuit Breaker Status Section */}
      <CircuitBreakerSection
        circuit={circuit}
        circuitLoading={circuitLoading}
        onRefresh={loadCircuit}
      />

      {/* Store Information Section */}
      <StoreInfoSection
        settings={settings}
        onSet={set}
      />
    </div>
  );
}
