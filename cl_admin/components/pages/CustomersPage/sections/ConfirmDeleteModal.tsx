'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác Nhận Xóa Khách Hàng',
  description = 'Bạn có chắc chắn muốn xóa khách hàng này khỏi hệ thống? Hành động này không thể hoàn tác.',
  loading = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md border-4 border-[#09090B] bg-white shadow-[8px_8px_0px_0px_#09090B]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b-4 border-[#09090B] bg-rose-500 text-white">
          <div className="flex items-center gap-2">
            <AlertTriangle size={22} className="text-amber-200" />
            <h3 className="font-mono font-black text-base uppercase tracking-tight text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 border-2 border-[#09090B] bg-white text-[#09090B] hover:bg-zinc-100 disabled:opacity-50 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 font-mono">
          <p className="text-xs font-bold text-[#09090B] leading-relaxed">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#09090B]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border-2 border-[#09090B] bg-white text-[#09090B] text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-5 py-2 border-2 border-[#09090B] bg-rose-500 text-white text-xs font-black uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Đang Xóa...' : 'Đồng Ý Xóa'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
