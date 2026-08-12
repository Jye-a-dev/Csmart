'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAiTasks } from '@/hooks';
import { CircuitBreakerState } from '@/types/ai/task';
import { Settings, RefreshCw, Save, Shield, Sliders, Store, Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const SETTINGS_KEY = 'csmart_admin_settings';

interface AdminSettings {
  confidence_threshold: number;
  store_name: string;
  store_hotline: string;
  store_address: string;
}

const DEFAULT_SETTINGS: AdminSettings = {
  confidence_threshold: 0.7,
  store_name: 'CsmartAI Store',
  store_hotline: '',
  store_address: '',
};

const CIRCUIT_CONFIG: Record<CircuitBreakerState['state'], { label: string; cls: string; icon: React.ElementType; desc: string }> = {
  CLOSED: { label: 'CLOSED — Hoạt động bình thường', cls: 'bg-emerald-400 text-[#09090B]', icon: CheckCircle, desc: 'AI Microservices đang hoạt động ổn định. Tất cả requests được phép đi qua.' },
  OPEN: { label: 'OPEN — Ngừng hoạt động', cls: 'bg-rose-400 text-white', icon: XCircle, desc: 'Circuit breaker đang MỞ. Tất cả AI requests bị chặn để bảo vệ hệ thống.' },
  HALF_OPEN: { label: 'HALF_OPEN — Đang thử nghiệm phục hồi', cls: 'bg-amber-400 text-[#09090B]', icon: AlertTriangle, desc: 'Circuit breaker đang ở trạng thái thử nghiệm. Một số requests sẽ được phép để kiểm tra.' },
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

  const circuitCfg = circuit ? CIRCUIT_CONFIG[circuit.state] : null;

  return (
    <div className="space-y-8 font-sans max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 border-2 border-[#09090B] font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#09090B] ${toast.type === 'ok' ? 'bg-emerald-400 text-[#09090B]' : 'bg-rose-400 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-[#09090B] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-[#09090B] text-[#F97316]"><Settings size={20} /></div>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">Cài Đặt Hệ Thống</h1>
          </div>
          <p className="font-mono text-xs text-zinc-500">Cấu hình AI threshold, Circuit Breaker và thông tin cửa hàng</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-6 py-3 border-2 border-[#09090B] font-mono font-black text-xs uppercase shadow-[4px_4px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 ${saved ? 'bg-emerald-400 text-[#09090B]' : 'bg-[#F97316] text-[#09090B]'}`}
        >
          {saved ? <CheckCircle size={14} /> : <Save size={14} />}
          {saved ? 'Đã lưu!' : 'Lưu Cài Đặt'}
        </button>
      </div>

      {/* AI Confidence Threshold */}
      <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
        <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase flex items-center gap-2">
          <Sliders size={14} className="text-[#F97316]" />
          Ngưỡng Tin cậy AI (Confidence Threshold)
        </div>
        <div className="p-5 space-y-4">
          <p className="font-mono text-xs text-zinc-500">
            Các AI request có confidence score thấp hơn ngưỡng này sẽ tự động được gắn cờ <code className="bg-zinc-100 px-1 font-black">flag_for_review: true</code> và đưa vào hàng chờ HITL.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0} max={1} step={0.05}
              value={settings.confidence_threshold}
              onChange={(e) => set('confidence_threshold', Number(e.target.value))}
              className="flex-1 accent-[#F97316] h-2"
            />
            <div className="border-2 border-[#09090B] px-4 py-2 font-mono font-black text-lg text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] min-w-20 text-center">
              {(settings.confidence_threshold * 100).toFixed(0)}%
            </div>
          </div>
          <div className="flex justify-between font-mono text-[10px] text-zinc-400">
            <span>0% — Không lọc</span>
            <span className="text-amber-600 font-black">Hiện tại: {(settings.confidence_threshold * 100).toFixed(0)}%</span>
            <span>100% — Lọc rất nghiêm</span>
          </div>
          {/* Visual hint */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { range: '0–50%', label: 'Rủi ro cao', cls: 'bg-rose-100 border-rose-300 text-rose-700' },
              { range: '50–80%', label: 'Cần review', cls: 'bg-amber-100 border-amber-300 text-amber-700' },
              { range: '80–100%', label: 'Tin cậy cao', cls: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
            ].map((zone) => (
              <div key={zone.range} className={`p-2 border rounded font-mono text-[10px] font-black ${zone.cls}`}>
                <div>{zone.range}</div>
                <div>{zone.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Circuit Breaker Status */}
      <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
        <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-[#F97316]" />
            Circuit Breaker — AI Microservices
          </div>
          <button onClick={loadCircuit} className="text-zinc-400 hover:text-white cursor-pointer flex items-center gap-1">
            <RefreshCw size={12} className={circuitLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
        <div className="p-5">
          {circuitLoading ? (
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <Loader2 size={14} className="animate-spin" /> Đang lấy trạng thái...
            </div>
          ) : circuit && circuitCfg ? (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 px-4 py-3 border-2 border-[#09090B] font-mono font-black text-sm ${circuitCfg.cls}`}>
                <circuitCfg.icon size={20} />
                {circuitCfg.label}
              </div>
              <p className="font-mono text-xs text-zinc-500">{circuitCfg.desc}</p>
              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-3 border-2 border-[#09090B] bg-zinc-50">
                  <div className="text-zinc-500 uppercase mb-1">Số lần thất bại</div>
                  <div className="text-2xl font-black text-[#09090B]">{circuit.failuresCount}</div>
                </div>
                <div className="p-3 border-2 border-[#09090B] bg-zinc-50">
                  <div className="text-zinc-500 uppercase mb-1">Thất bại gần nhất</div>
                  <div className="font-black text-[#09090B]">
                    {circuit.lastFailureTime
                      ? new Date(circuit.lastFailureTime).toLocaleString('vi-VN')
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="font-mono text-xs text-zinc-400 italic">Không thể lấy trạng thái Circuit Breaker.</p>
          )}
        </div>
      </section>

      {/* Store Information */}
      <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
        <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase flex items-center gap-2">
          <Store size={14} className="text-[#F97316]" />
          Thông tin Cửa hàng
        </div>
        <div className="p-5 space-y-4">
          <p className="font-mono text-xs text-zinc-500">
            Thông tin này được hiển thị trong các phản hồi AI Assistant khi khách hàng hỏi về liên hệ hỗ trợ.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Tên cửa hàng</label>
              <input value={settings.store_name} onChange={(e) => set('store_name', e.target.value)} placeholder="VD: CsmartAI Store" className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B]" />
            </div>
            <div>
              <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Hotline / Số điện thoại</label>
              <input value={settings.store_hotline} onChange={(e) => set('store_hotline', e.target.value)} placeholder="VD: 0901 234 567" className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B]" />
            </div>
            <div className="md:col-span-2">
              <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Địa chỉ cửa hàng</label>
              <input value={settings.store_address} onChange={(e) => set('store_address', e.target.value)} placeholder="VD: 123 Nguyễn Huệ, Q.1, TP.HCM" className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B]" />
            </div>
          </div>
          <div className="p-3 border-2 border-dashed border-zinc-300 bg-zinc-50 font-mono text-[10px] text-zinc-400">
            ⚠ Cài đặt được lưu trong localStorage trình duyệt. Để lưu vĩnh viễn lên server, cần tích hợp API /settings.
          </div>
        </div>
      </section>
    </div>
  );
}
