import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  full_name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+84987654321', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password?: string;

  @ApiProperty({
    example: 'CUSTOMER',
    enum: ['CUSTOMER', 'ADMIN', 'SUPPORT'],
    default: 'CUSTOMER',
  })
  @IsOptional()
  @IsEnum(['CUSTOMER', 'ADMIN', 'SUPPORT'])
  role?: 'CUSTOMER' | 'ADMIN' | 'SUPPORT';

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatar_url?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class CreateUserAddressDto {
  @ApiProperty({ example: 'John Doe Address' })
  @IsString()
  recipient_name: string;

  @ApiProperty({ example: '+84987654321' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  street_address: string;

  @ApiProperty({ example: 'Ward 5', required: false })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiProperty({ example: 'District 1' })
  @IsString()
  district: string;

  @ApiProperty({ example: 'Ho Chi Minh City' })
  @IsString()
  city_province: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

export class UpdateUserAddressDto extends PartialType(CreateUserAddressDto) {}
