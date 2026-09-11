import { Module, forwardRef } from '@nestjs/common';
import { HitlService } from './hitl.service';
import { HitlController } from './hitl.controller';
import { HitlRepository } from './hitl.repository';
import { OrdersModule } from '../orders/orders.module';
import { OcrRecordsModule } from '../ocr-records/ocr-records.module';

@Module({
  imports: [forwardRef(() => OrdersModule), OcrRecordsModule],
  controllers: [HitlController],
  providers: [HitlService, HitlRepository],
  exports: [HitlService],
})
export class HitlModule {}
