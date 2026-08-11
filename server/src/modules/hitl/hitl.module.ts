import { Module } from '@nestjs/common';
import { HitlService } from './hitl.service';
import { HitlController } from './hitl.controller';
import { HitlRepository } from './repositories/hitl.repository';

@Module({
  controllers: [HitlController],
  providers: [HitlService, HitlRepository],
  exports: [HitlService],
})
export class HitlModule {}
