'use client';

import { useState } from 'react';
import { Sparkles, CheckCircle, Search, Loader2 } from 'lucide-react';
import { useAiTasks, useOrders } from '@/hooks';
import type { Order } from '@/types/entities/order';

export default function NerExtractorTab() {
  const [chatSnippet, setChatSnippet] = useState(
    'Khách hàng nhắn: "Hủy đơn hàng số 54321 giúp tôi, hoặc đổi sang địa chỉ nhận hàng tại 88 Cầu Giấy, Hà Nội nhé!"'
  );
  const [nerLoading, setNerLoading] = useState(false);
  const [nerResult, setNerResult] = useState<{
    intent: string;
    slots: { order_id?: string | null; order_ids?: string[] | null; new_address?: string | null };
    confidence_score: number;
    flag_for_review: boolean;
  } | null>(null);

  const [lookupOrderId, setLookupOrderId] = useState('');
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);

  const { extractNer } = useAiTasks();
  const { findOneOrder } = useOrders();

  const handleExtractNer = async () => {
    if (!chatSnippet.trim()) return;
    setNerLoading(true);
    try {
      const res = await extractNer({ text: chatSnippet.trim() });
      setNerResult(res);
      if (res.slots?.order_id) {
        setLookupOrderId(res.slots.order_id);
      }
    } catch {
      // Fallback
    } finally {
      setNerLoading(false);
    }
  };

  const handleLookupOrder = async (orderIdToFetch?: string) => {
    const id = orderIdToFetch || lookupOrderId;
    if (!id.trim()) return;
    try {
      const order = await findOneOrder(id.trim());
      setOrderDetail(order);
    } catch {
      setOrderDetail(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Textarea Input */}
      <div className="card-brutal bg-white p-4 space-y-3">
        <label className="block font-mono text-xs font-bold uppercase text-[#09090B]">
          Dán nội dung tin nhắn hoặc ghi chú khách hàng:
        </label>
        <textarea
          rows={3}
          value={chatSnippet}
          onChange={(e) => setChatSnippet(e.target.value)}
          className="w-full bg-[#FAF7F2] text-[#09090B] font-sans text-xs p-3 border-2 border-[#09090B] focus:outline-none focus:border-[#F97316]"
          placeholder="Nhập đoạn hội thoại của khách để AI tự động phát hiện mã đơn, địa chỉ mới..."
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleExtractNer}
            disabled={nerLoading}
            className="btn-brutal inline-flex items-center gap-2 bg-[#F97316] text-[#09090B] font-mono text-xs font-black px-4 py-2 uppercase cursor-pointer hover:bg-[#ea580c] hover:text-white"
          >
            {nerLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Đang xử lý NER...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Bóc tách tự động (POST /ai/ner)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Extraction Results */}
      {nerResult && (
        <div className="card-brutal bg-white p-5 space-y-4 border-2 border-[#09090B]">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
            <span className="font-mono text-xs font-black uppercase text-[#09090B] flex items-center gap-1.5">
              <CheckCircle size={15} className="text-emerald-600" />
              Kết Quả Nhận Diện Thực Thể (NER Result)
            </span>
            <span className="font-mono text-[11px] font-bold text-zinc-500">
              Điểm tin cậy: {(nerResult.confidence_score * 100).toFixed(0)}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-[#FAF7F2] p-3 border border-[#09090B]">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                Ý ĐỊNH (INTENT)
              </span>
              <span className="font-bold text-[#F97316] text-sm">
                {nerResult.intent || 'UNKNOWN'}
              </span>
            </div>

            <div className="bg-[#FAF7F2] p-3 border border-[#09090B]">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                MÃ ĐƠN HÀNG (ORDER_IDS)
              </span>
              <span className="font-bold text-[#09090B] text-sm">
                {nerResult.slots.order_ids?.join(', ') ||
                  nerResult.slots.order_id ||
                  'Không phát hiện'}
              </span>
            </div>

            <div className="bg-[#FAF7F2] p-3 border border-[#09090B]">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                ĐỊA CHỈ MỚI (NEW_ADDRESS)
              </span>
              <span className="font-bold text-zinc-800 text-xs line-clamp-2">
                {nerResult.slots.new_address || 'Không phát hiện'}
              </span>
            </div>
          </div>

          {/* Direct Order Lookup trigger */}
          {nerResult.slots.order_id && (
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleLookupOrder(nerResult.slots.order_id!)}
                className="btn-brutal inline-flex items-center gap-1.5 bg-[#09090B] text-white font-mono text-xs font-bold px-3 py-1.5 uppercase cursor-pointer"
              >
                <Search size={13} />
                <span>Tra cứu đơn hàng #{nerResult.slots.order_id}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Result if queried */}
      {orderDetail && (
        <div className="card-brutal bg-amber-50 p-5 space-y-3 border-2 border-[#09090B]">
          <div className="flex items-center justify-between border-b border-amber-300 pb-2">
            <span className="font-mono text-xs font-black uppercase text-[#09090B]">
              Thông Tin Đơn Hàng: #{orderDetail.order_code || orderDetail.id}
            </span>
            <span className="font-mono text-xs font-bold bg-amber-200 px-2 py-0.5 border border-amber-500">
              Trạng thái: {orderDetail.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px]">TỔNG TIỀN</span>
              <span className="font-bold">{orderDetail.total_amount?.toLocaleString()}đ</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">ĐỊA CHỈ GIAO</span>
              <span className="font-bold truncate block">{orderDetail.shipping_address || 'Theo hồ sơ'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">NGÀY TẠO</span>
              <span className="font-bold">{new Date(orderDetail.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">SỐ MÓN HÀNG</span>
              <span className="font-bold">{orderDetail.items?.length || 1} món</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
