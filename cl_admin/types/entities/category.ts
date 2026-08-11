export interface Category {
  id: string; // UUID
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null; // UUID reference to parent category
  image_url_1?: string | null;
  image_url_2?: string | null;
  created_at: string;
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null; // UUID
  image_url_1?: string | null;
  image_url_2?: string | null;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

