export interface Faq {
  id: string;
  topic: string;
  question: string;
  answer: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateFaqDto {
  topic: string;
  question: string;
  answer: string;
  is_active?: boolean;
}

export type UpdateFaqDto = Partial<CreateFaqDto>;
