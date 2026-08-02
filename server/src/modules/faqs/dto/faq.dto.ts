import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({ example: 'Shipping' })
  @IsString()
  topic: string;

  @ApiProperty({ example: 'How long does shipping take?' })
  @IsString()
  question: string;

  @ApiProperty({ example: 'Standard shipping takes 3-5 business days.' })
  @IsString()
  answer: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateFaqDto extends PartialType(CreateFaqDto) {}
