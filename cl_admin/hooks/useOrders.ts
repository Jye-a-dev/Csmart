import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import { Order, CreateOrderDto, UpdateOrderDto, OrderStatus } from '@/types/api';

export function useOrders() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createOrder = useCallback(async (dto: CreateOrderDto): Promise<Order> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Order>('/orders', {
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

  const findAllOrders = useCallback(async (params?: { limit?: number; offset?: number }): Promise<Order[]> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Order[]>('/orders', {
        params,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const countAllOrders = useCallback(async (): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<number>('/orders/count/all');
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const countOrdersBy = useCallback(async (filters?: { user_id?: number; status?: OrderStatus }): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: Record<string, string> = {};
      if (filters?.user_id !== undefined) queryParams.user_id = String(filters.user_id);
      if (filters?.status) queryParams.status = filters.status;

      return await apiClient<number>('/orders/count/by', {
        params: queryParams,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const findOneOrder = useCallback(async (id: number): Promise<Order> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Order>(`/orders/${id}`);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrder = useCallback(async (id: number, dto: UpdateOrderDto): Promise<Order> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Order>(`/orders/${id}`, {
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

  const removeOrder = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient<void>(`/orders/${id}`, {
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
    createOrder,
    findAllOrders,
    countAllOrders,
    countOrdersBy,
    findOneOrder,
    updateOrder,
    removeOrder,
  };
}
