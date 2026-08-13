import { Injectable, NotFoundException } from '@nestjs/common';
import { FaqsRepository } from './repositories/faqs.repository';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { Faq } from './entities/faq.entity';

@Injectable()
export class FaqsService {
  constructor(private readonly faqsRepository: FaqsRepository) {}

  async create(dto: CreateFaqDto): Promise<Faq> {
    return this.faqsRepository.createFaq(dto);
  }

  async findAll(limit?: number, offset?: number): Promise<Faq[]> {
    return this.faqsRepository.findAllFaqs(limit, offset);
  }

  async findOne(id: string): Promise<Faq> {
    const faq = await this.faqsRepository.findFaqById(id);
    if (!faq) {
      throw new NotFoundException(`Faq with ID ${id} not found`);
    }
    return faq;
  }

  async update(id: string, dto: UpdateFaqDto): Promise<Faq> {
    await this.findOne(id);
    const updated = await this.faqsRepository.updateFaq(id, dto);
    if (!updated) {
      throw new NotFoundException(`Faq with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.faqsRepository.deleteFaq(id);
  }

  async countAll(): Promise<number> {
    return this.faqsRepository.countAll('faqs');
  }

  async countBy(filters: Record<string, any>): Promise<number> {
    return this.faqsRepository.countBy('faqs', filters);
  }
}
