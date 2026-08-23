'use client';

import { Plus, RefreshCw } from 'lucide-react';

interface OrdersHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onCreateClick: () => void;
}

export default function OrdersHeader({
  loading,
  onRefresh,
  onCreateClick
}: OrdersHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">
          Quản Lý Đơn Hàng
        </h1>
        <p className="text-zinc-500 font-mono text-xs mt-1">
          Xem, tạo mới, chỉnh sửa trạng thái và quản lý danh sách đơn hàng vận hành hệ thống.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onRefresh}
          className="p-3 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          title="Đồng bộ dữ liệu"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
        <button
          onClick={onCreateClick}
          className="px-5 py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-bold uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus size={16} />
          Tạo Đơn Hàng Mới
        </button>
      </div>
    </div>
  );
}
