import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import { LoginDto, RegisterDto, AuthResponseDto } from '@/types/common/auth';
import { User } from '@/types/entities/user';

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
        localStorage.setItem('user', JSON.stringify(response.user));
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
        localStorage.setItem('user', JSON.stringify(response.user));
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
    } catch {
      // Bỏ qua lỗi kết nối API khi đăng xuất
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
      setLoading(false);
    }
  }, []);

  const isAuthenticated = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  }, []);

  const getCurrentUser = useCallback((): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }, []);

  return {
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated,
    getCurrentUser,
  };
}
