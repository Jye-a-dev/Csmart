import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './repositories/products.repository';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(dto: CreateProductDto): Promise<Product> {
    return this.productsRepository.createProduct(dto);
  }

  async findAll(limit?: number, offset?: number): Promise<Product[]> {
    return this.productsRepository.findAllProducts(limit, offset);
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findProductById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    await this.findOne(id);
    const updated = await this.productsRepository.updateProduct(id, dto);
    if (!updated) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.productsRepository.deleteProduct(id);
  }

  async countAll(): Promise<number> {
    return this.productsRepository.countAll('products');
  }

  async countBy(filters: Record<string, any>): Promise<number> {
    return this.productsRepository.countBy('products', filters);
  }
}
