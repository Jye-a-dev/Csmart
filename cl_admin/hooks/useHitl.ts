import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import {
  ReviewQueueItem,
  HitlStatus,
  ApproveReviewDto,
  RejectReviewDto,
  LabelReviewDto,
} from '@/types/ai/hitl';

export function useHitl() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const findAllQueue = useCallback(
    async (params?: {
      status?: HitlStatus;
      limit?: number;
      offset?: number;
    }): Promise<ReviewQueueItem[]> => {
      setLoading(true);
      setError(null);
      try {
        return await apiClient<ReviewQueueItem[]>('/hitl/queue', {
          params,
        });
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const countQueue = useCallback(
    async (status?: HitlStatus): Promise<number> => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient<{ count: number }>('/hitl/queue/count', {
          params: status ? { status } : undefined,
        });
        return res.count;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const findOneQueueItem = useCallback(
    async (id: string): Promise<ReviewQueueItem> => {
      setLoading(true);
      setError(null);
      try {
        return await apiClient<ReviewQueueItem>(`/hitl/queue/${id}`);
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const approveQueueItem = useCallback(
    async (id: string, dto: ApproveReviewDto = {}): Promise<ReviewQueueItem> => {
      setLoading(true);
      setError(null);
      try {
        return await apiClient<ReviewQueueItem>(`/hitl/queue/${id}/approve`, {
          method: 'PATCH',
          body: dto,
        });
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const rejectQueueItem = useCallback(
    async (id: string, dto: RejectReviewDto = {}): Promise<ReviewQueueItem> => {
      setLoading(true);
      setError(null);
      try {
        return await apiClient<ReviewQueueItem>(`/hitl/queue/${id}/reject`, {
          method: 'PATCH',
          body: dto,
        });
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const labelQueueItem = useCallback(
    async (id: string, dto: LabelReviewDto): Promise<ReviewQueueItem> => {
      setLoading(true);
      setError(null);
      try {
        return await apiClient<ReviewQueueItem>(`/hitl/queue/${id}/label`, {
          method: 'PATCH',
          body: dto,
        });
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    findAllQueue,
    countQueue,
    findOneQueueItem,
    approveQueueItem,
    rejectQueueItem,
    labelQueueItem,
  };
}

