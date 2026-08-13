import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/base.repository';
import { User, UserAddress } from '../entities/user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateUserAddressDto,
  UpdateUserAddressDto,
} from '../dto/user.dto';

@Injectable()
export class UsersRepository extends BaseRepository {
  async createUser(dto: CreateUserDto, passwordHash: string): Promise<User> {
    const sql = `
      INSERT INTO users (full_name, email, phone, password_hash, role, is_active, avatar_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, id AS uuid, full_name, email, phone, role, is_active, avatar_url, last_login_at, created_at, updated_at
    `;
    const params = [
      dto.full_name,
      dto.email.toLowerCase(),
      dto.phone || null,
      passwordHash,
      dto.role || 'CUSTOMER',
      dto.is_active !== undefined ? dto.is_active : true,
      dto.avatar_url || null,
    ];
    return (await this.queryOne<User>(sql, params))!;
  }

  async findAllUsers(limit = 10, offset = 0): Promise<User[]> {
    const sql = `
      SELECT id, id AS uuid, full_name, email, phone, role, is_active, avatar_url, last_login_at, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    return this.query<User>(sql, [limit, offset]);
  }

  async findUserById(id: string): Promise<User | null> {
    const sql = `
      SELECT id, id AS uuid, full_name, email, phone, role, is_active, avatar_url, last_login_at, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    return this.queryOne<User>(sql, [id]);
  }

  async findUserByEmail(
    email: string,
  ): Promise<(User & { password_hash: string }) | null> {
    const sql = `
      SELECT id, id AS uuid, full_name, email, phone, password_hash, role, is_active, avatar_url, last_login_at, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    return this.queryOne<User & { password_hash: string }>(sql, [
      email.toLowerCase(),
    ]);
  }

  async findUserByUuid(uuid: string): Promise<User | null> {
    const sql = `
      SELECT id, id AS uuid, full_name, email, phone, role, is_active, avatar_url, last_login_at, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    return this.queryOne<User>(sql, [uuid]);
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
    passwordHash?: string,
  ): Promise<User | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.full_name !== undefined) {
      updates.push(`full_name = $${paramIndex++}`);
      params.push(dto.full_name);
    }
    if (dto.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(dto.email.toLowerCase());
    }
    if (dto.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      params.push(dto.phone);
    }
    if (passwordHash !== undefined) {
      updates.push(`password_hash = $${paramIndex++}`);
      params.push(passwordHash);
    }
    if (dto.role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      params.push(dto.role);
    }
    if (dto.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(dto.is_active);
    }
    if (dto.avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      params.push(dto.avatar_url);
    }

    if (updates.length === 0) {
      return this.findUserById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    const sql = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, id AS uuid, full_name, email, phone, role, is_active, avatar_url, last_login_at, created_at, updated_at
    `;
    return this.queryOne<User>(sql, params);
  }

  async deleteUser(id: string): Promise<boolean> {
    const sql = `DELETE FROM users WHERE id = $1 RETURNING id`;
    const res = await this.queryOne<{ id: string }>(sql, [id]);
    return !!res;
  }

  async updateLastLogin(id: string): Promise<void> {
    const sql = `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`;
    await this.query(sql, [id]);
  }

  // ADDRESSES
  async createAddress(
    userId: string,
    dto: CreateUserAddressDto,
  ): Promise<UserAddress> {
    if (dto.is_default) {
      await this.query(
        'UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1',
        [userId],
      );
    }
    const sql = `
      INSERT INTO user_addresses (user_id, recipient_name, phone, street_address, ward, district, city_province, is_default)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, user_id, recipient_name, phone, street_address, ward, district, city_province, is_default, created_at
    `;
    const params = [
      userId,
      dto.recipient_name,
      dto.phone,
      dto.street_address,
      dto.ward || null,
      dto.district,
      dto.city_province,
      dto.is_default !== undefined ? dto.is_default : false,
    ];
    return (await this.queryOne<UserAddress>(sql, params))!;
  }

  async findAddressesByUserId(userId: string): Promise<UserAddress[]> {
    const sql = `
      SELECT id, user_id, recipient_name, phone, street_address, ward, district, city_province, is_default, created_at
      FROM user_addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, id DESC
    `;
    return this.query<UserAddress>(sql, [userId]);
  }

  async findAddressById(id: string): Promise<UserAddress | null> {
    const sql = `
      SELECT id, user_id, recipient_name, phone, street_address, ward, district, city_province, is_default, created_at
      FROM user_addresses
      WHERE id = $1
    `;
    return this.queryOne<UserAddress>(sql, [id]);
  }

  async updateAddress(
    id: string,
    userId: string,
    dto: UpdateUserAddressDto,
  ): Promise<UserAddress | null> {
    if (dto.is_default) {
      await this.query(
        'UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1',
        [userId],
      );
    }
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.recipient_name !== undefined) {
      updates.push(`recipient_name = $${paramIndex++}`);
      params.push(dto.recipient_name);
    }
    if (dto.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      params.push(dto.phone);
    }
    if (dto.street_address !== undefined) {
      updates.push(`street_address = $${paramIndex++}`);
      params.push(dto.street_address);
    }
    if (dto.ward !== undefined) {
      updates.push(`ward = $${paramIndex++}`);
      params.push(dto.ward);
    }
    if (dto.district !== undefined) {
      updates.push(`district = $${paramIndex++}`);
      params.push(dto.district);
    }
    if (dto.city_province !== undefined) {
      updates.push(`city_province = $${paramIndex++}`);
      params.push(dto.city_province);
    }
    if (dto.is_default !== undefined) {
      updates.push(`is_default = $${paramIndex++}`);
      params.push(dto.is_default);
    }

    if (updates.length === 0) {
      return this.findAddressById(id);
    }

    params.push(id);
    const sql = `
      UPDATE user_addresses
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, user_id, recipient_name, phone, street_address, ward, district, city_province, is_default, created_at
    `;
    return this.queryOne<UserAddress>(sql, params);
  }

  async deleteAddress(id: string): Promise<boolean> {
    const sql = `DELETE FROM user_addresses WHERE id = $1 RETURNING id`;
    const res = await this.queryOne<{ id: string }>(sql, [id]);
    return !!res;
  }
}
