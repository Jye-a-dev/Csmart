'use client';

import React, { useState, memo } from 'react';
import {
  X,
  Save,
  Eye,
  Edit3,
  Plus,
  Trash2,
  Package,
} from 'lucide-react';
import { OcrRecordItem } from './OcrRecordsTable';
import { OcrDocType } from './OcrUploaderSection';
import { ExtractedItem } from './OcrProcessingResult';

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

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      extracted_items: [
        ...(prev.extracted_items || []),
        { name: 'Sản phẩm mới', quantity: 1, unit_price: 100000 },
      ],
    }));
  };

  const handleRemoveItem = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      extracted_items: (prev.extracted_items || []).filter((_, i) => i !== idx),
    }));
  };

  const handleItemChange = (idx: number, field: keyof ExtractedItem, value: string | number) => {
    setFormData((prev) => {
      const updated = [...(prev.extracted_items || [])];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, extracted_items: updated };
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Image View Box */}
            <div className="md:col-span-5 bg-zinc-900 border-2 border-[#09090B] p-2 flex flex-col items-center justify-center min-h-70">
              {formData.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={formData.image_url}
                  alt="OCR Document"
                  className="max-h-90 w-auto object-contain border border-zinc-700"
                />
              ) : (
                <div className="text-zinc-500 font-mono text-xs text-center p-4">
                  Không có hình ảnh đính kèm
                </div>
              )}
            </div>

            {/* Right Data Form Fields */}
            <div className="md:col-span-7 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Order Code */}
                <div>
                  <label className="block font-bold uppercase mb-1">MÃ ĐƠN HÀNG:</label>
                  <input
                    type="text"
                    disabled={isViewOnly}
                    value={formData.order_code || ''}
                    onChange={(e) => setFormData({ ...formData, order_code: e.target.value })}
                    className="w-full p-2 border-2 border-[#09090B] font-bold bg-white focus:outline-none disabled:bg-zinc-100"
                    required
                  />
                </div>

                {/* Doc Type */}
                <div>
                  <label className="block font-bold uppercase mb-1">LOẠI CHỨNG TỪ:</label>
                  <select
                    disabled={isViewOnly}
                    value={formData.document_type || 'INVOICE'}
                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value as OcrDocType })}
                    className="w-full p-2 border-2 border-[#09090B] font-bold bg-white focus:outline-none disabled:bg-zinc-100"
                  >
                    <option value="INVOICE">Hóa đơn bán hàng</option>
                    <option value="SHIPPING_LABEL">Mã vận đơn (Shipping)</option>
                    <option value="PRODUCT_LABEL">Nhãn sản phẩm</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Customer Name */}
                <div>
                  <label className="block font-bold uppercase mb-1">KHÁCH HÀNG / NGƯỜI NHẬN:</label>
                  <input
                    type="text"
                    disabled={isViewOnly}
                    value={formData.customer_name || ''}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full p-2 border-2 border-[#09090B] font-bold bg-white focus:outline-none disabled:bg-zinc-100"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block font-bold uppercase mb-1">SỐ ĐIỆN THOẠI:</label>
                  <input
                    type="text"
                    disabled={isViewOnly}
                    value={formData.phone_number || ''}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full p-2 border-2 border-[#09090B] font-bold bg-white focus:outline-none disabled:bg-zinc-100"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block font-bold uppercase mb-1">ĐỊA CHỈ GIAO HÀNG:</label>
                <textarea
                  rows={2}
                  disabled={isViewOnly}
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border-2 border-[#09090B] font-bold bg-white focus:outline-none disabled:bg-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Total Amount */}
                <div>
                  <label className="block font-bold uppercase mb-1">TỔNG TIỀN (VNĐ):</label>
                  <input
                    type="number"
                    disabled={isViewOnly}
                    value={formData.total_amount || 0}
                    onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border-2 border-[#09090B] font-bold text-[#F97316] bg-white focus:outline-none disabled:bg-zinc-100"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block font-bold uppercase mb-1">TRẠNG THÁI VERIFY:</label>
                  <select
                    disabled={isViewOnly}
                    value={formData.status || 'VERIFIED'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'VERIFIED' | 'NEEDS_REVIEW' })}
                    className="w-full p-2 border-2 border-[#09090B] font-bold bg-white focus:outline-none disabled:bg-zinc-100"
                  >
                    <option value="VERIFIED">Đã xác minh (Verified)</option>
                    <option value="NEEDS_REVIEW">Cần rà soát (Needs Review)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Extracted Items Section */}
          <div className="border-t-2 border-[#09090B] pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold uppercase flex items-center gap-2">
                <Package size={16} className="text-[#F97316]" />
                DANH SÁCH MÓN HÀNG TRÍCH XUẤT:
              </h4>
              {!isViewOnly && (
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 bg-[#FAFAFA] text-[#09090B] font-bold text-[11px] px-2.5 py-1 border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:bg-amber-100 cursor-pointer"
                >
                  <Plus size={12} /> Thêm dòng
                </button>
              )}
            </div>

            <div className="overflow-x-auto border-2 border-[#09090B]">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-[#09090B] text-white font-bold uppercase">
                    <th className="p-2 border-r border-zinc-700">TÊN SẢN PHẨM</th>
                    <th className="p-2 border-r border-zinc-700 w-20 text-center">SL</th>
                    <th className="p-2 border-r border-zinc-700 w-32 text-right">ĐƠN GIÁ</th>
                    {!isViewOnly && <th className="p-2 w-12 text-center">XÓA</th>}
                  </tr>
                </thead>
                <tbody className="divide-y border-t border-[#09090B]">
                  {formData.extracted_items && formData.extracted_items.length > 0 ? (
                    formData.extracted_items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-1.5 border-r border-[#09090B]">
                          <input
                            type="text"
                            disabled={isViewOnly}
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                            className="w-full p-1 border border-zinc-300 font-bold bg-white disabled:bg-transparent disabled:border-none"
                          />
                        </td>
                        <td className="p-1.5 border-r border-[#09090B]">
                          <input
                            type="number"
                            disabled={isViewOnly}
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full p-1 border border-zinc-300 text-center font-bold bg-white disabled:bg-transparent disabled:border-none"
                          />
                        </td>
                        <td className="p-1.5 border-r border-[#09090B]">
                          <input
                            type="number"
                            disabled={isViewOnly}
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-full p-1 border border-zinc-300 text-right font-bold bg-white disabled:bg-transparent disabled:border-none"
                          />
                        </td>
                        {!isViewOnly && (
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-zinc-400">
                        Chưa có sản phẩm nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

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
