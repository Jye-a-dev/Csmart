'use client';

import React, { useState } from 'react';
import {
  OcrHeader,
  OcrUserGuideModal,
  OcrUploaderSection,
  OcrProcessingResult,
  OcrRecordsTable,
  OcrRecordModal,
  OcrDeleteModal,
  OcrDocType,
  OcrExtractedData,
  OcrRecordItem,
} from './sections';

const INITIAL_OCR_RECORDS: OcrRecordItem[] = [
  {
    id: 'ocr-rec-101',
    document_type: 'INVOICE',
    order_code: 'ORD-98421',
    customer_name: 'Nguyễn Văn An',
    phone_number: '0988 123 456',
    address: 'Số 12 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    total_amount: 1450000,
    confidence_score: 0.94,
    execution_time_ms: 320,
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    created_at: '2026-08-17 14:20:15',
    status: 'VERIFIED',
    extracted_items: [
      { name: 'Tai nghe Bluetooth SmartPod Pro', quantity: 1, unit_price: 950000 },
      { name: 'Cáp sạc nhanh Type-C 100W', quantity: 2, unit_price: 250000 },
    ],
    raw_text_chunks: [
      'SMARTCART E-COMMERCE INVOICE',
      'Mã đơn: ORD-98421',
      'KH: Nguyễn Văn An - SĐT: 0988 123 456',
      '1. Tai nghe Bluetooth SmartPod Pro - 950,000đ',
      '2. Cáp sạc nhanh Type-C - 500,000đ',
      'TỔNG CỘNG: 1,450,000 VNĐ',
    ],
  },
  {
    id: 'ocr-rec-102',
    document_type: 'SHIPPING_LABEL',
    order_code: 'ORD-77620',
    tracking_number: 'GHN-99823411',
    courier_name: 'Giao Hàng Nhanh (GHN)',
    customer_name: 'Trần Thị Bình',
    phone_number: '0912 345 678',
    address: 'Tòa nhà Landmark 81, Quận Bình Thạnh, TP. Hồ Chí Minh',
    total_amount: 820000,
    confidence_score: 0.72,
    execution_time_ms: 410,
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    created_at: '2026-08-17 15:45:00',
    status: 'NEEDS_REVIEW',
    extracted_items: [
      { name: 'Nồi chiên không dầu SmartChef 5.5L', quantity: 1, unit_price: 820000 },
    ],
    raw_text_chunks: [
      'GIAO HÀNG NHANH - MÃ VẬN ĐƠN: GHN-99823411',
      'Người nhận: Trần Thị Bình - 0912345678',
      'Đ/c: Landmark 81, B.Thạnh',
      'Thu hộ COD: 820.000 VNĐ',
    ],
  },
  {
    id: 'ocr-rec-103',
    document_type: 'PRODUCT_LABEL',
    order_code: 'ORD-55410',
    customer_name: 'Phạm Minh Tuấn',
    phone_number: '0903 888 999',
    address: 'Số 45 Phố Huế, Quận Hai Bà Trưng, Hà Nội',
    total_amount: 3200000,
    confidence_score: 0.89,
    execution_time_ms: 280,
    image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
    created_at: '2026-08-17 16:10:30',
    status: 'VERIFIED',
    extracted_items: [
      { name: 'Đồng hồ thông minh SmartWatch Ultra', quantity: 1, unit_price: 3200000 },
    ],
    raw_text_chunks: [
      'SMARTWATCH ULTRA MODEL-S9',
      'Serial No: SN-2026-9817',
      'Bảo hành chính hãng 12 tháng',
    ],
  },
];

export default function OcrPage() {
  const [records, setRecords] = useState<OcrRecordItem[]>(INITIAL_OCR_RECORDS);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentExtraction, setCurrentExtraction] = useState<OcrExtractedData | null>(null);

  // Modals state
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'VIEW' | 'EDIT' | 'CREATE'>('VIEW');
  const [selectedRecord, setSelectedRecord] = useState<OcrRecordItem | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Process OCR request
  const handleProcessOcr = async (imageUrl: string, docType: OcrDocType) => {
    setIsProcessing(true);
    setCurrentExtraction(null);

    try {
      // Simulate fast AI Engine response for smooth UI experience
      await new Promise((res) => setTimeout(res, 1200));

      let mockData: OcrExtractedData;

      if (docType === 'SHIPPING_LABEL') {
        mockData = {
          document_type: 'SHIPPING_LABEL',
          order_code: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
          tracking_number: `GHN-${Math.floor(10000000 + Math.random() * 90000000)}`,
          courier_name: 'Giao Hàng Nhanh (GHN)',
          customer_name: 'Hoàng Anh Dũng',
          phone_number: '0977 456 789',
          address: '120 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội',
          total_amount: 650000,
          confidence_score: 0.91,
          execution_time_ms: 350,
          extracted_items: [
            { name: 'Bàn phím cơ không dây SmartKey K8', quantity: 1, unit_price: 650000 },
          ],
          raw_text_chunks: [
            'GIAO HÀNG NHANH (GHN)',
            'Mã vận đơn: GHN-88192304',
            'Người nhận: Hoàng Anh Dũng',
            'Đ/c: 120 Cầu Giấy, Hà Nội',
            'COD: 650.000 VNĐ',
          ],
        };
      } else if (docType === 'PRODUCT_LABEL') {
        mockData = {
          document_type: 'PRODUCT_LABEL',
          order_code: `PROD-${Math.floor(10000 + Math.random() * 90000)}`,
          customer_name: 'Khách hàng Vãng lai',
          phone_number: '0909 111 222',
          address: 'Kho tổng CsmartAI HCM',
          total_amount: 1850000,
          confidence_score: 0.86,
          execution_time_ms: 290,
          extracted_items: [
            { name: 'Camera Ninh Giám Sát CSmart Cam 4K', quantity: 1, unit_price: 1850000 },
          ],
          raw_text_chunks: [
            'CSMART CAM 4K NIGHT VISION',
            'Resolution: 3840x2160',
            'Serial: CSM-2026-OK',
          ],
        };
      } else {
        mockData = {
          document_type: 'INVOICE',
          order_code: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
          customer_name: 'Lê Thị Thu Hà',
          phone_number: '0934 567 890',
          address: 'Số 88 Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội',
          total_amount: 2150000,
          confidence_score: 0.95,
          execution_time_ms: 310,
          extracted_items: [
            { name: 'Robot Hút Bụi Csmart Clean V2', quantity: 1, unit_price: 1900000 },
            { name: 'Bộ lọc HEPA thay thế', quantity: 1, unit_price: 250000 },
          ],
          raw_text_chunks: [
            'HÓA ĐƠN XUẤT HÀNG CSMART',
            'KH: Lê Thị Thu Hà - 0934567890',
            '1. Robot hút bụi - 1,900,000đ',
            '2. Bộ lọc HEPA - 250,000đ',
            'TỔNG TIỀN: 2,150,000 VNĐ',
          ],
        };
      }

      setCurrentExtraction(mockData);
    } catch (err) {
      console.error('OCR Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Save record from OCR extraction result to CRUD table
  const handleSaveExtractionRecord = (data: OcrExtractedData) => {
    const newRecord: OcrRecordItem = {
      ...data,
      id: `ocr-rec-${Date.now()}`,
      image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      created_at: new Date().toLocaleString('vi-VN'),
      status: data.confidence_score >= 0.8 ? 'VERIFIED' : 'NEEDS_REVIEW',
    };

    setRecords((prev) => [newRecord, ...prev]);
    setCurrentExtraction(null);
  };

  // CRUD actions
  const handleViewRecord = (item: OcrRecordItem) => {
    setSelectedRecord(item);
    setModalMode('VIEW');
    setIsRecordModalOpen(true);
  };

  const handleEditRecord = (item: OcrRecordItem) => {
    setSelectedRecord(item);
    setModalMode('EDIT');
    setIsRecordModalOpen(true);
  };

  const handleDeleteRecord = (item: OcrRecordItem) => {
    setSelectedRecord(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setIsDeleteModalOpen(false);
    setSelectedRecord(null);
  };

  const handleSaveRecordModal = (recordData: Partial<OcrRecordItem>) => {
    if (modalMode === 'EDIT' && selectedRecord) {
      setRecords((prev) =>
        prev.map((r) => (r.id === selectedRecord.id ? { ...r, ...recordData } as OcrRecordItem : r))
      );
    } else if (modalMode === 'CREATE') {
      const newRec: OcrRecordItem = {
        id: `ocr-rec-${Date.now()}`,
        document_type: recordData.document_type || 'INVOICE',
        order_code: recordData.order_code || `ORD-${Date.now()}`,
        customer_name: recordData.customer_name || 'Khách hàng',
        phone_number: recordData.phone_number || '',
        address: recordData.address || '',
        total_amount: recordData.total_amount || 0,
        confidence_score: 0.95,
        execution_time_ms: 250,
        image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        created_at: new Date().toLocaleString('vi-VN'),
        status: 'VERIFIED',
        extracted_items: recordData.extracted_items || [],
        raw_text_chunks: ['THỦ CÔNG TẠO BỞI ADMIN'],
      };
      setRecords((prev) => [newRec, ...prev]);
    }
    setIsRecordModalOpen(false);
    setSelectedRecord(null);
  };

  // Export CSV function
  const handleExportCsv = () => {
    const headers = ['ID', 'Mã đơn', 'Mã vận đơn', 'Loại', 'Khách hàng', 'SĐT', 'Địa chỉ', 'Tổng tiền', 'Độ tin cậy', 'Thời gian'];
    const rows = records.map((r) => [
      r.id,
      r.order_code,
      r.tracking_number || '',
      r.document_type,
      `"${r.customer_name}"`,
      r.phone_number,
      `"${r.address.replace(/"/g, '""')}"`,
      r.total_amount,
      `${Math.round(r.confidence_score * 100)}%`,
      r.created_at,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ocr_records_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scrollToUploader = () => {
    const el = document.getElementById('ocr-uploader');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const pendingReviewCount = records.filter((r) => r.status === 'NEEDS_REVIEW').length;
  const successRate = Math.round(
    (records.filter((r) => r.confidence_score >= 0.8).length / Math.max(1, records.length)) * 100
  );

  return (
    <div className="w-full max-w-7xl mx-auto pb-12">
      {/* 1. Page Header */}
      <OcrHeader
        totalScans={records.length}
        successRate={successRate}
        pendingReviewCount={pendingReviewCount}
        onOpenUserGuide={() => setIsGuideOpen(true)}
        onRefresh={() => setRecords([...records])}
        onScrollToUploader={scrollToUploader}
      />

      {/* 2. User Guide Modal (Detailed for Non-tech Admin) */}
      <OcrUserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* 3. Uploader Section */}
      <OcrUploaderSection
        onProcessOcr={handleProcessOcr}
        isProcessing={isProcessing}
      />

      {/* 4. Extraction Result Display Section */}
      <OcrProcessingResult
        result={currentExtraction}
        onSaveRecord={handleSaveExtractionRecord}
      />

      {/* 5. CRUD Records Table Section */}
      <OcrRecordsTable
        records={records}
        onViewRecord={handleViewRecord}
        onEditRecord={handleEditRecord}
        onDeleteRecord={handleDeleteRecord}
        onExportCsv={handleExportCsv}
      />

      {/* 6. View / Edit Record Modal */}
      <OcrRecordModal
        isOpen={isRecordModalOpen}
        mode={modalMode}
        record={selectedRecord}
        onClose={() => setIsRecordModalOpen(false)}
        onSave={handleSaveRecordModal}
      />

      {/* 7. Confirm Delete Modal */}
      <OcrDeleteModal
        isOpen={isDeleteModalOpen}
        record={selectedRecord}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
