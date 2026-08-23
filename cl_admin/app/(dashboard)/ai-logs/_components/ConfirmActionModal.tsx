'use client';

import { useState } from 'react';
import { X, AlertTriangle, Trash2, CheckCircle } from 'lucide-react';

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  variant = 'danger',
}: ConfirmActionModalProps) {
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

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-rose-100 text-rose-600',
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white',
          Icon: AlertTriangle,
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-100 text-amber-700',
          btnBg: 'bg-amber-500 hover:bg-amber-600 text-[#09090B]',
          Icon: AlertTriangle,
        };
      case 'primary':
        return {
          iconBg: 'bg-blue-100 text-blue-700',
          btnBg: 'bg-[#F97316] hover:bg-amber-500 text-[#09090B]',
          Icon: CheckCircle,
        };
    }
  };

  const v = getVariantStyles();
  const Icon = v.Icon;

  return (
    <div className="fixed inset-0 bg-[#09090B]/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-[#09090B] w-full max-w-md p-6 shadow-[8px_8px_0px_0px_#09090B] relative font-mono text-xs">
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 p-1.5 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:bg-zinc-100 transition-all cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 border-b-2 border-[#09090B] pb-3 mb-4">
          <div className={`p-2 border-2 border-[#09090B] ${v.iconBg} shadow-[2px_2px_0px_0px_#09090B]`}>
            <Icon size={20} />
          </div>
          <h2 className="text-base font-extrabold uppercase text-[#09090B]">
            {title}
          </h2>
        </div>

        <p className="text-xs font-sans text-zinc-700 leading-relaxed mb-6 bg-zinc-50 border-2 border-dashed border-[#09090B]/20 p-3">
          {message}
        </p>

        <div className="flex justify-end gap-3 border-t-2 border-[#09090B] pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border-2 border-[#09090B] bg-white text-[#09090B] font-mono text-xs font-black uppercase hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirmAction}
            disabled={submitting}
            className={`px-4 py-2 border-2 border-[#09090B] ${v.btnBg} font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50`}
          >
            <Trash2 size={14} />
            {submitting ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
