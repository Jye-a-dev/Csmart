'use client';

import { RefreshCw, CheckCircle, Terminal } from 'lucide-react';

interface CircuitState {
  state: string;
  failuresCount: number;
  lastFailureTime: number | null;
}

interface CircuitBreakerPanelProps {
  circuitState: CircuitState | null;
  onRefresh: () => void;
  loading: boolean;
}

export default function CircuitBreakerPanel({
  circuitState,
  onRefresh,
  loading
}: CircuitBreakerPanelProps) {
  return (
    <div className="lg:col-span-4 space-y-6">
      {/* Circuit Breaker Status */}
      <div className="border-4 border-[#09090B] bg-zinc-950 text-emerald-400 p-6 shadow-[6px_6px_0px_0px_#09090B] font-mono text-xs relative overflow-hidden">
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-size-[100%_4px] z-10 opacity-10" />

        <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3 mb-4">
          <span className="font-bold uppercase tracking-wider">CIRCUIT_BREAKER_TELEMETRY</span>
          <button onClick={onRefresh} className="text-emerald-500 hover:text-emerald-300 transition-colors cursor-pointer">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {circuitState ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Trạng thái Circuit:</span>
              <span className={`px-2 py-0.5 border text-[10px] font-bold ${
                circuitState.state === 'CLOSED' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' :
                'bg-rose-950/40 text-rose-400 border-rose-800'
              }`}>
                {circuitState.state}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Lỗi liên tiếp:</span>
              <span>{circuitState.failuresCount} / 5</span>
            </div>
            <div className="flex justify-between">
              <span>Lần lỗi cuối:</span>
              <span className="text-zinc-500 text-[10px]">
                {circuitState.lastFailureTime ? new Date(circuitState.lastFailureTime).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-zinc-500 italic">Không có dữ liệu telemetry.</p>
        )}
      </div>

      {/* Quick instructions / Help */}
      <div className="border-4 border-[#09090B] bg-[#FAFAFA] p-5 shadow-[6px_6px_0px_0px_#09090B]">
        <h4 className="font-bold font-mono text-sm uppercase text-[#09090B] mb-3 flex items-center gap-1.5 border-b-2 border-zinc-200 pb-1.5">
          <CheckCircle size={16} className="text-[#F97316]" /> Hướng dẫn Test nhanh
        </h4>
        <ul className="space-y-2 text-xs text-zinc-600 leading-relaxed font-sans">
          <li>
            <strong className="text-[#09090B] font-mono">1. Thử chat Copilot:</strong> Gõ nội dung để nhận stream trực tiếp từ pipeline_ai qua backend.
          </li>
          <li>
            <strong className="text-[#09090B] font-mono">2. Thử OCR image:</strong> Chọn ảnh (vd: JPEG/PNG) chứa chữ, hàng đợi BullMQ sẽ tự động xử lý và cập nhật kết quả dạng JSON.
          </li>
          <li>
            <strong className="text-[#09090B] font-mono">3. Thử Đánh giá:</strong> Chạy mô phỏng kiểm thử tự động, lưu log chi tiết vào database PostgreSQL.
          </li>
        </ul>
      </div>
    </div>
  );
}
