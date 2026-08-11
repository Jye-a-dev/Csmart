import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class IntentRequestDto {
  @ApiProperty({
    example: 'Tìm áo thun nam màu trắng size L dưới 300k',
    description: 'Câu truy vấn mua sắm của người dùng',
  })
  @IsString()
  @IsNotEmpty()
  query: string;
}

export class NerRequestDto {
  @ApiProperty({
    example: 'Hủy đơn hàng số 54321 giúp tôi',
    description: 'Đoạn văn bản cần trích xuất thực thể',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class SearchRequestDto {
  @ApiProperty({
    example: 'áo thun trắng nam',
    description: 'Câu truy vấn tìm kiếm sản phẩm',
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({ example: 10, required: false, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class SqlRequestDto {
  @ApiProperty({
    example: 'Liệt kê top 5 sản phẩm bán chạy nhất',
    description: 'Câu hỏi ngôn ngữ tự nhiên cần chuyển sang SQL',
  })
  @IsString()
  @IsNotEmpty()
  question: string;
}
