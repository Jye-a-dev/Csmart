'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useHitl } from '@/hooks';
import type { HitlItem } from '@/types/ai/hitl';

export default function HitlQueueTab() {
  const [hitlQueue, setHitlQueue] = useState<HitlItem[]>([]);
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);

  const { loading: hitlLoading, fetchQueue, approveItem, rejectItem } = useHitl();

  const handleRefreshHitl = useCallback(() => {
    fetchQueue({ status: 'PENDING', limit: 20 })
      .then((data) => setHitlQueue(data || []))
      .catch(() => setHitlQueue([]));
  }, [fetchQueue]);

  useEffect(() => {
    let isMounted = true;
    fetchQueue({ status: 'PENDING', limit: 20 })
      .then((data) => {
        if (isMounted) {
          setHitlQueue(data || []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHitlQueue([]);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [fetchQueue]);

  const handleApprove = async (id: string) => {
    setActionProcessingId(id);
    try {
      await approveItem(id, { reviewer_note: 'Đã duyệt qua Console CSKH' });
      setHitlQueue((prev) => prev.filter((item) => item.id !== id));
    } catch {
      // Error handling
    } finally {
      setActionProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionProcessingId(id);
    try {
      await rejectItem(id, { reviewer_note: 'Từ chối qua Console CSKH' });
      setHitlQueue((prev) => prev.filter((item) => item.id !== id));
    } catch {
      // Error handling
    } finally {
      setActionProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-black uppercase text-[#09090B]">
          Hàng đợi yêu cầu có điểm tin cậy thấp cần duyệt thủ công ({hitlQueue.length})
        </span>
        <button
          type="button"
          onClick={handleRefreshHitl}
          className="font-mono text-xs underline text-[#F97316] font-bold cursor-pointer"
        >
          Làm mới
        </button>
      </div>

      {hitlLoading && (
        <div className="py-8 text-center font-mono text-xs text-zinc-500 flex items-center justify-center gap-2">
          <Loader2 size={15} className="animate-spin text-[#F97316]" />
          <span>Đang tải danh sách hàng đợi HITL...</span>
        </div>
      )}

      {!hitlLoading && hitlQueue.length === 0 && (
        <div className="card-brutal bg-white p-8 text-center space-y-2">
          <CheckCircle size={28} className="text-emerald-500 mx-auto" />
          <h4 className="font-mono font-bold text-sm text-[#09090B] uppercase">
            Hàng đợi kiểm duyệt trống
          </h4>
          <p className="text-zinc-500 font-sans text-xs">
            Mọi yêu cầu AI đang có độ tin cậy cao và không có mục nào cần can thiệp thủ công.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {hitlQueue.map((item) => {
          const isProcessing = actionProcessingId === item.id;

          return (
            <div
              key={item.id}
              className="card-brutal bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-black uppercase bg-[#09090B] text-white px-2 py-0.5">
                    {item.endpoint}
                  </span>
                  <span className="font-mono text-[10px] text-amber-700 bg-amber-100 border border-amber-400 px-1.5 py-0.5">
                    Score: {item.confidence_score !== undefined ? `${(item.confidence_score * 100).toFixed(0)}%` : 'N/A'}
                  </span>
                </div>

                <p className="font-sans text-xs text-[#09090B] font-semibold">
                  &quot;{item.input_text || JSON.stringify(item.output_json)}&quot;
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => handleApprove(item.id)}
                  disabled={isProcessing}
                  className="btn-brutal inline-flex items-center gap-1 bg-emerald-500 text-white px-3 py-1.5 uppercase hover:bg-emerald-600 cursor-pointer"
                >
                  <CheckCircle size={14} />
                  <span>Duyệt</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReject(item.id)}
                  disabled={isProcessing}
                  className="btn-brutal inline-flex items-center gap-1 bg-rose-500 text-white px-3 py-1.5 uppercase hover:bg-rose-600 cursor-pointer"
                >
                  <XCircle size={14} />
                  <span>Từ chối</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
