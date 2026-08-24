import { User } from '../entities/user';

export interface LoginDto {
  email: string;
  password?: string;
}

export interface RegisterDto {
  full_name: string;
  email: string;
  password?: string;
  phone?: string;
}

export interface AuthResponseDto {
  access_token: string;
  user: User;
}
