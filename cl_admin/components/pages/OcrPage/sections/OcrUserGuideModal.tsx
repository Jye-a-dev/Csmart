'use client';

import React from 'react';
import {
  X,
  BookOpen,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Search,
  Download,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

interface OcrUserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OcrUserGuideModal: React.FC<OcrUserGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border-4 border-[#09090B] shadow-[8px_8px_0px_0px_#09090B] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#09090B] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#F97316] text-[#09090B] border border-white">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="font-mono font-black text-lg uppercase tracking-tight text-[#FAFAFA]">
                HƯỚNG DẪN SỬ DỤNG DÀNH CHO ADMIN (NON-TECH GUIDE)
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                Các bước bóc tách văn bản từ ảnh & quản lý chứng từ dễ hiểu nhất
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

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 font-mono text-xs text-[#09090B]">
          {/* Welcome Callout */}
          <div className="bg-amber-50 border-2 border-[#09090B] p-4 flex items-start gap-3 shadow-[3px_3px_0px_0px_#09090B]">
            <Zap size={22} className="text-[#F97316] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-black text-sm text-[#09090B] uppercase">
                Tính năng OCR (Optical Character Recognition) là gì?
              </h3>
              <p className="mt-1 text-zinc-700 leading-relaxed">
                Tính năng này giúp Quản trị viên (Admin) <strong>tự động đọc và chuyển ảnh chụp Hóa đơn, Nhãn giao hàng, Nhãn sản phẩm</strong> thành chữ viết & số trên hệ thống mà không cần nhập tay từng chữ.
              </p>
            </div>
          </div>

          {/* Section 1: 4 Bước thực hiện nhanh */}
          <div>
            <h3 className="font-black text-sm uppercase text-[#09090B] border-b-2 border-[#09090B] pb-2 mb-4 flex items-center gap-2">
              <span className="bg-[#09090B] text-white px-2 py-0.5 text-xs">QUY TRÌNH 4 BƯỚC</span>
              Bóc tách thông tin từ hình ảnh
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="bg-white border-2 border-[#09090B] p-4 shadow-[3px_3px_0px_0px_#09090B] space-y-2">
                <div className="flex items-center gap-2 font-black text-sm text-[#F97316]">
                  <span className="h-6 w-6 rounded-full bg-[#09090B] text-white flex items-center justify-center text-xs">1</span>
                  CHỌN LOẠI VĂN BẢN
                </div>
                <p className="text-zinc-600 leading-relaxed">
                  Ở ô <strong>&quot;Loại tài liệu&quot;</strong>, chọn một trong các loại phù hợp:
                </p>
                <ul className="list-disc list-inside space-y-1 text-zinc-700 font-bold">
                  <li>Hóa đơn bán hàng / Thu tiền</li>
                  <li>Mã vận đơn (GHN, GHTK, ViettelPost)</li>
                  <li>Nhãn thông tin sản phẩm / Mã vạch</li>
                </ul>
              </div>

              {/* Step 2 */}
              <div className="bg-white border-2 border-[#09090B] p-4 shadow-[3px_3px_0px_0px_#09090B] space-y-2">
                <div className="flex items-center gap-2 font-black text-sm text-[#F97316]">
                  <span className="h-6 w-6 rounded-full bg-[#09090B] text-white flex items-center justify-center text-xs">2</span>
                  TẢI ẢNH HOẶC DÙNG MẪU
                </div>
                <p className="text-zinc-600 leading-relaxed">
                  Bấm nút <strong>&quot;Chọn ảnh từ máy tính&quot;</strong> hoặc bấm chọn một mẫu có sẵn bên dưới.
                </p>
                <div className="bg-zinc-100 p-2 border border-zinc-300 text-[11px] text-zinc-600 italic">
                  💡 Mẹo: Chọn ảnh phẳng, đủ ánh sáng, không bị mờ chữ hoặc che mất mép.
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white border-2 border-[#09090B] p-4 shadow-[3px_3px_0px_0px_#09090B] space-y-2">
                <div className="flex items-center gap-2 font-black text-sm text-[#F97316]">
                  <span className="h-6 w-6 rounded-full bg-[#09090B] text-white flex items-center justify-center text-xs">3</span>
                  BẤM BẮT ĐẦU BÓC TÁCH
                </div>
                <p className="text-zinc-600 leading-relaxed">
                  Bấm nút màu cam <strong>&quot;Bóc tách văn bản (OCR)&quot;</strong>. Trợ lý AI sẽ quét ảnh trong 1 - 2 giây và hiển thị bảng kết quả bên cạnh.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white border-2 border-[#09090B] p-4 shadow-[3px_3px_0px_0px_#09090B] space-y-2">
                <div className="flex items-center gap-2 font-black text-sm text-[#F97316]">
                  <span className="h-6 w-6 rounded-full bg-[#09090B] text-white flex items-center justify-center text-xs">4</span>
                  LƯU DỮ LIỆU VÀO BẢNG
                </div>
                <p className="text-zinc-600 leading-relaxed">
                  Kiểm tra các thông tin AI đọc được. Bấm nút <strong>&quot;Lưu vào danh sách&quot;</strong> để lưu chứng từ vào bảng quản lý dữ liệu.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Cách đọc chỉ số nhận diện */}
          <div>
            <h3 className="font-black text-sm uppercase text-[#09090B] border-b-2 border-[#09090B] pb-2 mb-4 flex items-center gap-2">
              <span className="bg-[#09090B] text-white px-2 py-0.5 text-xs">LƯU Ý ĐỘ CHÍNH XÁC</span>
              Màu sắc điểm số tự tin (Confidence Score)
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-emerald-50 border-2 border-emerald-500">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-800">Màu Xanh lá (Trên 85%): Kết quả Rất Chính Xác</span>
                  <p className="text-emerald-700 text-[11px] mt-0.5">
                    Hình ảnh rõ nét, chữ viết tiêu chuẩn. Bạn có thể yên tâm lưu trực tiếp mà không cần sửa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 border-2 border-amber-500">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-800">Màu Vàng/Cam (Dưới 75%): Cần Rà Soát Lại</span>
                  <p className="text-amber-700 text-[11px] mt-0.5">
                    Hình ảnh có chỗ bị nhòe hoặc chữ tay khó đọc. Vui lòng nhìn lại ảnh và sửa lại ô sai trước khi lưu.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Hướng dẫn CRUD bảng dữ liệu */}
          <div>
            <h3 className="font-black text-sm uppercase text-[#09090B] border-b-2 border-[#09090B] pb-2 mb-4 flex items-center gap-2">
              <span className="bg-[#09090B] text-white px-2 py-0.5 text-xs">CÁC NÚT THAO TÁC</span>
              Quản lý danh sách chứng từ đã lưu (CRUD)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 border-2 border-[#09090B] bg-white">
                <div className="font-bold flex items-center gap-1.5 text-[#09090B]">
                  <Search size={14} className="text-[#F97316]" /> Tìm kiếm / Lọc
                </div>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Gõ Mã đơn, SĐT hoặc Tên khách hàng vào ô Tìm kiếm để tra cứu nhanh.
                </p>
              </div>

              <div className="p-3 border-2 border-[#09090B] bg-white">
                <div className="font-bold flex items-center gap-1.5 text-[#09090B]">
                  <Edit3 size={14} className="text-blue-600" /> Sửa thông tin
                </div>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Bấm biểu tượng cây bút để cập nhật lại địa chỉ, tổng tiền hoặc tên sản phẩm.
                </p>
              </div>

              <div className="p-3 border-2 border-[#09090B] bg-white">
                <div className="font-bold flex items-center gap-1.5 text-[#09090B]">
                  <Download size={14} className="text-emerald-600" /> Xuất File Excel/JSON
                </div>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Bấm nút Xuất dữ liệu để tải danh sách các đơn OCR về máy tính dưới dạng CSV.
                </p>
              </div>

              <div className="p-3 border-2 border-[#09090B] bg-white">
                <div className="font-bold flex items-center gap-1.5 text-[#09090B]">
                  <Camera size={14} className="text-purple-600" /> Xem ảnh gốc
                </div>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Bấm biểu tượng con mắt để xem lại ảnh chứng từ ban đầu dùng để quét.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAFAFA] border-t-2 border-[#09090B] px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="btn-brutal bg-[#F97316] text-white font-mono font-bold text-xs px-6 py-2.5 uppercase border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
          >
            Đã hiểu & Bắt đầu làm việc
          </button>
        </div>
      </div>
    </div>
  );
};
