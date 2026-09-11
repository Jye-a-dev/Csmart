import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { HitlRepository } from './hitl.repository';
import {
  EnqueueReviewDto,
  ApproveReviewDto,
  RejectReviewDto,
  LabelReviewDto,
} from './dto/hitl.dto';
import { ReviewQueueItem, HitlStatus } from './review-queue.entity';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../orders/order.entity';
import { OcrRecordsService } from '../ocr-records/ocr-records.service';

@Injectable()
export class HitlService {
  private readonly logger = new Logger(HitlService.name);

  constructor(
    private readonly hitlRepository: HitlRepository,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
    @Inject(forwardRef(() => OcrRecordsService))
    private readonly ocrRecordsService: OcrRecordsService,
  ) {}

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

  async findOne(id: string): Promise<ReviewQueueItem> {
    const item = await this.hitlRepository.findById(id);
    if (!item) throw new NotFoundException(`Review item #${id} not found`);
    return item;
  }

  /** Admin/Support duyệt → APPROVED và kích hoạt luồng nghiệp vụ thực tế */
  async approve(
    id: string,
    reviewerId: string,
    dto: ApproveReviewDto,
  ): Promise<ReviewQueueItem> {
    const item = await this.findOne(id);

    // Business Automation 1: NER Slot Approval Execution
    if (item.endpoint === 'extract-ner' && item.output_json) {
      const output = item.output_json as Record<string, any>;
      const intent = output.intent;
      const slots = output.slots || {};
      const orderIdentifier = slots.order_id || (slots.order_ids && slots.order_ids[0]);

      if (orderIdentifier) {
        try {
          if (intent === 'CANCEL_ORDER') {
            await this.ordersService.update(orderIdentifier, {
              status: OrderStatus.CANCELLED,
              cancel_reason: dto.reviewer_note || 'Hủy đơn qua AI NER (HITL Approved)',
            });
            this.logger.log(`[HITL Action] Order ${orderIdentifier} cancelled on approval.`);
          } else if (intent === 'UPDATE_ADDRESS' && slots.new_address) {
            await this.ordersService.update(orderIdentifier, {
              shipping_address: slots.new_address,
              note: `Địa chỉ cập nhật từ AI NER (HITL #${id})`,
            });
            this.logger.log(`[HITL Action] Order ${orderIdentifier} address updated to: ${slots.new_address}`);
          }
        } catch (actionErr) {
          this.logger.error(`Failed to execute downstream order action for HITL #${id}: ${actionErr}`);
        }
      }
    }

    // Business Automation 2: OCR Label Verification State
    if (item.endpoint === 'extract-ocr' && item.output_json) {
      const ocrRecordId = (item.output_json as Record<string, any>).ocr_record_id;
      if (ocrRecordId) {
        try {
          await this.ocrRecordsService.update(ocrRecordId, { status: 'VERIFIED' });
          this.logger.log(`[HITL Action] OCR record ${ocrRecordId} marked as VERIFIED.`);
        } catch (ocrErr) {
          this.logger.error(`Failed to update OCR record status for HITL #${id}: ${ocrErr}`);
        }
      }
    }

    return (await this.hitlRepository.approve(
      id,
      reviewerId,
      dto.reviewer_note,
    ))!;
  }

  /** Admin/Support từ chối → REJECTED */
  async reject(
    id: string,
    reviewerId: string,
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
    id: string,
    reviewerId: string,
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
