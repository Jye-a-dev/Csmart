'use client';

import { Users, UserPlus, RefreshCw, UserCheck, ShieldCheck } from 'lucide-react';

interface CustomersHeaderProps {
  loading: boolean;
  totalCount: number;
  activeCount: number;
  onRefresh: () => void;
  onCreateClick: () => void;
}

export default function CustomersHeader({
  loading,
  totalCount,
  activeCount,
  onRefresh,
  onCreateClick,
}: CustomersHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-4 border-[#09090B] bg-white p-6 md:p-8 shadow-[6px_6px_0px_0px_#09090B]">
      
      {/* Title & Stats */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 border-2 border-[#09090B] bg-[#F97316] text-white shadow-[2px_2px_0px_0px_#09090B]">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-mono font-black uppercase text-[#09090B] tracking-tight">
              Quản Lý Khách Hàng
            </h1>
            <p className="font-mono text-xs text-zinc-500 font-bold">
              Danh sách tài khoản người dùng & khách hàng trong hệ thống CSMART
            </p>
          </div>
        </div>

        {/* Quick Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 border-2 border-[#09090B] font-mono text-xs font-bold text-[#09090B]">
            <Users size={14} className="text-[#F97316]" />
            <span>Tổng số: <strong className="text-[#F97316]">{totalCount}</strong> người dùng</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border-2 border-[#09090B] font-mono text-xs font-bold text-emerald-700">
            <UserCheck size={14} />
            <span>Đang hoạt động: <strong>{activeCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn-brutal inline-flex items-center justify-center gap-2 bg-white text-[#09090B] font-mono font-bold text-xs px-4 py-3 uppercase cursor-pointer border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Tải Lại</span>
        </button>

        <button
          onClick={onCreateClick}
          className="btn-brutal inline-flex items-center justify-center gap-2 bg-[#F97316] text-[#09090B] font-mono font-black text-xs px-5 py-3 uppercase cursor-pointer border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          <UserPlus size={18} />
          <span>+ Thêm Khách Hàng</span>
        </button>
      </div>

    </div>
  );
}
