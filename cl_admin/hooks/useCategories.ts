import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/entities/category';

export function useCategories() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createCategory = useCallback(async (dto: CreateCategoryDto): Promise<Category> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Category>('/categories', {
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

  const findAllCategories = useCallback(async (params?: { limit?: number; offset?: number }): Promise<Category[]> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Category[]>('/categories', {
        params,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const countAllCategories = useCallback(async (): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<number>('/categories/count/all');
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const countCategoriesBy = useCallback(async (filters?: { parent_id?: number }): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: Record<string, string> = {};
      if (filters?.parent_id !== undefined) queryParams.parent_id = String(filters.parent_id);

      return await apiClient<number>('/categories/count/by', {
        params: queryParams,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const findOneCategory = useCallback(async (id: string): Promise<Category> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Category>(`/categories/${id}`);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, dto: UpdateCategoryDto): Promise<Category> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<Category>(`/categories/${id}`, {
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

  const removeCategory = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient<void>(`/categories/${id}`, {
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
    createCategory,
    findAllCategories,
    countAllCategories,
    countCategoriesBy,
    findOneCategory,
    updateCategory,
    removeCategory,
  };
}
