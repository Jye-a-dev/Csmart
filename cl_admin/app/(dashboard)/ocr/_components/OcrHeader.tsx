'use client';

import React from 'react';
import {
  ScanText,
  HelpCircle,
  RefreshCw,
  FileCheck,
  AlertCircle,
  TrendingUp,
  Receipt,
} from 'lucide-react';

interface OcrHeaderProps {
  totalScans: number;
  successRate: number;
  pendingReviewCount: number;
  onOpenUserGuide: () => void;
  onRefresh: () => void;
  onScrollToUploader: () => void;
}

export const OcrHeader: React.FC<OcrHeaderProps> = ({
  totalScans,
  successRate,
  pendingReviewCount,
  onOpenUserGuide,
  onRefresh,
  onScrollToUploader,
}) => {
  return (
    <div className="space-y-6 mb-8">
      {/* Top Title & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B]">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#F97316] text-[#09090B] border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B]">
            <ScanText size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono font-black text-2xl uppercase text-[#09090B]">
                OCR SCANNER & BÓC TÁCH CHỨNG TỪ
              </h1>
              <span className="bg-[#09090B] text-white font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                AI Powered
              </span>
            </div>
            <p className="font-mono text-xs text-zinc-600 mt-1">
              Trích xuất tự động thông tin từ Hóa đơn bán hàng, Mã vận chuyển (GHN, GHTK, ViettelPost) và Nhãn sản phẩm.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenUserGuide}
            className="flex items-center gap-2 bg-[#FAFAFA] text-[#09090B] font-mono font-bold text-xs px-4 py-2.5 uppercase border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all hover:bg-amber-100 cursor-pointer"
          >
            <HelpCircle size={16} className="text-[#F97316]" />
            Hướng dẫn cho Admin
          </button>
          
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 bg-white text-[#09090B] font-mono font-bold text-xs px-3 py-2.5 uppercase border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all hover:bg-zinc-100 cursor-pointer"
            title="Làm mới bảng dữ liệu"
          >
            <RefreshCw size={15} />
            Làm mới
          </button>

          <button
            onClick={onScrollToUploader}
            className="flex items-center gap-2 bg-[#F97316] text-white font-mono font-bold text-xs px-4 py-2.5 uppercase border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all hover:bg-orange-600 cursor-pointer"
          >
            <ScanText size={16} />
            + Quét ảnh mới
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-zinc-500 uppercase">TỔNG SỐ QUÉT</span>
            <Receipt size={18} className="text-zinc-700" />
          </div>
          <div className="font-mono font-black text-2xl text-[#09090B] mt-2">
            {totalScans} <span className="text-xs font-normal text-zinc-500">tài liệu</span>
          </div>
          <p className="font-mono text-[10px] text-emerald-600 font-bold mt-1">
            ↑ Tích hợp AI OCR Engine v2.0
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-zinc-500 uppercase">TỶ LỆ CHÍNH XÁC</span>
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <div className="font-mono font-black text-2xl text-emerald-600 mt-2">
            {successRate}%
          </div>
          <p className="font-mono text-[10px] text-zinc-500 font-medium mt-1">
            Điểm tin cậy trung bình {'>'} 85%
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-zinc-500 uppercase">CẦN XÁC NHẬN</span>
            <AlertCircle size={18} className="text-amber-500" />
          </div>
          <div className="font-mono font-black text-2xl text-amber-600 mt-2">
            {pendingReviewCount} <span className="text-xs font-normal text-zinc-500">chứng từ</span>
          </div>
          <p className="font-mono text-[10px] text-amber-700 font-bold mt-1">
            Confidence score {'<'} 75%
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-zinc-500 uppercase">TRẠNG THÁI AI</span>
            <FileCheck size={18} className="text-blue-600" />
          </div>
          <div className="font-mono font-black text-sm text-[#09090B] mt-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            ONLINE (FastAPI 8000)
          </div>
          <p className="font-mono text-[10px] text-zinc-500 font-medium mt-1">
            Engine: PaddleOCR / Tesseract
          </p>
        </div>
      </div>
    </div>
  );
};
