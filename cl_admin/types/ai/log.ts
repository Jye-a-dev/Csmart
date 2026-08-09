export interface AiRequestLog {
  id: number;
  endpoint: string;
  user_id?: number;
  input_text?: string;
  output_json: Record<string, unknown>;
  confidence_score?: number;
  flag_for_review: boolean;
  execution_time_ms?: number;
  created_at: string;
}

export interface CreateAiRequestLogDto {
  endpoint: string;
  user_id?: number;
  input_text?: string;
  output_json: Record<string, unknown>;
  confidence_score?: number;
  flag_for_review?: boolean;
  execution_time_ms?: number;
}

export type UpdateAiRequestLogDto = Partial<CreateAiRequestLogDto>;
