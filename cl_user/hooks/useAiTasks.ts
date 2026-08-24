import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import {
  IntentRequestDto,
  IntentResponseDto,
  NerRequestDto,
  NerResponseDto,
  SearchRequestDto,
  SqlRequestDto,
  SubmitOcrResponse,
  SubmitEvaluateResponse,
  JobStatusResponse,
  CircuitBreakerState,
} from '@/types/ai/task';
import { Product } from '@/types/entities/product';

export function useAiTasks() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Phân loại ý định & bóc tách thuộc tính mua sắm
  const classifyIntent = useCallback(async (dto: IntentRequestDto): Promise<IntentResponseDto> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<IntentResponseDto>('/ai/intent', {
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

  // Bóc tách thực thể NER (mã đơn hàng, địa chỉ mới - Role SUPPORT, ADMIN)
  const extractNer = useCallback(async (dto: NerRequestDto): Promise<NerResponseDto> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<NerResponseDto>('/ai/ner', {
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

  // Tìm kiếm sản phẩm Hybrid qua AI Proxy
  const searchHybrid = useCallback(async (dto: SearchRequestDto): Promise<Product[]> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Product[]>('/ai/search', {
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

  // Text-to-SQL (Chuyển câu hỏi sang truy vấn SQL - Role SUPPORT, ADMIN)
  const textToSql = useCallback(async (dto: SqlRequestDto): Promise<{ status: string; generated_sql: string; confidence_score: number }> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<{ status: string; generated_sql: string; confidence_score: number }>('/ai/sql', {
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

  // Đưa ảnh vào hàng đợi BullMQ OCR (Role SUPPORT, ADMIN)
  const submitOcr = useCallback(async (file: File): Promise<SubmitOcrResponse> => {
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

  // Đưa ảnh vào BullMQ OCR task trực tiếp qua module ai-tasks
  const submitDirectOcr = useCallback(async (file: File): Promise<SubmitOcrResponse> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      return await apiClient<SubmitOcrResponse>('/ai-tasks/ocr', {
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

  // Đưa tác vụ tự đánh giá vào BullMQ
  const submitEvaluate = useCallback(async (): Promise<SubmitEvaluateResponse> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<SubmitEvaluateResponse>('/ai-tasks/evaluate', {
        method: 'POST',
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Kiểm tra trạng thái Background Job từ BullMQ
  const getStatus = useCallback(async (queue: 'ocr' | 'eval', jobId: string): Promise<JobStatusResponse> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<JobStatusResponse>(`/ai-tasks/status/${queue}/${jobId}`);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Kiểm tra trạng thái Circuit Breaker kết nối tới AI Engine
  const getCircuitStatus = useCallback(async (): Promise<CircuitBreakerState> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<CircuitBreakerState>('/ai-tasks/circuit-breaker');
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
    classifyIntent,
    extractNer,
    searchHybrid,
    textToSql,
    submitOcr,
    submitDirectOcr,
    submitEvaluate,
    getStatus,
    getCircuitStatus,
  };
}
