'use client';

import React, { useState, memo } from 'react';
import { X, Save, Eye, Edit3 } from 'lucide-react';
import { OcrRecordItem } from './OcrRecordsTable';
import { ExtractedItem } from './OcrProcessingResult';
import { OcrRecordModalFormFields, OcrRecordModalItemsTable } from './record-modal';

interface OcrRecordModalProps {
  isOpen: boolean;
  mode: 'VIEW' | 'EDIT' | 'CREATE';
  record: OcrRecordItem | null;
  onClose: () => void;
  onSave: (recordData: Partial<OcrRecordItem>) => void;
}

const DEFAULT_RECORD_FORM: Partial<OcrRecordItem> = {
  order_code: 'ORD-OCR-NEW',
  tracking_number: '',
  document_type: 'INVOICE',
  customer_name: '',
  phone_number: '',
  address: '',
  total_amount: 0,
  confidence_score: 0.95,
  status: 'VERIFIED',
  notes: '',
  extracted_items: [],
};

const OcrRecordModalComponent: React.FC<OcrRecordModalProps> = ({
  isOpen,
  mode,
  record,
  onClose,
  onSave,
}) => {
  const [prevRecord, setPrevRecord] = useState<OcrRecordItem | null>(null);
  const [formData, setFormData] = useState<Partial<OcrRecordItem>>(() => record ?? DEFAULT_RECORD_FORM);

  // Synchronize state during render when record prop changes
  if (record !== prevRecord) {
    setPrevRecord(record);
    setFormData(record ?? DEFAULT_RECORD_FORM);
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const calculateTotalAmount = (items: ExtractedItem[]): number => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0);
  };

  const handleAddItem = () => {
    setFormData((prev) => {
      const updatedItems = [
        ...(prev.extracted_items || []),
        { name: 'Sản phẩm mới', quantity: 1, unit_price: 100000 },
      ];
      return {
        ...prev,
        extracted_items: updatedItems,
        total_amount: calculateTotalAmount(updatedItems),
      };
    });
  };

  const handleRemoveItem = (idx: number) => {
    setFormData((prev) => {
      const updatedItems = (prev.extracted_items || []).filter((_, i) => i !== idx);
      return {
        ...prev,
        extracted_items: updatedItems,
        total_amount: calculateTotalAmount(updatedItems),
      };
    });
  };

  const handleItemChange = (idx: number, field: keyof ExtractedItem, value: string | number) => {
    setFormData((prev) => {
      const updatedItems = [...(prev.extracted_items || [])];
      updatedItems[idx] = { ...updatedItems[idx], [field]: value };
      return {
        ...prev,
        extracted_items: updatedItems,
        total_amount: calculateTotalAmount(updatedItems),
      };
    });
  };

  const isViewOnly = mode === 'VIEW';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 transition-opacity duration-150">
      <div className="bg-white border-4 border-[#09090B] shadow-[8px_8px_0px_0px_#09090B] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-150 scale-100">
        {/* Modal Header */}
        <div className="bg-[#09090B] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#F97316] text-[#09090B] border border-white">
              {mode === 'VIEW' ? <Eye size={18} /> : <Edit3 size={18} />}
            </div>
            <div>
              <h2 className="font-mono font-black text-base uppercase tracking-tight text-[#FAFAFA]">
                {mode === 'VIEW' && 'CHI TIẾT BẢN GHI OCR'}
                {mode === 'EDIT' && 'CẬP NHẬT DỮ LIỆU BÓC TÁCH OCR'}
                {mode === 'CREATE' && 'TẠO MỚI BẢN GHI OCR'}
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                Mã chứng từ: {formData.order_code || 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-white bg-white text-[#09090B] hover:bg-[#F97316] hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form / Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 font-mono text-xs text-[#09090B]">
          {/* Sub-component 1: Form Fields */}
          <OcrRecordModalFormFields
            formData={formData}
            isViewOnly={isViewOnly}
            onUpdateFormData={(patch) => setFormData((prev) => ({ ...prev, ...patch }))}
          />

          {/* Sub-component 2: Items Table */}
          <OcrRecordModalItemsTable
            items={formData.extracted_items || []}
            isViewOnly={isViewOnly}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onItemChange={handleItemChange}
          />

          {/* Modal Footer Controls */}
          <div className="border-t-2 border-[#09090B] pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#FAFAFA] text-[#09090B] font-bold text-xs px-5 py-2 border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:bg-zinc-100 cursor-pointer"
            >
              {isViewOnly ? 'Đóng' : 'Hủy bỏ'}
            </button>

            {!isViewOnly && (
              <button
                type="submit"
                className="btn-brutal bg-[#F97316] text-white font-black text-xs px-6 py-2 border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:bg-orange-600 cursor-pointer flex items-center gap-2"
              >
                <Save size={15} />
                LƯU THAY ĐỔI
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export const OcrRecordModal = memo(OcrRecordModalComponent);
