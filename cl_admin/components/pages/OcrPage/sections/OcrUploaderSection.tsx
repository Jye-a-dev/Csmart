'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  FileText,
  Truck,
  Tag,
  Check,
} from 'lucide-react';

export type OcrDocType = 'INVOICE' | 'SHIPPING_LABEL' | 'PRODUCT_LABEL';

export interface SampleImage {
  id: string;
  name: string;
  type: OcrDocType;
  url: string;
  description: string;
}

interface OcrUploaderSectionProps {
  onProcessOcr: (fileOrUrl: string, docType: OcrDocType) => void;
  isProcessing: boolean;
}

const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sample-inv-1',
    name: 'Hóa đơn mua sắm SmartCart #INV-889',
    type: 'INVOICE',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    description: 'Hóa đơn thanh toán cửa hàng gồm Tên KH, SĐT, Sản phẩm & Tổng tiền',
  },
  {
    id: 'sample-ship-1',
    name: 'Nhãn vận đơn Giao Hàng Nhanh #GHN-99823',
    type: 'SHIPPING_LABEL',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    description: 'Phiếu giao hàng bưu gửi có Mã vận đơn, Người nhận & Địa chỉ',
  },
  {
    id: 'sample-prod-1',
    name: 'Nhãn thông số thiết bị công nghệ',
    type: 'PRODUCT_LABEL',
    url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
    description: 'Nhãn thông số kỹ thuật, Thương hiệu & Serial Number',
  },
];

export const OcrUploaderSection: React.FC<OcrUploaderSectionProps> = ({
  onProcessOcr,
  isProcessing,
}) => {
  const [docType, setDocType] = useState<OcrDocType>('INVOICE');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(SAMPLE_IMAGES[0].url);
  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImageUrl(event.target.result as string);
          setRotation(0);
          setZoom(1);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: SampleImage) => {
    setSelectedImageUrl(sample.url);
    setDocType(sample.type);
    setRotation(0);
    setZoom(1);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handleStartOcr = () => {
    if (!selectedImageUrl) return;
    onProcessOcr(selectedImageUrl, docType);
  };

  return (
    <div id="ocr-uploader" className="bg-white border-2 border-[#09090B] p-6 shadow-[4px_4px_0px_0px_#09090B] mb-8">
      <div className="flex items-center justify-between border-b-2 border-[#09090B] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#09090B] text-[#F97316]">
            <Upload size={20} />
          </div>
          <div>
            <h2 className="font-mono font-black text-base uppercase text-[#09090B]">
              BƯỚC 1: TẢI ẢNH CHỨNG TỪ HOẶC CHỌN MẪU DÙNG THỬ
            </h2>
            <p className="font-mono text-xs text-zinc-500">
              Chọn ảnh hóa đơn / mã vận đơn cần bóc tách thông tin tự động bằng AI OCR Engine
            </p>
          </div>
        </div>
      </div>

      {/* Doc Type Selector */}
      <div className="mb-6">
        <label className="block font-mono text-xs font-bold text-[#09090B] uppercase mb-2">
          LOẠI TÀI LIỆU CẦN BÓC TÁCH:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setDocType('INVOICE')}
            className={`flex items-center gap-3 p-3 font-mono text-xs font-bold border-2 transition-all cursor-pointer ${
              docType === 'INVOICE'
                ? 'bg-[#F97316] text-white border-[#09090B] shadow-[3px_3px_0px_0px_#09090B]'
                : 'bg-white text-[#09090B] border-[#09090B] hover:bg-zinc-50'
            }`}
          >
            <FileText size={18} />
            <span>HÓA ĐƠN BÁN HÀNG</span>
          </button>

          <button
            type="button"
            onClick={() => setDocType('SHIPPING_LABEL')}
            className={`flex items-center gap-3 p-3 font-mono text-xs font-bold border-2 transition-all cursor-pointer ${
              docType === 'SHIPPING_LABEL'
                ? 'bg-[#F97316] text-white border-[#09090B] shadow-[3px_3px_0px_0px_#09090B]'
                : 'bg-white text-[#09090B] border-[#09090B] hover:bg-zinc-50'
            }`}
          >
            <Truck size={18} />
            <span>MÃ VẬN ĐƠN (GHN/GHTK)</span>
          </button>

          <button
            type="button"
            onClick={() => setDocType('PRODUCT_LABEL')}
            className={`flex items-center gap-3 p-3 font-mono text-xs font-bold border-2 transition-all cursor-pointer ${
              docType === 'PRODUCT_LABEL'
                ? 'bg-[#F97316] text-white border-[#09090B] shadow-[3px_3px_0px_0px_#09090B]'
                : 'bg-white text-[#09090B] border-[#09090B] hover:bg-zinc-50'
            }`}
          >
            <Tag size={18} />
            <span>NHÃN SẢN PHẨM</span>
          </button>
        </div>
      </div>

      {/* Main Upload Dropzone & Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Image Preview Box */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="relative flex-1 min-h-80 bg-zinc-900 border-2 border-[#09090B] flex items-center justify-center overflow-hidden p-4">
            {selectedImageUrl ? (
              <div className="relative max-w-full max-h-90 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImageUrl}
                  alt="OCR Preview"
                  className="max-h-85 w-auto object-contain transition-transform duration-200"
                  style={{
                    transform: `rotate(${rotation}deg) scale(${zoom})`,
                  }}
                />
              </div>
            ) : (
              <div className="text-center text-zinc-400 font-mono text-xs p-8">
                <ImageIcon size={48} className="mx-auto mb-3 text-zinc-600" />
                <p>Chưa có hình ảnh nào được chọn</p>
              </div>
            )}

            {/* Controls overlay */}
            {selectedImageUrl && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#09090B]/90 text-white p-1.5 border border-white">
                <button
                  onClick={handleRotate}
                  className="p-1.5 hover:bg-white/20 transition-colors cursor-pointer"
                  title="Xoay ảnh 90 độ"
                >
                  <RotateCw size={14} />
                </button>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-white/20 transition-colors cursor-pointer"
                  title="Phóng to"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-white/20 transition-colors cursor-pointer"
                  title="Thu nhỏ"
                >
                  <ZoomOut size={14} />
                </button>
              </div>
            )}
          </div>

          {/* File Picker trigger */}
          <div className="mt-3 flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-brutal flex-1 flex items-center justify-center gap-2 bg-[#FAFAFA] text-[#09090B] font-mono font-bold text-xs py-2.5 px-4 border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            >
              <Upload size={15} />
              Chọn ảnh từ máy tính (JPG, PNG)
            </button>
          </div>
        </div>

        {/* Sample Selection Column & Action */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold text-[#09090B] uppercase mb-2">
              HOẶC CHỌN MẪU CÓ SẴN (DÙNG THỬ BÓC TÁCH):
            </label>
            <div className="space-y-2">
              {SAMPLE_IMAGES.map((sample) => {
                const isSelected = selectedImageUrl === sample.url;
                return (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-3 border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-amber-50 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B]'
                        : 'bg-white border-zinc-300 hover:border-[#09090B]'
                    }`}
                  >
                    <div className="h-12 w-12 border border-[#09090B] overflow-hidden shrink-0 bg-zinc-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sample.url}
                        alt={sample.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-[#09090B] truncate">
                          {sample.name}
                        </span>
                        {isSelected && (
                          <span className="bg-[#F97316] text-white p-0.5 border border-[#09090B]">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[10px] text-zinc-500 mt-0.5 line-clamp-1">
                        {sample.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Start OCR Process Button */}
          <div className="pt-4 border-t-2 border-[#09090B]">
            <button
              type="button"
              onClick={handleStartOcr}
              disabled={isProcessing || !selectedImageUrl}
              className={`w-full btn-brutal flex items-center justify-center gap-2 font-mono font-black text-sm py-4 px-6 uppercase border-2 border-[#09090B] transition-all ${
                isProcessing
                  ? 'bg-zinc-300 text-zinc-600 cursor-not-allowed'
                  : 'bg-[#F97316] text-white shadow-[4px_4px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer hover:bg-orange-600'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang bóc tách văn bản bằng AI OCR...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  BẮT ĐẦU BÓC TÁCH VĂN BẢN (OCR)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
