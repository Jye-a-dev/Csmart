'use client';

import React, { memo } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { OcrRecordItem } from './OcrRecordsTable';

interface OcrDeleteModalProps {
  isOpen: boolean;
  record: OcrRecordItem | null;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
}

const OcrDeleteModalComponent: React.FC<OcrDeleteModalProps> = ({
  isOpen,
  record,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 transition-opacity duration-150">
      <div className="bg-white border-4 border-[#09090B] shadow-[8px_8px_0px_0px_#09090B] w-full max-w-md overflow-hidden transform transition-all duration-150 scale-100">
        {/* Header */}
        <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#09090B]">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} />
            <h3 className="font-mono font-black text-base uppercase text-white">
              XÁC NHẬN XÓA BẢN GHI OCR
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-white bg-white text-[#09090B] hover:bg-zinc-200 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 font-mono text-xs text-[#09090B] space-y-4">
          <p className="font-bold text-sm">
            Bạn có chắc chắn muốn xóa bản ghi chứng từ OCR này khỏi hệ thống?
          </p>

          <div className="bg-zinc-100 border-2 border-[#09090B] p-3 space-y-1">
            <div>
              <span className="text-zinc-500">Mã chứng từ:</span>{' '}
              <strong className="text-[#09090B]">{record.order_code}</strong>
            </div>
            <div>
              <span className="text-zinc-500">Khách hàng:</span>{' '}
              <strong className="text-[#09090B]">{record.customer_name}</strong>
            </div>
            <div>
              <span className="text-zinc-500">Tổng tiền:</span>{' '}
              <strong className="text-[#F97316]">
                {record.total_amount.toLocaleString('vi-VN')} đ
              </strong>
            </div>
          </div>

          <p className="text-red-600 font-bold text-[11px]">
            ⚠️ Hành động này sẽ xóa dữ liệu bóc tách vĩnh viễn và không thể khôi phục lại!
          </p>
        </div>

        {/* Actions */}
        <div className="bg-[#FAFAFA] border-t-2 border-[#09090B] px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-[#FAFAFA] text-[#09090B] font-mono font-bold text-xs px-4 py-2 border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:bg-zinc-100 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => onConfirmDelete(record.id)}
            className="btn-brutal bg-red-600 text-white font-mono font-black text-xs px-5 py-2 uppercase border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:bg-red-700 cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            XÓA BẢN GHI
          </button>
        </div>
      </div>
    </div>
  );
};

export const OcrDeleteModal = memo(OcrDeleteModalComponent);
