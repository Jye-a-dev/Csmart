import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import { Product, CreateProductDto, UpdateProductDto, ProductStatus } from '@/types/api';

export function useProducts() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createProduct = useCallback(async (dto: CreateProductDto): Promise<Product> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Product>('/products', {
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

  const findAllProducts = useCallback(async (params?: { limit?: number; offset?: number }): Promise<Product[]> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Product[]>('/products', {
        params,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const countAllProducts = useCallback(async (): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<number>('/products/count/all');
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const countProductsBy = useCallback(async (filters?: {
    category_id?: number;
    status?: ProductStatus;
  }): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: Record<string, string> = {};
      if (filters?.category_id !== undefined) queryParams.category_id = String(filters.category_id);
      if (filters?.status) queryParams.status = filters.status;

      return await apiClient<number>('/products/count/by', {
        params: queryParams,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const hybridSearch = useCallback(async (query: string, limit?: number): Promise<Product[]> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Product[]>('/products/search/hybrid', {
        params: { query, limit },
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const findOneProduct = useCallback(async (id: number): Promise<Product> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Product>(`/products/${id}`);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: number, dto: UpdateProductDto): Promise<Product> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Product>(`/products/${id}`, {
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

  const removeProduct = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient<void>(`/products/${id}`, {
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
    createProduct,
    findAllProducts,
    countAllProducts,
    countProductsBy,
    hybridSearch,
    findOneProduct,
    updateProduct,
    removeProduct,
  };
}
