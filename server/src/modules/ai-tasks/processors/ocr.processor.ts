import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AiClientService } from '../../../common/services/ai-client.service';
import { OcrRecordsService } from '../../ocr-records/ocr-records.service';

interface OcrJobData {
  filename: string;
  fileBase64: string;
  contentType: string;
}

interface OcrResult {
  success: boolean;
  status: string;
  extracted_words: string[];
  raw_text: string;
  confidence_score: number;
  flag_for_review: boolean;
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
  ) {
    super();
  }

  async process(job: Job<OcrJobData, unknown, string>): Promise<unknown> {
    this.logger.log(
      `Processing OCR job ${job.id} for file: ${job.data.filename}`,
    );
    const startTime = Date.now();
    const { filename, fileBase64, contentType } = job.data;
    const buffer = Buffer.from(fileBase64, 'base64');

    // Create form data using native FormData
    const formData = new FormData();
    const blob = new Blob([buffer], { type: contentType });
    formData.append('file', blob, filename);

    const fallback: OcrResult = {
      success: true,
      status: 'success',
      extracted_words: ['Mock', 'Fallback', 'Local', 'Brand'],
      raw_text: 'Mock Fallback Local Brand',
      confidence_score: 0.5,
      flag_for_review: true,
      data: {
        name: 'Mock Fallback Local Brand',
        origin: 'Việt Nam',
        type: 'áo',
        price: 350000,
        color: 'Mock',
        raw_text: 'Mock Fallback Local Brand',
      },
      similar_products: [],
    };

    // Call OCR endpoint via Circuit Breaker
    const result = await this.aiClient.request<OcrResult>(
      '/api/v1/extract-ocr',
      { method: 'POST', body: formData },
      fallback,
    );

    const executionTimeMs = Date.now() - startTime;

    // Persist kết quả vào bảng ocr_records để Admin có thể tra cứu
    try {
      await this.ocrRecordsService.create({
        document_type: 'PRODUCT_LABEL',
        order_code: `OCR-JOB-${job.id ?? Date.now()}`,
        customer_name: result.data?.name ?? 'Unknown',
        confidence_score: result.confidence_score ?? 0,
        status: result.status === 'success' ? 'VERIFIED' : 'FAILED',
        raw_text_chunks: result.extracted_words ?? [],
        execution_time_ms: executionTimeMs,
        extracted_items: [
          {
            name: result.data?.name ?? 'Unknown',
            origin: result.data?.origin ?? 'Việt Nam',
            type: result.data?.type ?? 'áo',
            color: result.data?.color ?? 'Đen',
            price: result.data?.price ?? 0,
          },
        ],
      });
      this.logger.log(`OCR job ${job.id} persisted to ocr_records.`);
    } catch (err) {

      // Persist thất bại không nên làm fail toàn bộ job
      this.logger.error(
        `Failed to persist OCR result for job ${job.id}: ${String(err)}`,
      );
    }

    this.logger.log(`Completed OCR job ${job.id}`);
    return result;
  }
}
