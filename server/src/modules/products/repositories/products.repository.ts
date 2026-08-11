import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/base.repository';
import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';

@Injectable()
export class ProductsRepository extends BaseRepository {
  async createProduct(dto: CreateProductDto): Promise<Product> {
    const sql = `
      INSERT INTO products (
        sku, name, slug, category_id, description, short_description, specifications, colors, base_price, 
        discount_price, stock_quantity, status, is_published, tags, attributes, images
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id, sku, name, slug, category_id, description, short_description, specifications, colors, base_price, 
                discount_price, stock_quantity, status, is_published, tags, attributes, images, created_at, updated_at
    `;
    const params = [
      dto.sku,
      dto.name,
      dto.slug,
      dto.category_id || null,
      dto.description || null,
      dto.short_description || null,
      dto.specifications || null,
      dto.colors ? JSON.stringify(dto.colors) : '[]',
      dto.base_price,
      dto.discount_price !== undefined ? dto.discount_price : null,
      dto.stock_quantity !== undefined ? dto.stock_quantity : 0,
      dto.status || 'IN_STOCK',
      dto.is_published !== undefined ? dto.is_published : true,
      dto.tags || null,
      dto.attributes ? JSON.stringify(dto.attributes) : '{}',
      dto.images || [],
    ];
    return (await this.queryOne<Product>(sql, params))!;
  }

  async findAllProducts(limit = 10, offset = 0): Promise<Product[]> {
    const sql = `
      SELECT id, sku, name, slug, category_id, description, short_description, specifications, colors, base_price, 
             discount_price, stock_quantity, status, is_published, tags, attributes, images, created_at, updated_at
      FROM products
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
    `;
    return this.query<Product>(sql, [limit, offset]);
  }

  async findProductById(id: number): Promise<Product | null> {
    const sql = `
      SELECT id, sku, name, slug, category_id, description, short_description, specifications, colors, base_price, 
             discount_price, stock_quantity, status, is_published, tags, attributes, images, created_at, updated_at
      FROM products
      WHERE id = $1
    `;
    return this.queryOne<Product>(sql, [id]);
  }

  async updateProduct(
    id: number,
    dto: UpdateProductDto,
  ): Promise<Product | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    const fieldsMapping: Record<string, string> = {
      sku: 'sku',
      name: 'name',
      slug: 'slug',
      category_id: 'category_id',
      description: 'description',
      short_description: 'short_description',
      specifications: 'specifications',
      colors: 'colors',
      base_price: 'base_price',
      discount_price: 'discount_price',
      stock_quantity: 'stock_quantity',
      status: 'status',
      is_published: 'is_published',
      tags: 'tags',
      attributes: 'attributes',
      images: 'images',
    };

    const dtoRecord = dto as Record<string, any>;
    for (const key of Object.keys(fieldsMapping)) {
      if (dtoRecord[key] !== undefined) {
        updates.push(`${fieldsMapping[key]} = $${paramIndex++}`);
        if (key === 'attributes' || key === 'colors') {
          params.push(JSON.stringify(dtoRecord[key]));
        } else {
          params.push(dtoRecord[key]);
        }
      }
    }

    if (updates.length === 0) {
      return this.findProductById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    const sql = `
      UPDATE products
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, sku, name, slug, category_id, description, short_description, specifications, colors, base_price, 
                discount_price, stock_quantity, status, is_published, tags, attributes, images, created_at, updated_at
    `;
    return this.queryOne<Product>(sql, params);
  }

  async deleteProduct(id: number): Promise<boolean> {
    const sql = `DELETE FROM products WHERE id = $1 RETURNING id`;
    const res = await this.queryOne<{ id: number }>(sql, [id]);
    return !!res;
  }
}
