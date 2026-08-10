import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'electronics' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'Electronic gadgets and items', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsUUID()
  parent_id?: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
