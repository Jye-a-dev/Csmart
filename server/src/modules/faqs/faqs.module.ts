import { Module } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';
import { FaqsRepository } from './repositories/faqs.repository';

@Module({
  controllers: [FaqsController],
  providers: [FaqsService, FaqsRepository],
  exports: [FaqsService, FaqsRepository],
})
export class FaqsModule {}
