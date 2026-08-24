export type HitlStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'LABELLED';

export interface HitlItem {
  id: string;
  log_id?: string;
  endpoint: string;
  user_id?: string;
  input_text?: string;
  output_json: Record<string, unknown>;
  confidence_score?: number;
  reviewer_id?: string;
  status: HitlStatus;
  reviewer_note?: string;
  corrected_label?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface ApproveReviewDto {
  reviewer_note?: string;
}

export interface RejectReviewDto {
  reviewer_note?: string;
}

export interface LabelReviewDto {
  corrected_label: string;
  reviewer_note?: string;
}
