import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import { OcrRecordItem } from '@/components/pages/OcrPage/sections';

export function useOcrRecords() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecords = useCallback(async (params?: { limit?: number; offset?: number; document_type?: string; status?: string; search?: string }): Promise<OcrRecordItem[]> => {
    setLoading(true);
    setError(null);
    try {
      const records = await apiClient<OcrRecordItem[]>('/ocr-records', {
        params: params as Record<string, string | number | boolean>,
      });
      return records;
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

  return {
    loading,
    error,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
  };
}
