import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import {
  Payment,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentStatus,
  PaymentMethod,
} from '@/types/api';

export function usePayments() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createPayment = useCallback(async (dto: CreatePaymentDto): Promise<Payment> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Payment>('/payments', {
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

  const findAllPayments = useCallback(async (params?: { limit?: number; offset?: number }): Promise<Payment[]> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Payment[]>('/payments', {
        params,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const countAllPayments = useCallback(async (): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<number>('/payments/count/all');
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const countPaymentsBy = useCallback(async (filters?: {
    order_id?: number;
    payment_status?: PaymentStatus;
    payment_method?: PaymentMethod;
  }): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: Record<string, string> = {};
      if (filters?.order_id !== undefined) queryParams.order_id = String(filters.order_id);
      if (filters?.payment_status) queryParams.payment_status = filters.payment_status;
      if (filters?.payment_method) queryParams.payment_method = filters.payment_method;

      return await apiClient<number>('/payments/count/by', {
        params: queryParams,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const findOnePayment = useCallback(async (id: number): Promise<Payment> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Payment>(`/payments/${id}`);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePayment = useCallback(async (id: number, dto: UpdatePaymentDto): Promise<Payment> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Payment>(`/payments/${id}`, {
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

  const removePayment = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient<void>(`/payments/${id}`, {
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
    createPayment,
    findAllPayments,
    countAllPayments,
    countPaymentsBy,
    findOnePayment,
    updatePayment,
    removePayment,
  };
}
