import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { HitlRepository } from './repositories/hitl.repository';
import {
  EnqueueReviewDto,
  ApproveReviewDto,
  RejectReviewDto,
  LabelReviewDto,
} from './dto/hitl.dto';
import { ReviewQueueItem, HitlStatus } from './entities/review-queue.entity';

@Injectable()
export class HitlService {
  constructor(private readonly hitlRepository: HitlRepository) {}

  /** Đưa vào hàng đợi review (gọi nội bộ từ AiProxyService) */
  async enqueue(dto: EnqueueReviewDto): Promise<ReviewQueueItem> {
    return this.hitlRepository.enqueue(dto);
  }

  /** Lấy danh sách review queue, có thể lọc theo status */
  async findAll(
    status?: HitlStatus,
    limit = 20,
    offset = 0,
  ): Promise<ReviewQueueItem[]> {
    return this.hitlRepository.findAll(status, limit, offset);
  }

  async count(status?: HitlStatus): Promise<number> {
    return this.hitlRepository.countByStatus(status);
  }

  async findOne(id: number): Promise<ReviewQueueItem> {
    const item = await this.hitlRepository.findById(id);
    if (!item) throw new NotFoundException(`Review item #${id} not found`);
    return item;
  }

  /** Admin/Support duyệt → APPROVED */
  async approve(
    id: number,
    reviewerId: number,
    dto: ApproveReviewDto,
  ): Promise<ReviewQueueItem> {
    await this.findOne(id);
    return (await this.hitlRepository.approve(
      id,
      reviewerId,
      dto.reviewer_note,
    ))!;
  }

  /** Admin/Support từ chối → REJECTED */
  async reject(
    id: number,
    reviewerId: number,
    dto: RejectReviewDto,
  ): Promise<ReviewQueueItem> {
    await this.findOne(id);
    return (await this.hitlRepository.reject(
      id,
      reviewerId,
      dto.reviewer_note,
    ))!;
  }

  /** Admin gán nhãn đúng → LABELLED */
  async label(
    id: number,
    reviewerId: number,
    dto: LabelReviewDto,
  ): Promise<ReviewQueueItem> {
    const item = await this.findOne(id);
    if (item.status === 'APPROVED') {
      throw new BadRequestException('Cannot label an already approved item');
    }
    return (await this.hitlRepository.label(
      id,
      reviewerId,
      dto.corrected_label,
      dto.reviewer_note,
    ))!;
  }

  /**
   * Export tất cả LABELLED records → chuỗi JSONL theo Qwen2.5 ChatML format.
   * Mỗi dòng: {"messages": [{"role":"user","content":"..."}, {"role":"assistant","content":"..."}]}
   */
  async exportFineTuneDataset(): Promise<string> {
    const items = await this.hitlRepository.findLabelled();

    const lines = items.map((item) => {
      const userContent = item.input_text ?? JSON.stringify(item.output_json);
      const assistantContent =
        item.corrected_label ?? JSON.stringify(item.output_json);

      const record = {
        messages: [
          { role: 'user', content: userContent },
          { role: 'assistant', content: assistantContent },
        ],
        metadata: {
          endpoint: item.endpoint,
          original_confidence: item.confidence_score,
          reviewer_note: item.reviewer_note ?? null,
          reviewed_at: item.reviewed_at,
        },
      };
      return JSON.stringify(record);
    });

    return lines.join('\n');
  }
}
