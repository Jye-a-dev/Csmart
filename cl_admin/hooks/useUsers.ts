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

  const findOneUser = useCallback(async (id: number): Promise<User> => {
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

  const updateUser = useCallback(async (id: number, dto: UpdateUserDto): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      return await apiClient<User>(`/users/${id}`, {
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

  const removeUser = useCallback(async (id: number): Promise<void> => {
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

  // User Address Methods
  const createAddress = useCallback(async (userId: number, dto: CreateUserAddressDto): Promise<UserAddress> => {
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

  const findAddresses = useCallback(async (userId: number): Promise<UserAddress[]> => {
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

  const updateAddress = useCallback(async (
    userId: number,
    addressId: number,
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

  const removeAddress = useCallback(async (userId: number, addressId: number): Promise<void> => {
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

  return {
    loading,
    error,
    createUser,
    findAllUsers,
    countAllUsers,
    countUsersBy,
    findOneUser,
    updateUser,
    removeUser,
    createAddress,
    findAddresses,
    updateAddress,
    removeAddress,
  };
}
