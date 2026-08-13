export interface AiRequestLog {
  id: string;
  endpoint: string;
  user_id?: string;
  input_text?: string;
  output_json: Record<string, unknown>;
  corrected_output?: Record<string, unknown> | string;
  confidence_score?: number;
  flag_for_review: boolean;
  execution_time_ms?: number;
  review_id?: string;
  created_at: string;
}

export interface CreateAiRequestLogDto {
  endpoint: string;
  user_id?: string;
  input_text?: string;
  output_json: Record<string, unknown>;
  corrected_output?: Record<string, unknown> | string;
  confidence_score?: number;
  flag_for_review?: boolean;
  execution_time_ms?: number;
  review_id?: string;
}

export type UpdateAiRequestLogDto = Partial<CreateAiRequestLogDto>;
