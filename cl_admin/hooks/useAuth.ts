import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import { LoginDto, RegisterDto, AuthResponseDto } from '@/types/api';

export function useAuth() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const register = useCallback(async (dto: RegisterDto): Promise<AuthResponseDto> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient<AuthResponseDto>('/auth/register', {
        method: 'POST',
        body: dto,
      });
      if (typeof window !== 'undefined' && response.access_token) {
        localStorage.setItem('access_token', response.access_token);
      }
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (dto: LoginDto): Promise<AuthResponseDto> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient<AuthResponseDto>('/auth/login', {
        method: 'POST',
        body: dto,
      });
      if (typeof window !== 'undefined' && response.access_token) {
        localStorage.setItem('access_token', response.access_token);
      }
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient<void>('/auth/logout', {
        method: 'POST',
      });
    } catch (err) {
      setError(err as Error);
      // Even if API request fails, we should clear the local token
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
      }
      setLoading(false);
    }
  }, []);

  const isAuthenticated = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  }, []);

  return {
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated,
  };
}
