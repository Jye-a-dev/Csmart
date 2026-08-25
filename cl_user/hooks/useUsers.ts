import { useState, useCallback } from 'react';
import { apiClient } from '@/libs/api-client';
import {
  User,
  UserAddress,
  CreateUserDto,
  UpdateUserDto,
  CreateUserAddressDto,
  UpdateUserAddressDto,
} from '@/types/entities/user';

export function useUsers() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Lấy thông tin chi tiết người dùng
  const findOneUser = useCallback(async (id: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<User>(`/users/${id}`);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật thông tin profile người dùng
  const updateUser = useCallback(async (id: string, dto: UpdateUserDto): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await apiClient<User>(`/users/${id}`, {
        method: 'PATCH',
        body: dto,
      });
      // Cập nhật localStorage nếu đang update user hiện tại
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.id === id) {
              localStorage.setItem('user', JSON.stringify({ ...parsed, ...updatedUser }));
            }
          } catch {
            // Ignore
          }
        }
      }
      return updatedUser;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy danh sách địa chỉ nhận hàng của người dùng
  const findAddresses = useCallback(async (userId: string): Promise<UserAddress[]> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<UserAddress[]>(`/users/${userId}/addresses`);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Thêm mới địa chỉ nhận hàng cho người dùng
  const createAddress = useCallback(async (userId: string, dto: CreateUserAddressDto): Promise<UserAddress> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<UserAddress>(`/users/${userId}/addresses`, {
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

  // Cập nhật địa chỉ nhận hàng
  const updateAddress = useCallback(async (
    userId: string,
    addressId: string,
    dto: UpdateUserAddressDto
  ): Promise<UserAddress> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<UserAddress>(`/users/${userId}/addresses/${addressId}`, {
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

  // Xóa địa chỉ nhận hàng
  const removeAddress = useCallback(async (userId: string, addressId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient<void>(`/users/${userId}/addresses/${addressId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo người dùng mới
  const createUser = useCallback(async (dto: CreateUserDto): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<User>('/users', {
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

  // Lấy danh sách tất cả người dùng
  const findAllUsers = useCallback(async (params?: { limit?: number; offset?: number }): Promise<User[]> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<User[]>('/users', {
        params,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Đếm tổng số người dùng
  const countAllUsers = useCallback(async (): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<number>('/users/count/all');
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Đếm người dùng theo bộ lọc
  const countUsersBy = useCallback(async (filters?: {
    role?: string;
    is_active?: boolean;
  }): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: Record<string, string> = {};
      if (filters?.role) queryParams.role = filters.role;
      if (filters?.is_active !== undefined) queryParams.is_active = String(filters.is_active);

      return await apiClient<number>('/users/count/by', {
        params: queryParams,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Xóa người dùng
  const removeUser = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient<void>(`/users/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy điểm thưởng và thống kê người dùng
  const getUserStats = useCallback(async (id: string): Promise<{ points: number; total_orders: number; total_spent: number; membership_tier: string }> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<{ points: number; total_orders: number; total_spent: number; membership_tier: string }>(`/users/${id}/stats`);
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
    findOneUser,
    getUserStats,
    updateUser,
    findAddresses,
    createAddress,
    updateAddress,
    removeAddress,
    createUser,
    findAllUsers,
    countAllUsers,
    countUsersBy,
    removeUser,
  };
}
