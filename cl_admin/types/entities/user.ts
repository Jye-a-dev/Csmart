export interface User {
  id: string;
  uuid: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPPORT';
  is_active: boolean;
  avatar_url?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  recipient_name: string;
  phone: string;
  street_address: string;
  ward?: string;
  district: string;
  city_province: string;
  is_default: boolean;
  created_at: string;
}

export interface CreateUserDto {
  full_name: string;
  email: string;
  phone?: string;
  password?: string;
  role?: 'CUSTOMER' | 'ADMIN' | 'SUPPORT';
  is_active?: boolean;
  avatar_url?: string;
}

export type UpdateUserDto = Partial<CreateUserDto>;

export interface CreateUserAddressDto {
  recipient_name: string;
  phone: string;
  street_address: string;
  ward?: string;
  district: string;
  city_province: string;
  is_default?: boolean;
}

export type UpdateUserAddressDto = Partial<CreateUserAddressDto>;
