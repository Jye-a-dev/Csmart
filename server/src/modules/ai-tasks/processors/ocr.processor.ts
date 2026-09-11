import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AiClientService } from '../../../common/services/ai-client.service';
import { OcrRecordsService } from '../../ocr-records/ocr-records.service';
import { HitlService } from '../../hitl/hitl.service';

interface OcrJobData {
  filename: string;
  fileBase64: string;
  contentType: string;
  userId?: string;
}

interface UniversalOcrEntities {
  name: string | null;
  category: string | null;
  brand: string | null;
  sku_barcode: string | null;
  unit_price: number | null;
  origin: string | null;
  size_dimension: string | null;
  color: string | null;
  specifications: Record<string, any>;
}

interface OcrResult {
  success: boolean;
  status: string;
  extracted_words: string[];
  raw_text: string;
  confidence_score: number;
  flag_for_review: boolean;
  entities?: UniversalOcrEntities;
  data: {
    name: string;
    origin?: string;
    type?: string;
    color: string;
    price: number;
    raw_text: string;
  };
  similar_products: unknown[];
}

@Processor('ocr-queue')
export class OcrProcessor extends WorkerHost {
  private readonly logger = new Logger(OcrProcessor.name);

  constructor(
    private readonly aiClient: AiClientService,
    private readonly ocrRecordsService: OcrRecordsService,
    private readonly hitlService: HitlService,
  ) {
    super();
  }

  async process(job: Job<OcrJobData, unknown, string>): Promise<unknown> {
    this.logger.log(
      `Processing OCR job ${job.id} for file: ${job.data.filename}`,
    );
    const startTime = Date.now();
    const { filename, fileBase64, contentType, userId } = job.data;
    const buffer = Buffer.from(fileBase64, 'base64');

    // Create form data using native FormData
    const formData = new FormData();
    const blob = new Blob([buffer], { type: contentType });
    formData.append('file', blob, filename);

    // Production Fail-Safe: Zero confidence, explicit failure indicators
    const failSafeFallback: OcrResult = {
      success: false,
      status: 'failed',
      extracted_words: [],
      raw_text: '',
      confidence_score: 0.0,
      flag_for_review: true,
      data: {
        name: 'Inference Failure / Unrecognized Document',
        origin: '',
        type: '',
        color: '',
        price: 0,
        raw_text: '',
      },
      similar_products: [],
    };

    // Call OCR endpoint via Circuit Breaker
    const result = await this.aiClient.request<OcrResult>(
      '/api/v1/extract-ocr',
      { method: 'POST', body: formData },
      failSafeFallback,
    );

    const executionTimeMs = Date.now() - startTime;
    const isReliable =
      result.status === 'success' &&
      result.confidence_score >= 0.70 &&
      !result.flag_for_review;

    // Persist kết quả vào bảng ocr_records để Admin có thể tra cứu
    try {
      const persistedRecord = await this.ocrRecordsService.create({
        document_type: result.entities?.category || 'PRODUCT_LABEL',
        order_code: result.entities?.sku_barcode || `OCR-JOB-${job.id ?? Date.now()}`,
        customer_name: result.entities?.name || result.data?.name || 'Unknown',
        confidence_score: result.confidence_score ?? 0,
        status: isReliable ? 'VERIFIED' : 'PENDING_REVIEW',
        raw_text_chunks: result.extracted_words ?? [],
        execution_time_ms: executionTimeMs,
        extracted_items: [
          {
            name: result.entities?.name || result.data?.name || 'Unknown',
            unit_price: result.entities?.unit_price || result.data?.price || 0,
            quantity: 1,
          },
        ],
      });
      this.logger.log(`OCR job ${job.id} persisted to ocr_records (id: ${persistedRecord.id}).`);

      // Tự động đẩy vào HITL Review Queue nếu độ tin cậy thấp hoặc lỗi
      if (!isReliable) {
        await this.hitlService.enqueue({
          endpoint: 'extract-ocr',
          user_id: userId,
          input_text: `File: ${filename} (Job #${job.id})`,
          output_json: {
            ...result,
            ocr_record_id: persistedRecord.id,
          },
          confidence_score: result.confidence_score ?? 0,
        });
        this.logger.warn(`OCR job ${job.id} dispatched to ai_review_queue (Confidence: ${result.confidence_score}).`);
      }
    } catch (err) {
      this.logger.error(
        `Failed to persist or review OCR result for job ${job.id}: ${String(err)}`,
      );
    }

    this.logger.log(`Completed OCR job ${job.id}`);
    return result;
  }
}
