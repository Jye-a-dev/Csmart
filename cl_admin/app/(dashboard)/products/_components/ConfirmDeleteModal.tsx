'use client';

import { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  message?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'XÁC NHẬN XÓA DANH MỤC',
  message = 'Bạn có chắc chắn muốn xóa danh mục này? Tất cả sản phẩm thuộc danh mục này sẽ mất phân loại.'
}: ConfirmDeleteModalProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmAction = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#09090B]/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-[#09090B] w-full max-w-md p-6 shadow-[8px_8px_0px_0px_#09090B] relative">
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 p-1.5 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:bg-zinc-100 transition-all"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 border-b-2 border-[#09090B] pb-3 mb-4">
          <div className="p-2 border-2 border-[#09090B] bg-rose-100 text-rose-600 shadow-[2px_2px_0px_0px_#09090B]">
            <AlertTriangle size={20} />
          </div>
          <h2 className="text-lg font-extrabold uppercase text-[#09090B]">
            {title}
          </h2>
        </div>

        <p className="text-sm font-sans text-zinc-600 leading-relaxed mb-6 bg-zinc-50 border-2 border-dashed border-[#09090B]/20 p-3">
          {message}
        </p>

        <div className="flex justify-end gap-3 border-t-2 border-[#09090B] pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border-2 border-[#09090B] bg-white text-[#09090B] font-mono text-xs font-bold uppercase hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirmAction}
            disabled={submitting}
            className="px-4 py-2 border-2 border-[#09090B] bg-rose-600 text-white font-mono text-xs font-bold uppercase hover:bg-rose-700 shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            {submitting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}
