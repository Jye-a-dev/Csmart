import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import { OcrRecordItem } from '@/types/entities/ocr-record';
import { JobStatusResponse, SubmitOcrResponse } from '@/types/ai/task';

export function useOcrRecords() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Lấy danh sách bản ghi OCR đã lưu trong DB
  const fetchRecords = useCallback(async (params?: {
    limit?: number;
    offset?: number;
    document_type?: string;
    status?: string;
    search?: string;
  }): Promise<OcrRecordItem[]> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<OcrRecordItem[]>('/ocr-records', {
        params: params as Record<string, string | number | boolean>,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Chi tiết bản ghi OCR theo ID
  const findOneRecord = useCallback(async (id: string): Promise<OcrRecordItem> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<OcrRecordItem>(`/ocr-records/${id}`);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo bản ghi OCR mới thủ công
  const createRecord = useCallback(async (dto: Partial<OcrRecordItem>): Promise<OcrRecordItem> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<OcrRecordItem>('/ocr-records', {
        method: 'POST',
        body: dto,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật bản ghi OCR
  const updateRecord = useCallback(async (id: string, dto: Partial<OcrRecordItem>): Promise<OcrRecordItem> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<OcrRecordItem>(`/ocr-records/${id}`, {
        method: 'PATCH',
        body: dto,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Xóa bản ghi OCR
  const deleteRecord = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient<void>(`/ocr-records/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Đếm tổng số bản ghi OCR
  const countAllRecords = useCallback(async (): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<number>('/ocr-records/count/all');
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Đẩy ảnh vào BullMQ OCR Queue (Trả về jobId)
  const submitImage = useCallback(async (file: File): Promise<SubmitOcrResponse> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      return await apiClient<SubmitOcrResponse>('/ai/ocr', {
        method: 'POST',
        body: formData,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll trạng thái tiến trình xử lý ảnh từ BullMQ OCR queue
  const pollJobStatus = useCallback(async (jobId: string): Promise<JobStatusResponse> => {
    return await apiClient<JobStatusResponse>(`/ai-tasks/status/ocr/${jobId}`);
  }, []);

  return {
    loading,
    error,
    fetchRecords,
    findOneRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    countAllRecords,
    submitImage,
    pollJobStatus,
  };
}
