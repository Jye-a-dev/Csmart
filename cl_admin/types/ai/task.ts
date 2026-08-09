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
  status: string;
  progress?: number;
  result?: unknown;
  failedReason?: string;
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failuresCount: number;
  lastFailureTime: number | null;
}
