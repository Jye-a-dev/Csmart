import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AiTasksService {
  private readonly logger = new Logger(AiTasksService.name);

  constructor(
    @InjectQueue('ocr-queue') private readonly ocrQueue: Queue,
    @InjectQueue('eval-queue') private readonly evalQueue: Queue,
  ) {}

  async addOcrJob(
    filename: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<string> {
    // We store the file buffer as a base64 string in the job data since Redis stores serializable objects
    const job = await this.ocrQueue.add('process-ocr', {
      filename,
      fileBase64: fileBuffer.toString('base64'),
      contentType,
    });
    this.logger.log(`Added OCR job: ${job.id} for file ${filename}`);
    return job.id!;
  }

  async addEvalJob(): Promise<string> {
    const job = await this.evalQueue.add('process-eval', {});
    this.logger.log(`Added Evaluator job: ${job.id}`);
    return job.id!;
  }

  async getJobStatus(queueName: 'ocr' | 'eval', jobId: string) {
    const queue = queueName === 'ocr' ? this.ocrQueue : this.evalQueue;
    const job = await queue.getJob(jobId);

    if (!job) {
      throw new NotFoundException(
        `Job ${jobId} not found in ${queueName} queue`,
      );
    }

    const state = await job.getState();
    const processedOnVal = job.processedOn;
    const finishedOnVal = job.finishedOn;

    return {
      id: job.id,
      state,
      progress: job.progress,
      failedReason: job.failedReason,
      returnValue: job.returnvalue as unknown,
      timestamp: new Date(job.timestamp).toISOString(),
      processedOn: processedOnVal ? new Date(processedOnVal).toISOString() : null,
      finishedOn: finishedOnVal ? new Date(finishedOnVal).toISOString() : null,
    };
  }
}
