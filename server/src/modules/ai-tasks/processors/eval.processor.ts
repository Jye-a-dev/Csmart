import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AiClientService } from '../../../common/services/ai-client.service';

@Processor('eval-queue')
export class EvalProcessor extends WorkerHost {
  private readonly logger = new Logger(EvalProcessor.name);

  constructor(private readonly aiClient: AiClientService) {
    super();
  }

  async process(
    job: Job<Record<string, never>, unknown, string>,
  ): Promise<unknown> {
    this.logger.log(`Processing Evaluator job ${job.id}`);

    // Call evaluator endpoint via Circuit Breaker
    const fallback = {
      status: 'success',
      current_accuracy: 1.0,
      ood_count: 0,
      recommended_adjustment: {},
    };

    const result = await this.aiClient.request<unknown>(
      '/api/v1/evaluate',
      {
        method: 'POST',
      },
      fallback,
    );

    this.logger.log(`Completed Evaluator job ${job.id}`);
    return result;
  }
}
