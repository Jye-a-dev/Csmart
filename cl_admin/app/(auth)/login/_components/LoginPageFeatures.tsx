'use client';

import { Grid, ShoppingBag, CheckSquare, Database } from 'lucide-react';

export default function LoginPageFeatures() {
  return (
    <div className="lg:col-span-5 bg-zinc-950 text-white border-4 border-[#09090B] p-8 shadow-[8px_8px_0px_0px_#F97316] flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-2 text-[#F97316] font-mono text-xs font-bold uppercase">
            <Grid size={14} />
            TỔNG QUAN TÍNH NĂNG
          </div>
          <span className="bg-[#F97316] text-[#09090B] font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm">
            v2.4
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black uppercase tracking-tight mb-8 leading-snug">
          Trung tâm điều hành cửa hàng CSMART
        </h3>

        {/* Features List */}
        <div className="space-y-4">
          {/* Feature 1 */}
          <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded-sm flex items-start gap-3">
            <div className="p-2 border border-zinc-800 bg-zinc-950 text-[#F97316] rounded-sm mt-0.5">
              <ShoppingBag size={14} />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-white uppercase mb-1">
                Quản lý đơn hàng
              </h4>
              <p className="text-[10px] text-zinc-400 leading-normal">
                Xem và cập nhật trạng thái các đơn hàng cần giao nhanh chóng.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded-sm flex items-start gap-3">
            <div className="p-2 border border-zinc-800 bg-zinc-950 text-[#F97316] rounded-sm mt-0.5">
              <CheckSquare size={14} />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-white uppercase mb-1">
                Duyệt xử lý yêu cầu
              </h4>
              <p className="text-[10px] text-zinc-400 leading-normal">
                Kiểm tra danh sách đơn hàng được gợi ý cần điều chỉnh hoặc hủy.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded-sm flex items-start gap-3">
            <div className="p-2 border border-zinc-800 bg-zinc-950 text-[#F97316] rounded-sm mt-0.5">
              <Database size={14} />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-white uppercase mb-1">
                Cập nhật kho hàng
              </h4>
              <p className="text-[10px] text-zinc-400 leading-normal">
                Theo dõi số lượng tồn kho sản phẩm chính xác theo thời gian thực.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Box Footer */}
      <div className="mt-8 pt-4 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500">
        <span>Hệ thống: CSMART_Admin</span>
        <span className="text-emerald-400 font-bold tracking-wider">ONLINE</span>
      </div>
    </div>
  );
}
