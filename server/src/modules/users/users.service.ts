import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateUserAddressDto,
  UpdateUserAddressDto,
} from './dto/user.dto';
import { User, UserAddress } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findUserByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : '';
    return this.usersRepository.createUser(dto, passwordHash);
  }

  async findAll(limit?: number, offset?: number): Promise<User[]> {
    return this.usersRepository.findAllUsers(limit, offset);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(
    email: string,
  ): Promise<(User & { password_hash: string }) | null> {
    return this.usersRepository.findUserByEmail(email);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findOne(id);
    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }
    const updated = await this.usersRepository.updateUser(
      id,
      dto,
      passwordHash,
    );
    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.usersRepository.deleteUser(id);
  }

  async countAll(): Promise<number> {
    return this.usersRepository.countAll('users');
  }

  async countBy(filters: Record<string, any>): Promise<number> {
    return this.usersRepository.countBy('users', filters);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.updateLastLogin(id);
  }

  // Address operations
  async createAddress(
    userId: string,
    dto: CreateUserAddressDto,
  ): Promise<UserAddress> {
    await this.findOne(userId);
    return this.usersRepository.createAddress(userId, dto);
  }

  async findAddresses(userId: string): Promise<UserAddress[]> {
    await this.findOne(userId);
    return this.usersRepository.findAddressesByUserId(userId);
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateUserAddressDto,
  ): Promise<UserAddress> {
    const address = await this.usersRepository.findAddressById(addressId);
    if (!address || address.user_id !== userId) {
      throw new NotFoundException(
        `Address with ID ${addressId} not found for this user`,
      );
    }
    const updated = await this.usersRepository.updateAddress(
      addressId,
      userId,
      dto,
    );
    if (!updated) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }
    return updated;
  }

  async removeAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.usersRepository.findAddressById(addressId);
    if (!address || address.user_id !== userId) {
      throw new NotFoundException(
        `Address with ID ${addressId} not found for this user`,
      );
    }
    await this.usersRepository.deleteAddress(addressId);
  }
}
