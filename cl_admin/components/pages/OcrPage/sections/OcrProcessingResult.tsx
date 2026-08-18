'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Save,
  Copy,
  Check,
  Package,
  User,
  Phone,
  MapPin,
  DollarSign,
  FileText,
} from 'lucide-react';
import { OcrDocType } from './OcrUploaderSection';

export interface ExtractedItem {
  name: string;
  quantity: number;
  unit_price: number;
}

export interface OcrExtractedData {
  document_type: OcrDocType;
  order_code: string;
  tracking_number?: string;
  courier_name?: string;
  customer_name: string;
  phone_number: string;
  address: string;
  total_amount: number;
  confidence_score: number;
  execution_time_ms: number;
  image_url?: string;
  extracted_items: ExtractedItem[];
  raw_text_chunks: string[];
}

interface OcrProcessingResultProps {
  result: OcrExtractedData | null;
  onSaveRecord: (data: OcrExtractedData) => void;
}

export const OcrProcessingResult: React.FC<OcrProcessingResultProps> = ({
  result,
  onSaveRecord,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!result) return null;

  const isHighConfidence = result.confidence_score >= 0.8;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border-2 border-[#09090B] p-6 shadow-[4px_4px_0px_0px_#09090B] mb-8 animate-in fade-in duration-300">
      {/* Result Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#09090B] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 text-white border border-[#09090B]">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-mono font-black text-base uppercase text-[#09090B]">
              BƯỚC 2: KẾT QUẢ AI BÓC TÁCH TỰ ĐỘNG
            </h3>
            <p className="font-mono text-xs text-zinc-500">
              Kiểm tra thông tin trước khi nhấn lưu vào danh sách hệ thống
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 border-2 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#09090B] ${
            isHighConfidence
              ? 'bg-emerald-100 text-emerald-900 border-emerald-500'
              : 'bg-amber-100 text-amber-900 border-amber-500'
          }`}
        >
          {isHighConfidence ? (
            <CheckCircle2 size={16} className="text-emerald-600" />
          ) : (
            <AlertTriangle size={16} className="text-amber-600" />
          )}
          <span>
            ĐỘ TỰ TIN: {Math.round(result.confidence_score * 100)}%
          </span>
          <span className="text-[10px] opacity-75 font-normal">
            ({result.execution_time_ms}ms)
          </span>
        </div>
      </div>

      {/* Grid Display of Extracted Metadata - Custom Layouts for 3 Distinct Doc Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Field 1: Code */}
        <div className="bg-[#FAFAFA] border-2 border-[#09090B] p-3 shadow-[2px_2px_0px_0px_#09090B]">
          <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] font-bold uppercase mb-1">
            <FileText size={14} className="text-[#F97316]" />
            {result.document_type === 'INVOICE'
              ? 'MÃ HÓA ĐƠN BÁN HÀNG'
              : result.document_type === 'SHIPPING_LABEL'
              ? 'MÃ VẬN ĐƠN (TRACKING)'
              : 'MÃ SẢN PHẨM / SKU'}
          </div>
          <div className="font-mono font-black text-sm text-[#09090B]">
            {result.order_code || result.tracking_number || 'N/A'}
          </div>
          {result.courier_name && (
            <span className="inline-block mt-1 font-mono text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 border border-blue-300 font-bold">
              {result.courier_name}
            </span>
          )}
        </div>

        {/* Field 2: Name / Customer */}
        <div className="bg-[#FAFAFA] border-2 border-[#09090B] p-3 shadow-[2px_2px_0px_0px_#09090B]">
          <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] font-bold uppercase mb-1">
            <User size={14} className="text-blue-600" />
            {result.document_type === 'INVOICE'
              ? 'KHÁCH HÀNG MUA HÀNG'
              : result.document_type === 'SHIPPING_LABEL'
              ? 'NGƯỜI NHẬN BƯU GỬI'
              : 'TÊN SẢN PHẨM / THƯƠNG HIỆU'}
          </div>
          <div className="font-mono font-black text-sm text-[#09090B]">
            {result.customer_name || 'Không xác định'}
          </div>
        </div>

        {/* Field 3: Phone / Serial */}
        <div className="bg-[#FAFAFA] border-2 border-[#09090B] p-3 shadow-[2px_2px_0px_0px_#09090B]">
          <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] font-bold uppercase mb-1">
            <Phone size={14} className="text-emerald-600" />
            {result.document_type === 'PRODUCT_LABEL' ? 'SỐ SERIAL (SN)' : 'SỐ ĐIỆN THOẠI'}
          </div>
          <div className="font-mono font-black text-sm text-[#09090B]">
            {result.document_type === 'PRODUCT_LABEL'
              ? result.tracking_number || 'SN-2026-CSMART'
              : result.phone_number || 'N/A'}
          </div>
        </div>

        {/* Field 4: Address / Location */}
        <div className="bg-[#FAFAFA] border-2 border-[#09090B] p-3 shadow-[2px_2px_0px_0px_#09090B] md:col-span-2">
          <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] font-bold uppercase mb-1">
            <MapPin size={14} className="text-purple-600" />
            {result.document_type === 'INVOICE'
              ? 'ĐỊA CHỈ XUẤT HÓA ĐƠN'
              : result.document_type === 'SHIPPING_LABEL'
              ? 'ĐỊA CHỈ GIAO BƯU GỬI'
              : 'NƠI SẢN XUẤT / KHO TỔNG'}
          </div>
          <div className="font-mono font-bold text-xs text-[#09090B] line-clamp-2">
            {result.address || 'N/A'}
          </div>
        </div>

        {/* Field 5: Amount / Price */}
        <div className="bg-[#FAFAFA] border-2 border-[#09090B] p-3 shadow-[2px_2px_0px_0px_#09090B]">
          <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] font-bold uppercase mb-1">
            <DollarSign size={14} className="text-amber-600" />
            {result.document_type === 'SHIPPING_LABEL'
              ? 'TIỀN THU HỘ (COD)'
              : result.document_type === 'PRODUCT_LABEL'
              ? 'ĐƠN GIÁ NIÊM YẾT'
              : 'TỔNG TIỀN HÓA ĐƠN'}
          </div>
          <div className="font-mono font-black text-lg text-[#F97316]">
            {result.total_amount.toLocaleString('vi-VN')} đ
          </div>
        </div>
      </div>

      {/* Extracted Items Table */}
      {result.extracted_items && result.extracted_items.length > 0 && (
        <div className="mb-6">
          <h4 className="font-mono text-xs font-bold text-[#09090B] uppercase mb-2 flex items-center gap-2">
            <Package size={15} className="text-[#F97316]" />
            DANH SÁCH MÓN HÀNG AI TRÍCH XUẤT ĐƯỢC:
          </h4>
          <div className="overflow-x-auto border-2 border-[#09090B]">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-[#09090B] text-white font-bold uppercase">
                  <th className="p-2.5 border-r border-zinc-700">TÊN SẢN PHẨM</th>
                  <th className="p-2.5 border-r border-zinc-700 w-24 text-center">SL</th>
                  <th className="p-2.5 border-r border-zinc-700 w-36 text-right">ĐƠN GIÁ</th>
                  <th className="p-2.5 w-36 text-right">THÀNH TIỀN</th>
                </tr>
              </thead>
              <tbody className="divide-y border-t border-[#09090B]">
                {result.extracted_items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50">
                    <td className="p-2.5 font-bold text-[#09090B] border-r border-[#09090B]">
                      {item.name}
                    </td>
                    <td className="p-2.5 font-bold text-center border-r border-[#09090B]">
                      {item.quantity}
                    </td>
                    <td className="p-2.5 text-right border-r border-[#09090B]">
                      {item.unit_price.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-2.5 text-right font-black text-[#F97316]">
                      {(item.quantity * item.unit_price).toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raw Chunks Snippet */}
      <div className="mb-6 bg-zinc-900 text-zinc-200 p-3 border-2 border-[#09090B] font-mono text-[11px]">
        <div className="flex items-center justify-between text-zinc-400 font-bold uppercase mb-1">
          <span>VĂN BẢN THÔ QUÉT ĐƯỢC (RAW CHUNKS):</span>
          <span>{result.raw_text_chunks.length} dòng</span>
        </div>
        <div className="max-h-24 overflow-y-auto space-y-0.5 text-emerald-400 font-mono">
          {result.raw_text_chunks.map((chunk, idx) => (
            <div key={idx} className="truncate">
              [{idx + 1}] {chunk}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t-2 border-[#09090B]">
        <button
          onClick={handleCopyJson}
          className="flex items-center gap-2 bg-[#FAFAFA] text-[#09090B] font-mono font-bold text-xs px-4 py-2.5 uppercase border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
        >
          {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
          {copied ? 'Đã sao chép JSON' : 'Sao chép JSON'}
        </button>

        <button
          onClick={() => onSaveRecord(result)}
          className="btn-brutal flex items-center gap-2 bg-emerald-600 text-white font-mono font-black text-xs px-6 py-2.5 uppercase border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all hover:bg-emerald-700 cursor-pointer"
        >
          <Save size={16} />
          LƯU VÀO DANH SÁCH QUẢN LÝ (CRUD)
        </button>
      </div>
    </div>
  );
};
