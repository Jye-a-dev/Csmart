'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Eye,
  Edit3,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Truck,
  Tag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { OcrDocType } from './OcrUploaderSection';
import { OcrExtractedData } from './OcrProcessingResult';

export interface OcrRecordItem extends OcrExtractedData {
  id: string;
  image_url: string;
  created_at: string;
  updated_at?: string;
  status: 'VERIFIED' | 'NEEDS_REVIEW';
  notes?: string;
}

interface OcrRecordsTableProps {
  records: OcrRecordItem[];
  loading?: boolean;
  onViewRecord: (record: OcrRecordItem) => void;
  onEditRecord: (record: OcrRecordItem) => void;
  onDeleteRecord: (record: OcrRecordItem) => void;
  onExportCsv: () => void;
}

export const OcrRecordsTable: React.FC<OcrRecordsTableProps> = React.memo(({
  records,
  loading = false,
  onViewRecord,
  onEditRecord,
  onDeleteRecord,
  onExportCsv,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  // Filter logic (Memoized for zero re-render lag)
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.phone_number && item.phone_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.tracking_number && item.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDocType = docTypeFilter === 'ALL' || item.document_type === docTypeFilter;
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesDocType && matchesStatus;
    });
  }, [records, searchTerm, docTypeFilter, statusFilter]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getDocTypeBadge = (type: OcrDocType) => {
    switch (type) {
      case 'INVOICE':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-400 font-mono text-[10px] font-bold px-2 py-0.5">
            <FileText size={12} /> HÓA ĐƠN
          </span>
        );
      case 'SHIPPING_LABEL':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 border border-purple-400 font-mono text-[10px] font-bold px-2 py-0.5">
            <Truck size={12} /> VẬN ĐƠN
          </span>
        );
      case 'PRODUCT_LABEL':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-400 font-mono text-[10px] font-bold px-2 py-0.5">
            <Tag size={12} /> NHÃN SP
          </span>
        );
    }
  };

  return (
    <div className="bg-white border-2 border-[#09090B] p-6 shadow-[4px_4px_0px_0px_#09090B]">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-[#09090B] pb-4 mb-6">
        <div>
          <h2 className="font-mono font-black text-base uppercase text-[#09090B] flex items-center gap-2">
            <span className="bg-[#09090B] text-white px-2 py-0.5 text-xs">CRUD</span>
            DANH SÁCH CHỨNG TỪ OCR ĐÃ LƯU ({filteredRecords.length})
          </h2>
          <p className="font-mono text-xs text-zinc-500 mt-0.5">
            Quản lý, chỉnh sửa, tra cứu và xuất dữ liệu chứng từ đã bóc tách thành công
          </p>
        </div>

        {/* Action Button: Export CSV */}
        <button
          onClick={onExportCsv}
          className="flex items-center gap-2 bg-[#FAFAFA] text-[#09090B] font-mono font-bold text-xs px-4 py-2.5 uppercase border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all hover:bg-emerald-100 cursor-pointer shrink-0"
        >
          <FileSpreadsheet size={16} className="text-emerald-600" />
          Xuất File CSV / Excel
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
        {/* Search Input */}
        <div className="md:col-span-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search size={15} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo Mã đơn, Mã vận đơn, Tên KH, SĐT..."
            className="w-full pl-9 pr-4 py-2 border-2 border-[#09090B] focus:outline-none focus:bg-zinc-50 font-mono text-xs bg-white shadow-[2px_2px_0px_0px_#09090B]"
          />
        </div>

        {/* Doc Type Filter */}
        <div className="md:col-span-3">
          <select
            value={docTypeFilter}
            onChange={(e) => {
              setDocTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-xs font-bold bg-white shadow-[2px_2px_0px_0px_#09090B] focus:outline-none"
          >
            <option value="ALL">-- Tất cả loại tài liệu --</option>
            <option value="INVOICE">Hóa đơn bán hàng</option>
            <option value="SHIPPING_LABEL">Mã vận đơn (Shipping)</option>
            <option value="PRODUCT_LABEL">Nhãn sản phẩm</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-xs font-bold bg-white shadow-[2px_2px_0px_0px_#09090B] focus:outline-none"
          >
            <option value="ALL">-- Tất cả trạng thái --</option>
            <option value="VERIFIED">Đã xác minh (Độ tin cậy cao)</option>
            <option value="NEEDS_REVIEW">Cần rà soát (Review)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto border-2 border-[#09090B] mb-4">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-[#09090B] text-white font-bold uppercase">
              <th className="p-3 border-r border-zinc-700 w-12 text-center">ẢNH</th>
              <th className="p-3 border-r border-zinc-700">MÃ ĐƠN / CHỨNG TỪ</th>
              <th className="p-3 border-r border-zinc-700">LOẠI</th>
              <th className="p-3 border-r border-zinc-700">KHÁCH HÀNG & SĐT</th>
              <th className="p-3 border-r border-zinc-700">TỔNG TIỀN</th>
              <th className="p-3 border-r border-zinc-700 text-center">TỰ TIN</th>
              <th className="p-3 border-r border-zinc-700">THỜI GIAN</th>
              <th className="p-3 text-center w-32">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y border-t border-[#09090B]">
            {loading ? (
              [1, 2, 3, 4, 5].map((idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="p-2 border-r border-[#09090B] text-center">
                    <div className="h-10 w-10 bg-zinc-200 border border-[#09090B] mx-auto"></div>
                  </td>
                  <td className="p-3 border-r border-[#09090B]">
                    <div className="h-4 bg-zinc-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-zinc-100 rounded w-16"></div>
                  </td>
                  <td className="p-3 border-r border-[#09090B]">
                    <div className="h-5 bg-zinc-200 rounded w-20"></div>
                  </td>
                  <td className="p-3 border-r border-[#09090B]">
                    <div className="h-4 bg-zinc-200 rounded w-28 mb-1"></div>
                    <div className="h-3 bg-zinc-100 rounded w-20"></div>
                  </td>
                  <td className="p-3 border-r border-[#09090B]">
                    <div className="h-4 bg-zinc-200 rounded w-20"></div>
                  </td>
                  <td className="p-3 border-r border-[#09090B] text-center">
                    <div className="h-5 bg-zinc-200 rounded w-14 mx-auto"></div>
                  </td>
                  <td className="p-3 border-r border-[#09090B]">
                    <div className="h-3 bg-zinc-200 rounded w-24"></div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="h-6 bg-zinc-200 rounded w-20 mx-auto"></div>
                  </td>
                </tr>
              ))
            ) : paginatedRecords.length > 0 ? (
              paginatedRecords.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                  {/* Thumbnail */}
                  <td className="p-2 border-r border-[#09090B] text-center">
                    <div className="h-10 w-10 border border-[#09090B] overflow-hidden bg-zinc-100 mx-auto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_url}
                        alt="OCR Thumb"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>

                  {/* Order Code */}
                  <td className="p-3 border-r border-[#09090B] font-bold text-[#09090B]">
                    <div>{item.order_code}</div>
                    {item.tracking_number && (
                      <div className="text-[10px] text-zinc-500 font-normal">
                        Mã VD: {item.tracking_number}
                      </div>
                    )}
                  </td>

                  {/* Doc Type Badge */}
                  <td className="p-3 border-r border-[#09090B]">
                    {getDocTypeBadge(item.document_type)}
                  </td>

                  {/* Customer Info */}
                  <td className="p-3 border-r border-[#09090B]">
                    <div className="font-bold text-[#09090B]">{item.customer_name}</div>
                    <div className="text-[11px] text-emerald-700 font-bold">{item.phone_number}</div>
                  </td>

                  {/* Total Amount */}
                  <td className="p-3 border-r border-[#09090B] font-black text-[#F97316]">
                    {item.total_amount.toLocaleString('vi-VN')} đ
                  </td>

                  {/* Confidence Score & Status */}
                  <td className="p-3 border-r border-[#09090B] text-center">
                    <span
                      className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 border ${
                        item.confidence_score >= 0.8
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                          : 'bg-amber-100 text-amber-900 border-amber-400'
                      }`}
                    >
                      {item.confidence_score >= 0.8 ? (
                        <CheckCircle2 size={11} className="text-emerald-600" />
                      ) : (
                        <AlertTriangle size={11} className="text-amber-600" />
                      )}
                      {Math.round(item.confidence_score * 100)}%
                    </span>
                  </td>

                  {/* Created At */}
                  <td className="p-3 border-r border-[#09090B] text-zinc-500 text-[11px]">
                    {item.created_at}
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onViewRecord(item)}
                        className="p-1.5 border border-[#09090B] bg-white text-[#09090B] hover:bg-[#F97316] hover:text-white transition-colors cursor-pointer"
                        title="Xem chi tiết (Read)"
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        onClick={() => onEditRecord(item)}
                        className="p-1.5 border border-[#09090B] bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                        title="Chỉnh sửa (Update)"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => onDeleteRecord(item)}
                        className="p-1.5 border border-[#09090B] bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                        title="Xóa bản ghi (Delete)"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-8 text-center text-zinc-500 font-mono">
                  Không tìm thấy bản ghi OCR nào phù hợp với bộ lọc
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="text-zinc-600 font-bold">
          Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredRecords.length)} / Tổng {filteredRecords.length} chứng từ
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 border-2 border-[#09090B] bg-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 cursor-pointer shadow-[2px_2px_0px_0px_#09090B]"
          >
            <ChevronLeft size={14} /> Trước
          </button>

          <span className="font-bold px-3 py-1.5 bg-[#09090B] text-white">
            Trang {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 border-2 border-[#09090B] bg-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 cursor-pointer shadow-[2px_2px_0px_0px_#09090B]"
          >
            Sau <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
});

OcrRecordsTable.displayName = 'OcrRecordsTable';
