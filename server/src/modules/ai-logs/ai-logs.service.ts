import { Injectable, NotFoundException } from '@nestjs/common';
import { AiLogsRepository } from './repositories/ai-logs.repository';
import { CreateAiRequestLogDto, UpdateAiRequestLogDto } from './dto/ai-log.dto';
import { AiRequestLog } from './entities/ai-log.entity';

@Injectable()
export class AiLogsService {
  constructor(private readonly aiLogsRepository: AiLogsRepository) {}

  async create(dto: CreateAiRequestLogDto): Promise<AiRequestLog> {
    return this.aiLogsRepository.createLog(dto);
  }

  async findAll(limit?: number, offset?: number): Promise<AiRequestLog[]> {
    return this.aiLogsRepository.findAllLogs(limit, offset);
  }

  async findOne(id: string): Promise<AiRequestLog> {
    const log = await this.aiLogsRepository.findLogById(id);
    if (!log) {
      throw new NotFoundException(`AI request log with ID ${id} not found`);
    }
    return log;
  }

  async update(id: string, dto: UpdateAiRequestLogDto): Promise<AiRequestLog> {
    await this.findOne(id);
    const updated = await this.aiLogsRepository.updateLog(id, dto);
    if (!updated) {
      throw new NotFoundException(`AI request log with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.aiLogsRepository.deleteLog(id);
  }

  async removeAll(): Promise<number> {
    return this.aiLogsRepository.deleteAllLogs();
  }

  async countAll(): Promise<number> {
    return this.aiLogsRepository.countAll('ai_request_logs');
  }

  async countBy(filters: Record<string, any>): Promise<number> {
    return this.aiLogsRepository.countBy('ai_request_logs', filters);
  }

  async updateReviewId(logId: string, reviewId: string): Promise<void> {
    return this.aiLogsRepository.updateReviewId(logId, reviewId);
  }

  async findCorrectedLog(
    endpoint: string,
    inputText: string,
  ): Promise<AiRequestLog | null> {
    return this.aiLogsRepository.findCorrectedLog(endpoint, inputText);
  }
}
