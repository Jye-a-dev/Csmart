'use client';

import { Edit3, SendHorizonal, RefreshCw } from 'lucide-react';

interface NerFeedbackToolProps {
  editOrderIds: string;
  setEditOrderIds: (val: string) => void;
  editAddress: string;
  setEditAddress: (val: string) => void;
  onSubmitFeedback: () => void;
  submittingHitl: boolean;
}

export function NerFeedbackTool({
  editOrderIds,
  setEditOrderIds,
  editAddress,
  setEditAddress,
  onSubmitFeedback,
  submittingHitl,
}: NerFeedbackToolProps) {
  return (
    <div className="border-2 border-[#09090B] bg-amber-50 p-6 shadow-[4px_4px_0px_0px_#09090B] space-y-4">
      <div className="flex items-center gap-2 text-[#09090B]">
        <Edit3 size={18} className="text-[#F97316]" />
        <h3 className="font-mono text-xs font-black uppercase tracking-wider">
          FEEDBACK TOOL — CHỈNH SỬA NHÃN & ĐẨY HITL QUEUE
        </h3>
      </div>
      <p className="font-mono text-[11px] text-zinc-700 font-bold">
        Nếu mô hình AI bóc tách thiếu hoặc sai nhãn, Admin có thể sửa trực tiếp bên dưới để lưu vào tập dữ liệu HITL fine-tune:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="font-mono text-[10px] font-black uppercase text-zinc-600 block mb-1">
            Order IDs (phân cách bằng dấu phẩy)
          </label>
          <input
            type="text"
            value={editOrderIds}
            onChange={(e) => setEditOrderIds(e.target.value)}
            placeholder="VD: 101, 102"
            className="w-full p-2.5 font-mono text-xs border-2 border-[#09090B] bg-white text-[#09090B] focus:outline-none"
          />
        </div>

        <div>
          <label className="font-mono text-[10px] font-black uppercase text-zinc-600 block mb-1">
            New Address Chỉnh Sửa
          </label>
          <input
            type="text"
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
            placeholder="VD: 123 Lê Duẩn, Hà Nội"
            className="w-full p-2.5 font-mono text-xs border-2 border-[#09090B] bg-white text-[#09090B] focus:outline-none"
          />
        </div>
      </div>

      <button
        onClick={onSubmitFeedback}
        disabled={submittingHitl}
        className="w-full mt-2 flex items-center justify-center gap-2 font-mono text-xs font-black uppercase py-3 bg-[#09090B] text-white border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#F97316] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
      >
        {submittingHitl ? <RefreshCw size={14} className="animate-spin" /> : <SendHorizonal size={14} />}
        Gửi Kết Quả Hiệu Chỉnh Nhãn Vào HITL
      </button>
    </div>
  );
}
