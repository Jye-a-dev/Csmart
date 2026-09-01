'use client';

import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export interface OcrPrecheckValidation {
  isNameValid: boolean;
  isSkuValid: boolean;
  isSlugValid: boolean;
  isPriceValid: boolean;
  isStockValid: boolean;
  isCategoryMatched: boolean;
  canSubmit: boolean;
}

interface OcrPrecheckMatrixProps {
  validation: OcrPrecheckValidation;
}

export function OcrPrecheckMatrix({ validation }: OcrPrecheckMatrixProps) {
  return (
    <div className="bg-[#FAFAFA] border-2 border-[#09090B] p-4 shadow-[2px_2px_0px_0px_#09090B]">
      <div className="flex items-center gap-2 font-mono text-xs font-black uppercase text-[#09090B] mb-2">
        <Sparkles size={16} className="text-emerald-600" />
        <span>BẢNG TIỀN KIỂM TRA TRƯỜNG DỮ LIỆU (PRE-CHECK MATRIX):</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
        <div
          className={`flex items-center gap-1.5 p-1.5 border font-bold ${validation.isNameValid
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
        >
          {validation.isNameValid ? (
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={13} className="text-rose-600 shrink-0" />
          )}
          <span>Tên sản phẩm</span>
        </div>

        <div
          className={`flex items-center gap-1.5 p-1.5 border font-bold ${validation.isSkuValid
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
        >
          {validation.isSkuValid ? (
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={13} className="text-rose-600 shrink-0" />
          )}
          <span>Mã SKU / Barcode</span>
        </div>

        <div
          className={`flex items-center gap-1.5 p-1.5 border font-bold ${validation.isPriceValid
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
        >
          {validation.isPriceValid ? (
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={13} className="text-rose-600 shrink-0" />
          )}
          <span>Đơn giá niêm yết</span>
        </div>

        <div
          className={`flex items-center gap-1.5 p-1.5 border font-bold ${validation.isSlugValid
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
        >
          {validation.isSlugValid ? (
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={13} className="text-rose-600 shrink-0" />
          )}
          <span>Slug URL</span>
        </div>

        <div
          className={`flex items-center gap-1.5 p-1.5 border font-bold ${validation.isStockValid
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
        >
          {validation.isStockValid ? (
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={13} className="text-rose-600 shrink-0" />
          )}
          <span>Tồn kho ban đầu</span>
        </div>

        <div
          className={`flex items-center gap-1.5 p-1.5 border font-bold ${validation.isCategoryMatched
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
        >
          {validation.isCategoryMatched ? (
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={13} className="text-amber-600 shrink-0" />
          )}
          <span>{validation.isCategoryMatched ? 'Đã gán danh mục' : 'Chưa gán danh mục'}</span>
        </div>
      </div>
    </div>
  );
}

