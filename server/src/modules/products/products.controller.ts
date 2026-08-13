import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { Product } from './entities/product.entity';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({ status: 201, type: Product })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, type: [Product] })
  findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.productsService.findAll(limit || 10, offset || 0);
  }

  @Get('count/all')
  @ApiOperation({ summary: 'Count all products' })
  @ApiResponse({ status: 200, type: Number })
  countAll() {
    return this.productsService.countAll();
  }

  @Get('count/by')
  @ApiOperation({ summary: 'Count products by filter' })
  @ApiQuery({ name: 'category_id', required: false, type: String })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, type: Number })
  countBy(
    @Query('category_id') categoryId?: string,
    @Query('status') status?: string,
  ) {
    const filters: Record<string, any> = {};
    if (categoryId) filters.category_id = categoryId;
    if (status) filters.status = status;
    return this.productsService.countBy(filters);
  }

  @Get('search/hybrid')
  @ApiOperation({
    summary: 'Hybrid search for products (Semantic Vector + Keyword)',
  })
  @ApiQuery({ name: 'query', required: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  hybridSearch(
    @Query('query') query: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.productsService.hybridSearch(query, limit || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, type: Product })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, type: Product })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
