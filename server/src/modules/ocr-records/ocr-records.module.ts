import { Module } from '@nestjs/common';
import { OcrRecordsService } from './ocr-records.service';
import { OcrRecordsController } from './ocr-records.controller';
import { OcrRecordsRepository } from './repositories/ocr-records.repository';

@Module({
  controllers: [OcrRecordsController],
  providers: [OcrRecordsService, OcrRecordsRepository],
  exports: [OcrRecordsService, OcrRecordsRepository],
})
export class OcrRecordsModule {}
