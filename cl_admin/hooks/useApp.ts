import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';

export function useApp() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const getHello = useCallback(async (): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient<string>('/');
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getHello,
    loading,
    error,
  };
}
