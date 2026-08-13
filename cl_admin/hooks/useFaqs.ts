import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import { Faq, CreateFaqDto, UpdateFaqDto } from '@/types/common/faq';

export function useFaqs() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createFaq = useCallback(async (dto: CreateFaqDto): Promise<Faq> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Faq>('/faqs', {
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

  const findAllFaqs = useCallback(async (params?: { limit?: number; offset?: number }): Promise<Faq[]> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Faq[]>('/faqs', {
        params,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const countAllFaqs = useCallback(async (): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<number>('/faqs/count/all');
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const countFaqsBy = useCallback(async (filters?: { topic?: string; is_active?: boolean }): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: Record<string, string> = {};
      if (filters?.topic) queryParams.topic = filters.topic;
      if (filters?.is_active !== undefined) queryParams.is_active = String(filters.is_active);

      return await apiClient<number>('/faqs/count/by', {
        params: queryParams,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const findOneFaq = useCallback(async (id: string): Promise<Faq> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Faq>(`/faqs/${id}`);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFaq = useCallback(async (id: string, dto: UpdateFaqDto): Promise<Faq> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Faq>(`/faqs/${id}`, {
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

  const removeFaq = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient<void>(`/faqs/${id}`, {
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
    createFaq,
    findAllFaqs,
    countAllFaqs,
    countFaqsBy,
    findOneFaq,
    updateFaq,
    removeFaq,
  };
}
