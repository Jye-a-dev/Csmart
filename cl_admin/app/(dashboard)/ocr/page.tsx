'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  OcrHeader,
  OcrUserGuideModal,
  OcrUploaderSection,
  OcrProcessingResult,
  OcrRecordsTable,
  OcrRecordModal,
  OcrDeleteModal,
  OcrQuickCreateProductModal,
  OcrExtractedData,
  OcrRecordItem,
} from './_components';
import { useOcrRecords } from '@/hooks/useOcrRecords';
import { useProducts, useCategories } from '@/hooks';
import { CreateProductDto } from '@/types/entities/product';
import { Category } from '@/types/entities/category';
import { OcrToast, ToastState } from './_components/OcrToast';
import { useOcrProcessor } from './_hooks/useOcrProcessor';
import { exportOcrRecordsToCsv } from './_utils/exportCsv';

export default function OcrPage() {
  const { loading: tableLoading, fetchRecords, createRecord, updateRecord, deleteRecord } = useOcrRecords();
  const { createProduct } = useProducts();
  const { findAllCategories } = useCategories();

  const [records, setRecords] = useState<OcrRecordItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Toast feedback state & callback
  const [toast, setToast] = useState<ToastState | null>(null);
  const showToast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Custom hook for OCR extraction workflow
  const { isProcessing, currentExtraction, setCurrentExtraction, processOcr } = useOcrProcessor(showToast);

  // Modals state
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'VIEW' | 'EDIT' | 'CREATE'>('VIEW');
  const [selectedRecord, setSelectedRecord] = useState<OcrRecordItem | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isQuickCreateModalOpen, setIsQuickCreateModalOpen] = useState<boolean>(false);
  const [quickCreateSource, setQuickCreateSource] = useState<OcrExtractedData | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState<boolean>(false);

  // Load records from backend database
  const loadRecords = useCallback(async () => {
    try {
      const data = await fetchRecords();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load OCR records:', err);
      showToast('Không thể kết nối cơ sở dữ liệu OCR', 'err');
    }
  }, [fetchRecords, showToast]);

  // Load initial data (records and categories)
  useEffect(() => {
    let isMounted = true;
    fetchRecords()
      .then((data) => {
        if (isMounted) setRecords(data);
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load OCR records:', err);
          showToast('Không thể kết nối cơ sở dữ liệu OCR', 'err');
        }
      });

    findAllCategories({ limit: 200 })
      .then((cats) => {
        if (isMounted) setCategories(cats || []);
      })
      .catch((catErr) => {
        console.error('Failed to fetch categories:', catErr);
      });

    return () => {
      isMounted = false;
    };
  }, [fetchRecords, findAllCategories, showToast]);

  // Save record from OCR extraction result to database
  const handleSaveExtractionRecord = async (data: OcrExtractedData) => {
    try {
      const created = await createRecord({
        ...data,
        image_url: data.image_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        status: data.confidence_score >= 0.8 ? 'VERIFIED' : 'NEEDS_REVIEW',
      });
      setRecords((prev: OcrRecordItem[]) => [created, ...prev]);
      setCurrentExtraction(null);
      showToast('Đã lưu chứng từ vào cơ sở dữ liệu!');
    } catch (err) {
      console.error('Save OCR record failed:', err);
      showToast('Lỗi khi lưu chứng từ', 'err');
    }
  };

  // Direct Product Creation from OCR result
  const handleConfirmQuickCreateProduct = async (dto: CreateProductDto) => {
    setIsSubmittingProduct(true);
    try {
      const created = await createProduct(dto);
      showToast(`Đã tạo sản phẩm '${created.name}' thành công! (Mã: ${created.sku})`);
      setIsQuickCreateModalOpen(false);

      const targetData = quickCreateSource || currentExtraction;
      // If from saved table (has id), update existing record
      if (targetData && 'id' in targetData && (targetData as OcrRecordItem).id) {
        const recordId = (targetData as OcrRecordItem).id;
        try {
          await updateRecord(recordId, {
            is_product_created: true,
            product_id: created.id,
            status: 'VERIFIED',
          });
        } catch (updateErr) {
          console.warn('Update OCR record link error:', updateErr);
        }
        setRecords((prev) =>
          prev.map((r) =>
            r.id === recordId
              ? { ...r, is_product_created: true, product_id: created.id, status: 'VERIFIED' }
              : r
          )
        );
      } else if (targetData) {
        // Auto-save the OCR record with status VERIFIED and is_product_created
        try {
          const rec = await createRecord({
            ...targetData,
            product_name: created.name,
            order_code: created.sku,
            status: 'VERIFIED',
            is_product_created: true,
            product_id: created.id,
            image_url: targetData.image_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
          });
          setRecords((prev) => [rec, ...prev]);
        } catch (recErr) {
          console.warn('Auto-save OCR record notice:', recErr);
        }
      }

      // Update currentExtraction state to disable button on live result card
      if (currentExtraction && (!quickCreateSource || !('id' in quickCreateSource))) {
        setCurrentExtraction((prev) =>
          prev ? { ...prev, is_product_created: true, product_id: created.id } : null
        );
      }
      setQuickCreateSource(null);
    } catch (err) {
      console.error('Failed to create product from OCR:', err);
      showToast('Lỗi khi tạo sản phẩm từ OCR. Vui lòng kiểm tra lại các trường!', 'err');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleQuickCreateProductFromRecord = (record: OcrRecordItem) => {
    setQuickCreateSource(record);
    setIsQuickCreateModalOpen(true);
  };

  // Modal actions
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

  const handleConfirmDelete = async (id: string) => {
    try {
      await deleteRecord(id);
      setRecords((prev: OcrRecordItem[]) => prev.filter((r) => r.id !== id));
      setIsDeleteModalOpen(false);
      setSelectedRecord(null);
      showToast('Đã xóa chứng từ thành công!');
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('Lỗi khi xóa chứng từ', 'err');
    }
  };

  const handleSaveRecordModal = async (recordData: Partial<OcrRecordItem>) => {
    try {
      if (modalMode === 'EDIT' && selectedRecord) {
        let updated: OcrRecordItem;
        try {
          updated = await updateRecord(selectedRecord.id, recordData);
        } catch {
          updated = await createRecord({
            ...selectedRecord,
            ...recordData,
          });
        }
        setRecords((prev: OcrRecordItem[]) =>
          prev.map((r) => (r.id === selectedRecord.id ? { ...r, ...updated } : r))
        );
        showToast('Cập nhật chứng từ thành công!');
      } else if (modalMode === 'CREATE') {
        const newRec = await createRecord({
          document_type: recordData.document_type || 'INVOICE',
          order_code: recordData.order_code || `ORD-${Date.now()}`,
          customer_name: recordData.customer_name || 'Khách hàng',
          phone_number: recordData.phone_number || '',
          address: recordData.address || '',
          total_amount: recordData.total_amount || 0,
          confidence_score: 0.95,
          execution_time_ms: 250,
          image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
          status: 'VERIFIED',
          extracted_items: recordData.extracted_items || [],
          raw_text_chunks: ['TẠO BỞI QUẢN TRỊ VIÊN'],
        });
        setRecords((prev: OcrRecordItem[]) => [newRec, ...prev]);
        showToast('Tạo mới chứng từ thành công!');
      }
    } catch (err) {
      console.error('Save modal error:', err);
      showToast('Lỗi khi lưu thông tin chứng từ', 'err');
    } finally {
      setIsRecordModalOpen(false);
      setSelectedRecord(null);
    }
  };

  const scrollToUploader = () => {
    const el = document.getElementById('ocr-uploader');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const pendingReviewCount = useMemo(
    () => records.filter((r) => r.status === 'NEEDS_REVIEW').length,
    [records],
  );

  const successRate = useMemo(
    () =>
      Math.round(
        (records.filter((r) => (r.confidence_score || 0.9) >= 0.8).length /
          Math.max(1, records.length)) *
        100,
      ),
    [records],
  );

  return (
    <div className="w-full max-w-7xl mx-auto pb-12 relative">
      {/* Toast Alert Feedback Overlay */}
      <OcrToast toast={toast} />

      {/* Page Header */}
      <OcrHeader
        totalScans={records.length}
        successRate={successRate}
        pendingReviewCount={pendingReviewCount}
        onOpenUserGuide={() => setIsGuideOpen(true)}
        onRefresh={loadRecords}
        onScrollToUploader={scrollToUploader}
      />

      {/* User Guide Modal */}
      <OcrUserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Uploader Section */}
      <OcrUploaderSection
        onProcessOcr={processOcr}
        isProcessing={isProcessing}
      />

      {/* Extraction Result Display Section */}
      <OcrProcessingResult
        result={currentExtraction}
        onSaveRecord={handleSaveExtractionRecord}
        onOpenCreateProduct={() => {
          setQuickCreateSource(currentExtraction);
          setIsQuickCreateModalOpen(true);
        }}
      />

      {/* Quick Create Product From Label Modal with Pre-check Matrix */}
      <OcrQuickCreateProductModal
        isOpen={isQuickCreateModalOpen}
        result={quickCreateSource || currentExtraction}
        categories={categories}
        isSubmitting={isSubmittingProduct}
        onClose={() => {
          setIsQuickCreateModalOpen(false);
          setQuickCreateSource(null);
        }}
        onConfirmCreate={handleConfirmQuickCreateProduct}
      />

      {/* CRUD Records Table Section */}
      <OcrRecordsTable
        records={records}
        loading={tableLoading}
        onViewRecord={handleViewRecord}
        onEditRecord={handleEditRecord}
        onDeleteRecord={handleDeleteRecord}
        onQuickCreateProduct={handleQuickCreateProductFromRecord}
        onExportCsv={() => exportOcrRecordsToCsv(records, () => showToast('Đã xuất file CSV thành công!'))}
      />

      {/* View / Edit Record Modal */}
      <OcrRecordModal
        isOpen={isRecordModalOpen}
        mode={modalMode}
        record={selectedRecord}
        onClose={() => setIsRecordModalOpen(false)}
        onSave={handleSaveRecordModal}
      />

      {/* Confirm Delete Modal */}
      <OcrDeleteModal
        isOpen={isDeleteModalOpen}
        record={selectedRecord}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
