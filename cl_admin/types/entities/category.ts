export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  created_at: string;
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
