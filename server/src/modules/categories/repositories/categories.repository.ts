import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/base.repository';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';

@Injectable()
export class CategoriesRepository extends BaseRepository {
  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const sql = `
      INSERT INTO categories (name, slug, description, parent_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, slug, description, parent_id, created_at
    `;
    const params = [
      dto.name,
      dto.slug,
      dto.description || null,
      dto.parent_id || null,
    ];
    return (await this.queryOne<Category>(sql, params))!;
  }

  async findAllCategories(limit = 10, offset = 0): Promise<Category[]> {
    const sql = `
      SELECT id, name, slug, description, parent_id, created_at
      FROM categories
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
    `;
    return this.query<Category>(sql, [limit, offset]);
  }

  async findCategoryById(id: number): Promise<Category | null> {
    const sql = `
      SELECT id, name, slug, description, parent_id, created_at
      FROM categories
      WHERE id = $1
    `;
    return this.queryOne<Category>(sql, [id]);
  }

  async updateCategory(
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<Category | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(dto.name);
    }
    if (dto.slug !== undefined) {
      updates.push(`slug = $${paramIndex++}`);
      params.push(dto.slug);
    }
    if (dto.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(dto.description);
    }
    if (dto.parent_id !== undefined) {
      updates.push(`parent_id = $${paramIndex++}`);
      params.push(dto.parent_id);
    }

    if (updates.length === 0) {
      return this.findCategoryById(id);
    }

    params.push(id);
    const sql = `
      UPDATE categories
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, slug, description, parent_id, created_at
    `;
    return this.queryOne<Category>(sql, params);
  }

  async deleteCategory(id: number): Promise<boolean> {
    const sql = `DELETE FROM categories WHERE id = $1 RETURNING id`;
    const res = await this.queryOne<{ id: number }>(sql, [id]);
    return !!res;
  }
}
