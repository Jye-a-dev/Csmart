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
