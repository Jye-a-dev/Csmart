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
