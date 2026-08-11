import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }: { value: unknown }) =>
    value === '' || value === 'null' || value === 'undefined' ? null : value,
  )
  @IsString()
  parent_id?: string | null;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsString()
  image_url_1?: string | null;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsString()
  image_url_2?: string | null;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
