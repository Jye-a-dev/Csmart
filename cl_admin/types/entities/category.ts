export interface Category {
  id: string; // UUID
  name: string;
  slug: string;
  description?: string;
  parent_id?: string; // UUID reference to parent category
  created_at: string;
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string; // UUID
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
