import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AiClientService } from '../../../common/services/ai-client.service';

interface OcrJobData {
  filename: string;
  fileBase64: string;
  contentType: string;
}

@Processor('ocr-queue')
export class OcrProcessor extends WorkerHost {
  private readonly logger = new Logger(OcrProcessor.name);

  constructor(private readonly aiClient: AiClientService) {
    super();
  }

  async process(job: Job<OcrJobData, unknown, string>): Promise<unknown> {
    this.logger.log(`Processing OCR job ${job.id}`);
    const { filename, fileBase64, contentType } = job.data;
    const buffer = Buffer.from(fileBase64, 'base64');

    // Create form data using native FormData
    const formData = new FormData();
    const blob = new Blob([buffer], { type: contentType });
    formData.append('file', blob, filename);

    // Call OCR endpoint via Circuit Breaker
    const fallback = {
      success: true,
      status: 'success',
      extracted_words: ['Mock', 'Fallback', 'Local', 'Brand'],
      raw_text: 'Mock Fallback Local Brand',
      confidence_score: 0.5,
      flag_for_review: true,
      data: {
        name: 'Mock Fallback Local Brand',
        price: 350000,
        color: 'Mock',
        raw_text: 'Mock Fallback Local Brand',
      },
    };

    const result = await this.aiClient.request<unknown>(
      '/api/v1/extract-ocr',
      {
        method: 'POST',
        body: formData,
      },
      fallback,
    );

    this.logger.log(`Completed OCR job ${job.id}`);
    return result;
  }
}
