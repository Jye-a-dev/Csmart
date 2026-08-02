import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'f3b8908d-ef57-4b71-b851-bc012dfcb67c' })
  uuid: string;

  @ApiProperty({ example: 'John Doe' })
  full_name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: '+84987654321', required: false })
  phone?: string;

  @ApiProperty({ example: 'CUSTOMER' })
  role: 'CUSTOMER' | 'ADMIN' | 'SUPPORT';

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  avatar_url?: string;

  @ApiProperty({ example: '2026-08-02T22:06:59.000Z', required: false })
  last_login_at?: Date;

  @ApiProperty({ example: '2026-08-02T22:06:59.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2026-08-02T22:06:59.000Z' })
  updated_at: Date;
}

export class UserAddress {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  user_id: number;

  @ApiProperty({ example: 'John Doe' })
  recipient_name: string;

  @ApiProperty({ example: '+84987654321' })
  phone: string;

  @ApiProperty({ example: '123 Main St' })
  street_address: string;

  @ApiProperty({ example: 'Ward 5', required: false })
  ward?: string;

  @ApiProperty({ example: 'District 1' })
  district: string;

  @ApiProperty({ example: 'Ho Chi Minh City' })
  city_province: string;

  @ApiProperty({ example: false })
  is_default: boolean;

  @ApiProperty({ example: '2026-08-02T22:06:59.000Z' })
  created_at: Date;
}
