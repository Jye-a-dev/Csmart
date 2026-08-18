import { Injectable, NotFoundException } from '@nestjs/common';
import { OcrRecordsRepository } from './repositories/ocr-records.repository';
import { CreateOcrRecordDto, UpdateOcrRecordDto } from './dto/ocr-record.dto';
import { OcrRecord } from './entities/ocr-record.entity';

@Injectable()
export class OcrRecordsService {
  constructor(private readonly ocrRecordsRepository: OcrRecordsRepository) {}

  async create(dto: CreateOcrRecordDto): Promise<OcrRecord> {
    return this.ocrRecordsRepository.createRecord(dto);
  }

  async findAll(
    limit = 50,
    offset = 0,
    documentType?: string,
    status?: string,
    search?: string,
  ): Promise<OcrRecord[]> {
    return this.ocrRecordsRepository.findAllRecords(
      limit,
      offset,
      documentType,
      status,
      search,
    );
  }

  async findOne(id: string): Promise<OcrRecord> {
    const record = await this.ocrRecordsRepository.findRecordById(id);
    if (!record) {
      throw new NotFoundException(`OCR Record #${id} not found`);
    }
    return record;
  }

  async update(id: string, dto: UpdateOcrRecordDto): Promise<OcrRecord> {
    const existing = await this.ocrRecordsRepository.findRecordById(id);
    if (!existing) {
      return this.ocrRecordsRepository.createRecord({
        ...dto,
        order_code: dto.order_code || `ORD-${Date.now()}`,
        customer_name: dto.customer_name || 'Khách hàng',
      });
    }
    const updated = await this.ocrRecordsRepository.updateRecord(id, dto);
    return updated || existing;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const deleted = await this.ocrRecordsRepository.deleteRecord(id);
    if (!deleted) {
      throw new NotFoundException(`OCR Record #${id} not found for deletion`);
    }
    return {
      success: true,
      message: `OCR record ${id} hard deleted permanently`,
    };
  }

  async countAll(): Promise<number> {
    return this.ocrRecordsRepository.countAll('ocr_records');
  }
}
