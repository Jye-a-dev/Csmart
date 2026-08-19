import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import { OcrRecordItem } from '@/components/pages/OcrPage/sections';

// ─── Job Status Types ────────────────────────────────────────────────────────

export interface OcrJobResult {
  success: boolean;
  status: string;
  raw_text: string;
  extracted_words: string[];
  confidence_score: number;
  flag_for_review: boolean;
  is_fallback?: boolean;
  data?: {
    name: string;
    price: number;
    color: string;
    raw_text: string;
  };
  similar_products?: unknown[];
}

export interface OcrJobStatus {
  id: string;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress: number | object;
  failedReason?: string;
  returnValue?: OcrJobResult;
  timestamp: string;
  processedOn: string | null;
  finishedOn: string | null;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useOcrRecords() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // ── CRUD: Quản lý bản ghi OCR đã lưu trong DB ──────────────────────────

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

  const createRecord = useCallback(async (dto: Partial<OcrRecordItem>): Promise<OcrRecordItem> => {
    setLoading(true);
    setError(null);
    const cleanDto = { ...dto };
    delete cleanDto.id;
    delete cleanDto.created_at;
    delete cleanDto.updated_at;

    if (cleanDto.total_amount !== undefined) {
      cleanDto.total_amount = Number(cleanDto.total_amount) || 0;
    }
    if (cleanDto.confidence_score !== undefined) {
      cleanDto.confidence_score = Number(cleanDto.confidence_score) || 0.95;
    }
    if (cleanDto.execution_time_ms !== undefined) {
      cleanDto.execution_time_ms = Number(cleanDto.execution_time_ms) || 300;
    }

    try {
      return await apiClient<OcrRecordItem>('/ocr-records', {
        method: 'POST',
        body: cleanDto,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRecord = useCallback(async (id: string, dto: Partial<OcrRecordItem>): Promise<OcrRecordItem> => {
    setLoading(true);
    setError(null);
    const cleanDto = { ...dto };
    delete cleanDto.id;
    delete cleanDto.created_at;
    delete cleanDto.updated_at;

    if (cleanDto.total_amount !== undefined) {
      cleanDto.total_amount = Number(cleanDto.total_amount) || 0;
    }
    if (cleanDto.confidence_score !== undefined) {
      cleanDto.confidence_score = Number(cleanDto.confidence_score) || 0.95;
    }
    if (cleanDto.execution_time_ms !== undefined) {
      cleanDto.execution_time_ms = Number(cleanDto.execution_time_ms) || 300;
    }

    try {
      return await apiClient<OcrRecordItem>(`/ocr-records/${id}`, {
        method: 'PATCH',
        body: cleanDto,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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

  // ── Async OCR: Gửi ảnh vào BullMQ queue và poll job status ────────────

  /**
   * Gửi file ảnh đến BullMQ OCR queue qua NestJS → trả về jobId.
   * OcrProcessor sẽ xử lý async và persist kết quả vào ocr_records.
   */
  const submitImage = useCallback(async (file: File): Promise<{ jobId: string }> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // apiClient tự detect FormData → bỏ Content-Type header để browser set boundary
      return await apiClient<{ jobId: string }>('/api/ai/ocr', {
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

  /**
   * Poll trạng thái một OCR job từ BullMQ queue.
   * Gọi lặp lại với setInterval cho đến khi state = 'completed' | 'failed'.
   */
  const pollJobStatus = useCallback(async (jobId: string): Promise<OcrJobStatus> => {
    return await apiClient<OcrJobStatus>(`/api/ai-tasks/ocr/${jobId}/status`);
  }, []);

  return {
    loading,
    error,
    // CRUD
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    // Async OCR Queue
    submitImage,
    pollJobStatus,
  };
}

