import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import {
  HitlItem,
  HitlStatus,
  ApproveReviewDto,
  RejectReviewDto,
  LabelReviewDto,
} from '@/types/ai/hitl';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function useHitl() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Lấy danh sách hàng đợi HITL (Roles: SUPPORT, ADMIN)
  const fetchQueue = useCallback(async (params?: {
    status?: HitlStatus;
    limit?: number;
    offset?: number;
  }): Promise<HitlItem[]> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<HitlItem[]>('/hitl/queue', {
        params: params as Record<string, string | number | boolean>,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Đếm số lượng item theo trạng thái (Roles: SUPPORT, ADMIN)
  const countQueue = useCallback(async (status?: HitlStatus): Promise<number> => {
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
  }, []);

  // Xem chi tiết một review item (Roles: SUPPORT, ADMIN)
  const findOneQueueItem = useCallback(async (id: string): Promise<HitlItem> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<HitlItem>(`/hitl/queue/${id}`);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Phê duyệt kết quả AI - APPROVED (Roles: SUPPORT, ADMIN)
  const approveItem = useCallback(async (id: string, dto: ApproveReviewDto = {}): Promise<HitlItem> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<HitlItem>(`/hitl/queue/${id}/approve`, {
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

  // Từ chối kết quả AI - REJECTED (Roles: SUPPORT, ADMIN)
  const rejectItem = useCallback(async (id: string, dto: RejectReviewDto = {}): Promise<HitlItem> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<HitlItem>(`/hitl/queue/${id}/reject`, {
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

  // Gán nhãn hiệu chỉnh cho kết quả AI - LABELLED (Roles: ADMIN)
  const labelItem = useCallback(async (id: string, dto: LabelReviewDto): Promise<HitlItem> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<HitlItem>(`/hitl/queue/${id}/label`, {
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

  // Tải file JSONL fine-tuning dataset (Roles: ADMIN)
  const exportDataset = useCallback(async (): Promise<Blob> => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(`${BASE_URL}/hitl/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error(`Export failed with status: ${res.status}`);
      }
      return await res.blob();
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
    fetchQueue,
    countQueue,
    findOneQueueItem,
    approveItem,
    rejectItem,
    labelItem,
    exportDataset,
  };
}
