'use client';

import React from 'react';
import { OcrRecordItem } from '../OcrRecordsTable';
import { OcrDocType } from '../OcrUploaderSection';

interface OcrRecordModalFormFieldsProps {
  formData: Partial<OcrRecordItem>;
  isViewOnly: boolean;
  onUpdateFormData: (patch: Partial<OcrRecordItem>) => void;
}

export function OcrRecordModalFormFields({
  formData,
  isViewOnly,
  onUpdateFormData,
}: OcrRecordModalFormFieldsProps) {
  return (
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
          {/* Order Code / SKU */}
          <div>
            <label className="block font-bold uppercase mb-1">
              {formData.document_type === 'PRODUCT_LABEL' ? 'MÃ SẢN PHẨM / SKU:' : 'MÃ ĐƠN HÀNG:'}
            </label>
            <input
              type="text"
              disabled={isViewOnly}
              value={formData.order_code || ''}
              onChange={(e) => onUpdateFormData({ order_code: e.target.value })}
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
              onChange={(e) => onUpdateFormData({ document_type: e.target.value as OcrDocType })}
              className="w-full p-2 border-2 border-[#09090B] font-bold bg-white focus:outline-none disabled:bg-zinc-100"
            >
              <option value="INVOICE">Hóa đơn bán hàng</option>
              <option value="SHIPPING_LABEL">Mã vận đơn (Shipping)</option>
              <option value="PRODUCT_LABEL">Nhãn sản phẩm</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Customer Name / Product Name */}
          <div>
            <label className="block font-bold uppercase mb-1">
              {formData.document_type === 'PRODUCT_LABEL' ? 'TÊN SẢN PHẨM:' : 'KHÁCH HÀNG / NGƯỜI NHẬN:'}
            </label>
            <input
              type="text"
              disabled={isViewOnly}
              value={formData.customer_name || ''}
              onChange={(e) => onUpdateFormData({ customer_name: e.target.value })}
              className="w-full p-2 border-2 border-[#09090B] font-bold bg-white focus:outline-none disabled:bg-zinc-100"
            />
          </div>

          {/* Phone Number / Origin */}
          <div>
            <label className="block font-bold uppercase mb-1">
              {formData.document_type === 'PRODUCT_LABEL' ? 'NGUỒN GỐC / XUẤT XỨ:' : 'SỐ ĐIỆN THOẠI:'}
            </label>
            <input
              type="text"
              disabled={isViewOnly}
              value={
                formData.document_type === 'PRODUCT_LABEL'
                  ? (formData.extracted_items?.[0]?.origin || formData.phone_number || 'Việt Nam')
                  : (formData.phone_number || '')
              }
              onChange={(e) => {
                const val = e.target.value;
                if (formData.document_type === 'PRODUCT_LABEL') {
                  const items = [...(formData.extracted_items || [])];
                  if (items[0]) items[0] = { ...items[0], origin: val };
                  onUpdateFormData({ phone_number: val, extracted_items: items });
                } else {
                  onUpdateFormData({ phone_number: val });
                }
              }}
              className="w-full p-2 border-2 border-[#09090B] font-bold bg-white focus:outline-none disabled:bg-zinc-100"
            />
          </div>
        </div>

        {/* Address / Type & Color Fields */}
        {formData.document_type === 'PRODUCT_LABEL' ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase mb-1">LOẠI SẢN PHẨM:</label>
              <input
                type="text"
                disabled={isViewOnly}
                value={formData.extracted_items?.[0]?.type || 'Áo'}
                onChange={(e) => {
                  const val = e.target.value;
                  const items = [...(formData.extracted_items || [])];
                  if (items[0]) items[0] = { ...items[0], type: val };
                  onUpdateFormData({ extracted_items: items });
                }}
                className="w-full p-2 border-2 border-[#09090B] font-bold bg-white focus:outline-none disabled:bg-zinc-100"
              />
            </div>
            <div>
              <label className="block font-bold uppercase mb-1">MÀU SẮC:</label>
              <input
                type="text"
                disabled={isViewOnly}
                value={formData.extracted_items?.[0]?.color || 'Đen'}
                onChange={(e) => {
                  const val = e.target.value;
                  const items = [...(formData.extracted_items || [])];
                  if (items[0]) items[0] = { ...items[0], color: val };
                  onUpdateFormData({ extracted_items: items });
                }}
                className="w-full p-2 border-2 border-[#09090B] font-bold bg-white focus:outline-none disabled:bg-zinc-100"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block font-bold uppercase mb-1">ĐỊA CHỈ GIAO HÀNG:</label>
            <textarea
              rows={2}
              disabled={isViewOnly}
              value={formData.address || ''}
              onChange={(e) => onUpdateFormData({ address: e.target.value })}
              className="w-full p-2 border-2 border-[#09090B] font-bold bg-white focus:outline-none disabled:bg-zinc-100"
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {/* Total Amount / Price */}
          <div>
            <label className="block font-bold uppercase mb-1">
              {formData.document_type === 'PRODUCT_LABEL' ? 'ĐƠN GIÁ NIÊM YẾT:' : 'TỔNG TIỀN (VNĐ):'}
            </label>
            <input
              type="number"
              disabled={isViewOnly}
              value={formData.total_amount || 0}
              onChange={(e) => onUpdateFormData({ total_amount: parseFloat(e.target.value) || 0 })}
              className="w-full p-2 border-2 border-[#09090B] font-bold text-[#F97316] bg-white focus:outline-none disabled:bg-zinc-100"
            />
          </div>

          {/* Confidence Score */}
          <div>
            <label className="block font-bold uppercase mb-1">ĐỘ TỰ TIN (0–1):</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              disabled={isViewOnly}
              value={formData.confidence_score ?? 0.95}
              onChange={(e) =>
                onUpdateFormData({
                  confidence_score: Math.min(1, Math.max(0, parseFloat(e.target.value) || 0)),
                })
              }
              className="w-full p-2 border-2 border-[#09090B] font-bold text-emerald-700 bg-white focus:outline-none disabled:bg-zinc-100"
            />
            {!isViewOnly && (
              <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">≥ 0.8 = ĐÃ XÁC MINH</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block font-bold uppercase mb-1">TRẠNG THÁI VERIFY:</label>
            <select
              disabled={isViewOnly}
              value={formData.status || 'VERIFIED'}
              onChange={(e) =>
                onUpdateFormData({
                  status: e.target.value as 'VERIFIED' | 'NEEDS_REVIEW',
                })
              }
              className="w-full p-2 border-2 border-[#09090B] font-bold bg-white focus:outline-none disabled:bg-zinc-100"
            >
              <option value="VERIFIED">Đã xác minh (Verified)</option>
              <option value="NEEDS_REVIEW">Cần rà soát (Needs Review)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

