import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import {
  SubmitOcrResponse,
  SubmitEvaluateResponse,
  JobStatusResponse,
  CircuitBreakerState,
} from '@/types/api';

export function useAiTasks() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const submitOcr = useCallback(async (file: File): Promise<SubmitOcrResponse> => {
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
    submitOcr,
    submitEvaluate,
    getStatus,
    getCircuitStatus,
  };
}
