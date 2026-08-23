'use client';

import { AiRequestLog } from '@/types/ai/log';
import { MapPin, XCircle, Check, X } from 'lucide-react';

interface HitlQueueProps {
  recentLogs: AiRequestLog[];
  actionLoadingId: string | null;
  onApproveCancel: (logId: string, orderIdStr: string) => Promise<void>;
  onApproveChangeAddress: (logId: string, orderIdStr: string, newAddress: string) => Promise<void>;
  onReject: (logId: string) => Promise<void>;
}

export default function HitlQueue({
  recentLogs,
  actionLoadingId,
  onApproveCancel,
  onApproveChangeAddress,
  onReject
}: HitlQueueProps) {
  
  // Trích xuất intent và slots từ output_json thực tế của AI
  const getLogIntentInfo = (log: AiRequestLog) => {
    const output = log.output_json || {};
    const intent = (output.intent || '') as string;
    const slots = (output.slots || {}) as {
      order_id?: string;
      order_ids?: string[];
      new_address?: string;
    };
    return { intent, slots };
  };

  const reviewLogs = recentLogs.filter((log) => log.flag_for_review);

  return (
    <div className="border-4 border-[#09090B] bg-white p-8 shadow-[4px_4px_0px_0px_#09090B]">
      <div className="flex items-center justify-between border-b-4 border-[#09090B] pb-4 mb-6">
        <h3 className="text-xl font-black text-[#09090B] uppercase tracking-tight">
          Duyệt hành động AI
        </h3>
        <span className="font-mono text-xs bg-rose-50 border border-rose-200 text-rose-600 px-2 py-0.5 animate-pulse font-bold">
          HITL
        </span>
      </div>

      <div className="space-y-6">
        {reviewLogs.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 font-mono text-xs border-2 border-dashed border-zinc-200 p-4">
            Hiện không có yêu cầu nào cần duyệt thủ công.
          </div>
        ) : (
          reviewLogs.map((log) => {
            const { intent, slots } = getLogIntentInfo(log);
            const isActionLoading = actionLoadingId === log.id;

            return (
              <div
                key={log.id}
                className="border-2 border-[#09090B] bg-[#FAFAFA] p-4 shadow-[3px_3px_0px_0px_#09090B] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
              >
                <div className="flex items-center justify-between border-b border-dashed border-zinc-200 pb-2 mb-3">
                  <span className={`font-mono text-[9px] font-bold px-2 py-0.5 border border-[#09090B] ${
                    intent === 'CANCEL_ORDER' ? 'bg-rose-100 text-rose-800' :
                    intent === 'CHANGE_ADDRESS' ? 'bg-amber-100 text-amber-800' :
                    'bg-zinc-100 text-zinc-800'
                  }`}>
                    {intent === 'CANCEL_ORDER' ? 'Yêu cầu Hủy đơn' :
                     intent === 'CHANGE_ADDRESS' ? 'Đổi địa chỉ' :
                     intent || 'Không rõ'}
                  </span>
                  <span className="font-mono text-[9px] text-[#F97316] font-bold">
                    Độ tin cậy: {log.confidence_score ? `${(log.confidence_score * 100).toFixed(0)}%` : 'Thấp'}
                  </span>
                </div>

                {/* Customer Utterance */}
                <p className="text-xs text-[#09090B] italic leading-relaxed mb-4">
                  &ldquo;{log.input_text}&rdquo;
                </p>

                {/* Extracted Slots details */}
                <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-sm text-[10px] font-mono text-zinc-600 mb-4 space-y-1">
                  {intent === 'CANCEL_ORDER' && slots.order_ids && (
                    <div>
                      <span className="font-bold text-[#09090B]">Hủy đơn ID: </span>
                      {Array.isArray(slots.order_ids) ? slots.order_ids.join(', ') : slots.order_ids}
                    </div>
                  )}
                  {intent === 'CHANGE_ADDRESS' && (
                    <>
                      <div>
                        <span className="font-bold text-[#09090B]">Đơn ID: </span>
                        {slots.order_id}
                      </div>
                      <div className="flex items-start gap-1 mt-1">
                        <MapPin size={10} className="mt-0.5 text-[#F97316]" />
                        <div>
                          <span className="font-bold text-[#09090B]">Địa chỉ mới: </span>
                          {slots.new_address}
                        </div>
                      </div>
                    </>
                  )}
                  {!slots.order_id && !slots.order_ids && (
                    <div className="text-[9px] text-zinc-400">Không trích xuất được thông số chi tiết</div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {intent === 'CANCEL_ORDER' && slots.order_ids && (
                    <button
                      onClick={() => {
                        const orderId = Array.isArray(slots.order_ids) ? slots.order_ids[0] : slots.order_ids;
                        if (orderId) {
                          void onApproveCancel(log.id, orderId);
                        }
                      }}
                      disabled={isActionLoading}
                      className="flex-1 btn-brutal inline-flex items-center justify-center gap-1 bg-[#F97316] text-white font-mono font-bold text-[10px] py-2 uppercase border border-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <XCircle size={10} />
                      Duyệt Hủy
                    </button>
                  )}

                  {intent === 'CHANGE_ADDRESS' && slots.order_id && slots.new_address && (
                    <button
                      onClick={() => {
                        if (slots.order_id && slots.new_address) {
                          void onApproveChangeAddress(log.id, slots.order_id, slots.new_address);
                        }
                      }}
                      disabled={isActionLoading}
                      className="flex-1 btn-brutal inline-flex items-center justify-center gap-1 bg-[#F97316] text-white font-mono font-bold text-[10px] py-2 uppercase border border-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Check size={10} />
                      Duyệt Đổi
                    </button>
                  )}

                  <button
                    onClick={() => void onReject(log.id)}
                    disabled={isActionLoading}
                    className="btn-brutal inline-flex items-center justify-center gap-1 bg-white text-[#09090B] font-mono font-bold text-[10px] px-3 py-2 uppercase border border-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 hover:bg-zinc-100"
                  >
                    <X size={10} />
                    Từ Chối
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
