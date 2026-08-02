import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './repositories/categories.repository';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesRepository.createCategory(dto);
  }

  async findAll(limit?: number, offset?: number): Promise<Category[]> {
    return this.categoriesRepository.findAllCategories(limit, offset);
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findCategoryById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    await this.findOne(id);
    const updated = await this.categoriesRepository.updateCategory(id, dto);
    if (!updated) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.categoriesRepository.deleteCategory(id);
  }

  async countAll(): Promise<number> {
    return this.categoriesRepository.countAll('categories');
  }

  async countBy(filters: Record<string, any>): Promise<number> {
    return this.categoriesRepository.countBy('categories', filters);
  }
}
