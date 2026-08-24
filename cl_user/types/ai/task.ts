export interface IntentRequestDto {
  query: string;
}

export interface IntentResponseDto {
  success: boolean;
  status: string;
  query: string;
  intent: 'SEARCH_PRODUCT' | 'CANCEL_ORDER' | 'ASK_FAQ' | 'UNKNOWN';
  entities: Record<string, unknown>;
  confidence_score: number;
  flag_for_review: boolean;
}

export interface NerRequestDto {
  text: string;
}

export interface NerSlots {
  order_id?: string | null;
  order_ids?: string[] | null;
  new_address?: string | null;
}

export interface NerResponseDto {
  status: string;
  intent: string;
  slots: NerSlots;
  confidence_score: number;
  flag_for_review: boolean;
}

export interface SearchRequestDto {
  query: string;
  limit?: number;
}

export interface SqlRequestDto {
  question: string;
}

export interface SubmitOcrResponse {
  success: boolean;
  jobId: string;
  message: string;
}

export interface SubmitEvaluateResponse {
  success: boolean;
  jobId: string;
  message: string;
}

export interface JobStatusResponse {
  id: string;
  status?: string;
  state?: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress?: number;
  result?: unknown;
  returnValue?: unknown;
  failedReason?: string;
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failuresCount: number;
  lastFailureTime: number | null;
}
