import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import {
  AiRequestLog,
  CreateAiRequestLogDto,
  UpdateAiRequestLogDto,
} from '@/types/ai/log';

export function useAiLogs() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createLog = useCallback(async (dto: CreateAiRequestLogDto): Promise<AiRequestLog> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<AiRequestLog>('/ai-logs', {
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

  const findAllLogs = useCallback(async (params?: { limit?: number; offset?: number }): Promise<AiRequestLog[]> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<AiRequestLog[]>('/ai-logs', {
        params,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const countAllLogs = useCallback(async (): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<number>('/ai-logs/count/all');
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const countLogsBy = useCallback(async (filters?: { endpoint?: string; flag_for_review?: boolean }): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: Record<string, string> = {};
      if (filters?.endpoint) queryParams.endpoint = filters.endpoint;
      if (filters?.flag_for_review !== undefined) queryParams.flag_for_review = String(filters.flag_for_review);

      return await apiClient<number>('/ai-logs/count/by', {
        params: queryParams,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const findOneLog = useCallback(async (id: number): Promise<AiRequestLog> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<AiRequestLog>(`/ai-logs/${id}`);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLog = useCallback(async (id: number, dto: UpdateAiRequestLogDto): Promise<AiRequestLog> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<AiRequestLog>(`/ai-logs/${id}`, {
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

  const removeLog = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient<void>(`/ai-logs/${id}`, {
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
    createLog,
    findAllLogs,
    countAllLogs,
    countLogsBy,
    findOneLog,
    updateLog,
    removeLog,
  };
}
